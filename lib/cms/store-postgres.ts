import 'server-only'

import { neon } from '@neondatabase/serverless'
import type { NewsArticle } from '@/lib/news-content'
import type { SiteCode } from '@/lib/site-content'
import { CMS_LOCALES, createEmptyContent, isContentComplete, type CmsArticleContent, type CmsArticleRecord, type CmsArticleStatus, type CmsArticleSummary, type CmsCategory } from './types'

type ArticleRow = Record<string, unknown>
type Sql = (query: string, parameters?: unknown[]) => Promise<ArticleRow[]>

let schemaReady: Promise<void> | undefined

function databaseUrl() {
  const value = process.env.CMS_DATABASE_URL
  if (!value) throw new Error('未配置 CMS_DATABASE_URL。')
  return value
}

function db(): Sql {
  const sql = neon(databaseUrl())
  return async (query, parameters = []) => await sql.query(query, parameters) as ArticleRow[]
}
function now() { return new Date().toISOString() }
function numeric(value: unknown) { return Number(value) }
function text(value: unknown) { return value == null ? '' : String(value) }

async function ready() {
  if (!schemaReady) schemaReady = (async () => {
    const sql = db()
    await sql(`CREATE TABLE IF NOT EXISTS cms_admin (id BIGSERIAL PRIMARY KEY, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, failed_login_count INTEGER NOT NULL DEFAULT 0, locked_until TIMESTAMPTZ, last_login_at TIMESTAMPTZ, is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`)
    await sql(`CREATE TABLE IF NOT EXISTS cms_session (id BIGSERIAL PRIMARY KEY, admin_id BIGINT NOT NULL REFERENCES cms_admin(id), token_hash TEXT NOT NULL UNIQUE, expires_at TIMESTAMPTZ NOT NULL, revoked_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`)
    await sql(`CREATE TABLE IF NOT EXISTS news_category (id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE, slug TEXT NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT 'ACTIVE', source TEXT NOT NULL DEFAULT 'MANUAL', sort_order INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`)
    await sql(`CREATE TABLE IF NOT EXISTS news_article (id BIGSERIAL PRIMARY KEY, slug TEXT NOT NULL UNIQUE, status TEXT NOT NULL, published_version_id BIGINT, draft_version_id BIGINT, category_id BIGINT REFERENCES news_category(id), published_at TIMESTAMPTZ, offline_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ, deleted_from_status TEXT, is_pinned BOOLEAN NOT NULL DEFAULT FALSE, pinned_position DOUBLE PRECISION, manual_position DOUBLE PRECISION, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`)
    await sql(`CREATE TABLE IF NOT EXISTS news_version (id BIGSERIAL PRIMARY KEY, article_id BIGINT NOT NULL REFERENCES news_article(id) ON DELETE CASCADE, version_no INTEGER NOT NULL, state TEXT NOT NULL, content_json JSONB NOT NULL, previewed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(article_id, version_no));`)
    await sql(`CREATE TABLE IF NOT EXISTS cms_audit_log (id BIGSERIAL PRIMARY KEY, admin_id BIGINT, action TEXT NOT NULL, target_type TEXT NOT NULL, target_id TEXT NOT NULL, detail_json JSONB, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`)
  })()
  return schemaReady
}

export async function ensurePostgresSchema() { await ready() }

function content(value: unknown): CmsArticleContent {
  const parsed = typeof value === 'string' ? JSON.parse(value) as Partial<CmsArticleContent> : value as Partial<CmsArticleContent>
  const fallback = createEmptyContent()
  CMS_LOCALES.forEach((locale) => { fallback[locale] = { ...fallback[locale], ...(parsed[locale] ?? {}), tags: parsed[locale]?.tags ?? [], sections: parsed[locale]?.sections ?? [], closing: parsed[locale]?.closing ?? [] } })
  return fallback
}

function record(row: ArticleRow): CmsArticleRecord {
  const data = content(row.content_json)
  return { id: numeric(row.id), slug: text(row.slug), status: text(row.status) as CmsArticleStatus, date: data.cn.date, category: data.cn.category, tags: data.cn.tags ?? [], cover: data.cn.cover, updatedAt: text(row.updated_at), publishedAt: row.published_at ? text(row.published_at) : null, localesComplete: isContentComplete(data), isPinned: Boolean(row.is_pinned), deletedAt: row.deleted_at ? text(row.deleted_at) : null, content: data, previewedAt: row.previewed_at ? text(row.previewed_at) : null, versionNo: numeric(row.version_no) }
}

async function articleRow(id: number) {
  await ready()
  const rows = await db()(`SELECT a.*, v.content_json, v.previewed_at, v.version_no, v.id AS selected_version_id FROM news_article a JOIN news_version v ON v.id = COALESCE(a.draft_version_id, a.published_version_id) WHERE a.id = $1`, [id])
  return rows[0] as ArticleRow | undefined
}

function categorySlug(value: string) { return value.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '') || `category-${Date.now()}` }

async function ensureCategory(name: string, source: CmsCategory['source'] = 'MANUAL') {
  const normalized = name.trim()
  if (!normalized) return null
  await ready()
  const sql = db()
  const existing = await sql('SELECT id FROM news_category WHERE name = $1', [normalized])
  if (existing[0]) return numeric(existing[0].id)
  const suffix = Math.random().toString(36).slice(2, 7)
  const rows = await sql(`INSERT INTO news_category (name, slug, status, source) VALUES ($1, $2, 'ACTIVE', $3) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`, [normalized, `${categorySlug(normalized)}-${suffix}`, source])
  return numeric(rows[0].id)
}

export async function listCmsArticles(status?: CmsArticleStatus): Promise<CmsArticleSummary[]> {
  await ready()
  const condition = status ? 'WHERE a.status = $1' : ''
  const rows = await db()(`SELECT a.*, v.content_json, v.previewed_at, v.version_no FROM news_article a JOIN news_version v ON v.id = COALESCE(a.draft_version_id, a.published_version_id) ${condition} ORDER BY a.is_pinned DESC, a.pinned_position, a.manual_position, a.published_at DESC, a.updated_at DESC`, status ? [status] : [])
  return (rows as ArticleRow[]).map((row) => { const { content: _content, previewedAt: _previewedAt, versionNo: _versionNo, ...summary } = record(row); return summary })
}

export async function getCmsArticle(id: number) { const row = await articleRow(id); return row ? record(row) : undefined }
export async function getCmsPreviewArticle(id: number, locale: SiteCode) { return (await getCmsArticle(id))?.content[locale] }

export async function getPublishedArticles(locale: SiteCode): Promise<NewsArticle[]> {
  await ready()
  const rows = await db()(`SELECT v.content_json FROM news_article a JOIN news_version v ON v.id = a.published_version_id WHERE a.status = 'PUBLISHED' ORDER BY a.is_pinned DESC, a.pinned_position, a.manual_position, a.published_at DESC, a.id DESC`)
  return (rows as ArticleRow[]).map((row) => content(row.content_json)[locale])
}
export async function getPublishedArticle(locale: SiteCode, slug: string) { return (await getPublishedArticles(locale)).find((item) => item.slug === slug) }

export async function writeAudit(adminId: number | null, action: string, targetType: string, targetId: string, detail: unknown) { await ready(); await db()('INSERT INTO cms_audit_log (admin_id, action, target_type, target_id, detail_json) VALUES ($1, $2, $3, $4, $5::jsonb)', [adminId, action, targetType, targetId, JSON.stringify(detail)]) }

export async function createCmsArticle(slug: string, adminId: number) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('文章路径仅支持小写字母、数字和连字符。')
  await ready(); const sql = db(); const article = await sql(`INSERT INTO news_article (slug, status) VALUES ($1, 'DRAFT') RETURNING id`, [slug]); const id = numeric(article[0].id)
  const version = await sql(`INSERT INTO news_version (article_id, version_no, state, content_json) VALUES ($1, 1, 'DRAFT', $2::jsonb) RETURNING id`, [id, JSON.stringify(createEmptyContent(slug))]); await sql('UPDATE news_article SET draft_version_id = $1, updated_at = NOW() WHERE id = $2', [numeric(version[0].id), id]); await writeAudit(adminId, 'CREATE_DRAFT', 'news_article', String(id), { slug }); return id
}

export async function updateCmsDraft(id: number, draft: CmsArticleContent, adminId: number) {
  const row = await articleRow(id); if (!row) throw new Error('新闻不存在。')
  const normalized = Object.fromEntries(CMS_LOCALES.map((locale) => [locale, { ...draft[locale], slug: text(row.slug) }])) as CmsArticleContent
  const categoryId = await ensureCategory(normalized.cn.category); const sql = db(); let versionId = numeric(row.selected_version_id); let versionNo = numeric(row.version_no)
  if (versionId === numeric(row.published_version_id)) { const version = await sql(`INSERT INTO news_version (article_id, version_no, state, content_json) VALUES ($1, $2, 'DRAFT', $3::jsonb) RETURNING id`, [id, versionNo + 1, JSON.stringify(normalized)]); versionId = numeric(version[0].id); await sql('UPDATE news_article SET draft_version_id = $1 WHERE id = $2', [versionId, id]) } else await sql('UPDATE news_version SET content_json = $1::jsonb, previewed_at = NULL, updated_at = NOW() WHERE id = $2', [JSON.stringify(normalized), versionId])
  await sql(`UPDATE news_article SET category_id = $1, status = CASE WHEN published_version_id IS NULL THEN 'DRAFT' ELSE status END, updated_at = NOW() WHERE id = $2`, [categoryId, id]); await writeAudit(adminId, 'SAVE_DRAFT', 'news_article', String(id), { versionId }); return getCmsArticle(id)
}

export async function markCmsPreviewed(id: number, adminId: number) { const row = await articleRow(id); if (!row) throw new Error('新闻草稿不存在。'); await db()('UPDATE news_version SET previewed_at = NOW(), updated_at = NOW() WHERE id = $1', [numeric(row.selected_version_id)]); await writeAudit(adminId, 'PREVIEW_DRAFT', 'news_article', String(id), {}) }
export async function publishCmsArticle(id: number, adminId: number, reviewed: boolean) { if (!reviewed) throw new Error('请先完成人工审核确认。'); const row = await articleRow(id); if (!row) throw new Error('新闻草稿不存在。'); if (!row.previewed_at) throw new Error('请先预览当前草稿。'); if (!isContentComplete(content(row.content_json))) throw new Error('CN、JP、HK 内容、封面和正文必须完整后才能发布。'); const sql = db(); await sql(`UPDATE news_version SET state = 'ARCHIVED', updated_at = NOW() WHERE id = $1 AND id <> $2`, [row.published_version_id ?? 0, row.selected_version_id]); await sql(`UPDATE news_version SET state = 'PUBLISHED', updated_at = NOW() WHERE id = $1`, [row.selected_version_id]); await sql(`UPDATE news_article SET status = 'PUBLISHED', published_version_id = $1, draft_version_id = NULL, published_at = NOW(), offline_at = NULL, updated_at = NOW() WHERE id = $2`, [row.selected_version_id, id]); await writeAudit(adminId, 'PUBLISH', 'news_article', String(id), {}) }
export async function offlineCmsArticle(id: number, adminId: number) { const sql = db(); const rows = await sql(`UPDATE news_article SET status = 'OFFLINE', offline_at = NOW(), updated_at = NOW() WHERE id = $1 AND status = 'PUBLISHED' RETURNING id`, [id]); if (!rows[0]) throw new Error('只有已发布新闻可以下线。'); await writeAudit(adminId, 'OFFLINE', 'news_article', String(id), {}) }

export async function listCmsCategories(): Promise<CmsCategory[]> { await ready(); return await db()(`SELECT id, name, slug, status, source FROM news_category ORDER BY (status = 'ACTIVE') DESC, sort_order, name`) as CmsCategory[] }
export async function createCmsCategory(name: string, adminId: number) { if (!name.trim()) throw new Error('分类名称不能为空。'); const id = await ensureCategory(name); await writeAudit(adminId, 'CREATE_CATEGORY', 'news_category', String(id), { name }); return (await listCmsCategories()).find((item) => item.id === id) }
export async function setCmsCategoryStatus(id: number, status: CmsCategory['status'], adminId: number) { await ready(); const rows = await db()('UPDATE news_category SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id', [status, id]); if (!rows[0]) throw new Error('分类不存在。'); await writeAudit(adminId, status === 'ACTIVE' ? 'RESTORE_CATEGORY' : 'DISABLE_CATEGORY', 'news_category', String(id), {}) }

export async function moveCmsArticleToTrash(id: number, adminId: number) { await ready(); const sql = db(); const rows = await sql(`UPDATE news_article SET status = 'TRASH', deleted_at = NOW(), deleted_from_status = status, is_pinned = FALSE, pinned_position = NULL, manual_position = NULL, updated_at = NOW() WHERE id = $1 AND status <> 'TRASH' RETURNING id`, [id]); if (!rows[0]) throw new Error('新闻不存在或已在回收站。'); await writeAudit(adminId, 'MOVE_TO_TRASH', 'news_article', String(id), {}) }
export async function restoreCmsArticle(id: number, adminId: number) { await ready(); const rows = await db()(`UPDATE news_article SET status = 'DRAFT', deleted_at = NULL, deleted_from_status = NULL, updated_at = NOW() WHERE id = $1 AND status = 'TRASH' RETURNING id`, [id]); if (!rows[0]) throw new Error('只有回收站稿件可以恢复。'); await writeAudit(adminId, 'RESTORE_FROM_TRASH', 'news_article', String(id), {}) }
export async function deleteCmsArticlePermanently(id: number, adminId: number) { await ready(); const rows = await db()(`DELETE FROM news_article WHERE id = $1 AND status = 'TRASH' RETURNING id`, [id]); if (!rows[0]) throw new Error('只有回收站稿件可以永久删除。'); await writeAudit(adminId, 'DELETE_PERMANENTLY', 'news_article', String(id), {}) }
export async function setCmsArticlePinned(id: number, pinned: boolean, adminId: number) { await ready(); const sql = db(); const result = await sql(`UPDATE news_article SET is_pinned = $1, pinned_position = CASE WHEN $1 THEN (SELECT COALESCE(MIN(pinned_position), 0) - 1 FROM news_article WHERE status = 'PUBLISHED' AND is_pinned = TRUE) ELSE NULL END, updated_at = NOW() WHERE id = $2 AND status = 'PUBLISHED' RETURNING id`, [pinned, id]); if (!result[0]) throw new Error('只有已发布稿件可以置顶。'); await writeAudit(adminId, pinned ? 'PIN_ARTICLE' : 'UNPIN_ARTICLE', 'news_article', String(id), {}) }
export async function reorderCmsPublishedArticles(ids: number[], adminId: number) { await ready(); const sql = db(); const rows = await sql(`SELECT id, is_pinned FROM news_article WHERE status = 'PUBLISHED'`); if (rows.length !== ids.length || new Set(ids).size !== ids.length || rows.some((row) => !ids.includes(numeric(row.id)))) throw new Error('排序必须包含全部已发布稿件。'); await Promise.all(ids.map(async (id, index) => { const row = rows.find((item) => numeric(item.id) === id)!; await sql('UPDATE news_article SET pinned_position = $1, manual_position = $2, updated_at = NOW() WHERE id = $3', [row.is_pinned ? index : null, row.is_pinned ? null : index, id]) })); await writeAudit(adminId, 'REORDER_PUBLISHED', 'news_article', 'published', { ids }) }

export async function importCmsArticle(draft: CmsArticleContent, sourceId: string) {
  const slug = draft.cn.slug.trim()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('导入稿件的 slug 仅支持小写字母、数字和连字符。')
  await ready()
  const existing = await db()('SELECT id FROM news_article WHERE slug = $1', [slug])
  const id = existing[0] ? numeric(existing[0].id) : await createCmsArticle(slug, 0)
  if (draft.cn.category.trim()) await ensureCategory(draft.cn.category, 'IMPORT')
  await updateCmsDraft(id, draft, 0)
  await writeAudit(null, existing[0] ? 'IMPORT_UPDATE_DRAFT' : 'IMPORT_CREATE_DRAFT', 'news_article', String(id), { sourceId })
  return id
}
