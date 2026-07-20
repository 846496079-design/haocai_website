import 'server-only'

import { neon } from '@neondatabase/serverless'
import { createHash } from 'node:crypto'
import type { SiteCode } from '@/lib/site-content'
import { prepareCmsContent } from './publication-server'
import { areAllLocalesReadyForPublication, createEmptyContent, isContentComplete, type CmsArticleContent, type CmsArticleRecord, type CmsArticleStatus, type CmsArticleSummary, type CmsAssetInput, type CmsAuditLog, type CmsCategory, type CmsImportResult, type CmsLocaleArticle } from './types'
import { assertCmsLocaleReadyForPublish } from './publish-validation'
import { requireCmsDatabaseUrl } from './config'

type ArticleRow = Record<string, unknown>
type Sql = (query: string, parameters?: unknown[]) => Promise<ArticleRow[]>

let schemaReady: Promise<void> | undefined

function client() { return neon(requireCmsDatabaseUrl()) }

function db(): Sql {
  const sql = client()
  return async (query, parameters = []) => await sql.query(query, parameters) as ArticleRow[]
}

async function atomic(query: string, parameters: unknown[] = []) {
  const sql = client()
  const [rows] = await sql.transaction((transaction) => [transaction.query(query, parameters)])
  return rows as ArticleRow[]
}
function now() { return new Date().toISOString() }
function numeric(value: unknown) { return Number(value) }
function text(value: unknown) { return value == null ? '' : String(value) }
function timestamp(value: unknown) {
  const date = value instanceof Date ? value : new Date(text(value))
  return Number.isNaN(date.getTime()) ? text(value) : date.toISOString()
}

async function ready() {
  if (!schemaReady) schemaReady = (async () => {
    const sql = db()
    const existing = await sql(`
      SELECT
        to_regclass('public.cms_admin') AS cms_admin,
        to_regclass('public.cms_asset') AS cms_asset,
        EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'news_article'
            AND column_name = 'translation_status'
        ) AS has_translation_status,
        EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'news_article'
            AND column_name = 'published_locales_complete'
        ) AS has_published_locales_complete
    `)
    if (existing[0]?.cms_admin && existing[0]?.cms_asset && existing[0]?.has_translation_status && existing[0]?.has_published_locales_complete) return
    await sql(`CREATE TABLE IF NOT EXISTS cms_admin (id BIGSERIAL PRIMARY KEY, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, failed_login_count INTEGER NOT NULL DEFAULT 0, locked_until TIMESTAMPTZ, last_login_at TIMESTAMPTZ, is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`)
    await sql(`CREATE TABLE IF NOT EXISTS cms_session (id BIGSERIAL PRIMARY KEY, admin_id BIGINT NOT NULL REFERENCES cms_admin(id), token_hash TEXT NOT NULL UNIQUE, expires_at TIMESTAMPTZ NOT NULL, revoked_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`)
    await sql(`CREATE TABLE IF NOT EXISTS news_category (id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE, slug TEXT NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT 'ACTIVE', source TEXT NOT NULL DEFAULT 'MANUAL', sort_order INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`)
    await sql(`CREATE TABLE IF NOT EXISTS news_article (id BIGSERIAL PRIMARY KEY, slug TEXT NOT NULL UNIQUE, status TEXT NOT NULL, published_version_id BIGINT, draft_version_id BIGINT, category_id BIGINT REFERENCES news_category(id), published_at TIMESTAMPTZ, offline_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ, deleted_from_status TEXT, is_pinned BOOLEAN NOT NULL DEFAULT FALSE, pinned_position DOUBLE PRECISION, manual_position DOUBLE PRECISION, translation_status TEXT NOT NULL DEFAULT 'NOT_TRANSLATED', published_locales_complete BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`)
    await sql(`ALTER TABLE news_article ADD COLUMN IF NOT EXISTS translation_status TEXT NOT NULL DEFAULT 'NOT_TRANSLATED';`)
    await sql(`ALTER TABLE news_article ADD COLUMN IF NOT EXISTS published_locales_complete BOOLEAN;`)
    await sql(`UPDATE news_article SET published_locales_complete = (status = 'PUBLISHED' AND published_version_id IS NOT NULL) WHERE published_locales_complete IS NULL;`)
    await sql(`ALTER TABLE news_article ALTER COLUMN published_locales_complete SET DEFAULT FALSE;`)
    await sql(`ALTER TABLE news_article ALTER COLUMN published_locales_complete SET NOT NULL;`)
    await sql(`CREATE TABLE IF NOT EXISTS news_version (id BIGSERIAL PRIMARY KEY, article_id BIGINT NOT NULL REFERENCES news_article(id) ON DELETE CASCADE, version_no INTEGER NOT NULL, state TEXT NOT NULL, content_json JSONB NOT NULL, previewed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(article_id, version_no));`)
    await sql(`CREATE TABLE IF NOT EXISTS cms_audit_log (id BIGSERIAL PRIMARY KEY, admin_id BIGINT, action TEXT NOT NULL, target_type TEXT NOT NULL, target_id TEXT NOT NULL, detail_json JSONB, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`)
    await sql(`CREATE TABLE IF NOT EXISTS integration_delivery (id BIGSERIAL PRIMARY KEY, source TEXT NOT NULL, external_id TEXT NOT NULL, idempotency_key TEXT NOT NULL, payload_hash TEXT NOT NULL, result JSONB, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(source, idempotency_key));`)
    await sql(`CREATE TABLE IF NOT EXISTS translation_job (id BIGSERIAL PRIMARY KEY, version_id BIGINT NOT NULL REFERENCES news_version(id) ON DELETE CASCADE, target_locale TEXT NOT NULL, status TEXT NOT NULL, provider TEXT NOT NULL, model TEXT NOT NULL, error_code TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`)
    await sql(`CREATE TABLE IF NOT EXISTS cms_asset (id TEXT PRIMARY KEY, article_id BIGINT REFERENCES news_article(id) ON DELETE SET NULL, blob_url TEXT NOT NULL, thumbnail_url TEXT, mime_type TEXT NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL, alt_text TEXT, usage TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());`)
  })()
  return schemaReady
}

export async function ensurePostgresSchema() { await ready() }

function content(value: unknown): CmsArticleContent {
  return prepareCmsContent(typeof value === 'string' ? JSON.parse(value) : value)
}

function record(row: ArticleRow): CmsArticleRecord {
  const data = content(row.content_json)
  return { id: numeric(row.id), slug: text(row.slug), title: data.cn.title, status: text(row.status) as CmsArticleStatus, date: data.cn.date, category: data.cn.category, tags: data.cn.tags ?? [], cover: data.cn.cover, updatedAt: timestamp(row.updated_at), publishedAt: row.published_at ? timestamp(row.published_at) : null, localesComplete: isContentComplete(data), translationStatus: text(row.translation_status || 'NOT_TRANSLATED') as CmsArticleRecord['translationStatus'], isPinned: Boolean(row.is_pinned), deletedAt: row.deleted_at ? timestamp(row.deleted_at) : null, content: data, previewedAt: row.previewed_at ? timestamp(row.previewed_at) : null, versionId: numeric(row.selected_version_id), versionNo: numeric(row.version_no) }
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
  const rows = await db()(`SELECT a.*, v.content_json, v.previewed_at, v.version_no, v.id AS selected_version_id FROM news_article a JOIN news_version v ON v.id = COALESCE(a.draft_version_id, a.published_version_id) ${condition} ORDER BY a.is_pinned DESC, a.pinned_position, a.manual_position, a.published_at DESC, a.updated_at DESC`, status ? [status] : [])
  return (rows as ArticleRow[]).map((row) => { const { content: _content, previewedAt: _previewedAt, versionId: _versionId, versionNo: _versionNo, ...summary } = record(row); return summary })
}

export async function getCmsArticle(id: number) { const row = await articleRow(id); return row ? record(row) : undefined }
export async function getCmsPreviewArticle(id: number, locale: SiteCode) { return (await getCmsArticle(id))?.content[locale] }

export async function getPublishedArticles(locale: SiteCode): Promise<CmsLocaleArticle[]> {
  await ready()
  const rows = await db()(`SELECT v.content_json FROM news_article a JOIN news_version v ON v.id = a.published_version_id WHERE a.status = 'PUBLISHED' AND ($1::text = 'cn' OR a.published_locales_complete = TRUE) ORDER BY a.is_pinned DESC, a.pinned_position, a.manual_position, a.published_at DESC, a.id DESC`, [locale])
  return (rows as ArticleRow[]).map((row) => content(row.content_json)[locale])
}
export async function getPublishedArticle(locale: SiteCode, slug: string) { return (await getPublishedArticles(locale)).find((item) => item.slug === slug) }

export async function writeAudit(adminId: number | null, action: string, targetType: string, targetId: string, detail: unknown) { await ready(); await db()('INSERT INTO cms_audit_log (admin_id, action, target_type, target_id, detail_json) VALUES ($1, $2, $3, $4, $5::jsonb)', [adminId, action, targetType, targetId, JSON.stringify(detail)]) }

export async function createCmsArticle(adminId: number) {
  await ready()
  const rows = await atomic(`
    WITH allocated AS (
      SELECT nextval(pg_get_serial_sequence('news_article', 'id')) AS article_id,
        nextval(pg_get_serial_sequence('news_version', 'id')) AS version_id
    ), article AS (
      INSERT INTO news_article (id, slug, status, draft_version_id)
      SELECT article_id, 'draft-' || article_id::text, 'DRAFT', version_id FROM allocated
      RETURNING id, slug, draft_version_id
    ), version AS (
      INSERT INTO news_version (id, article_id, version_no, state, content_json)
      SELECT a.draft_version_id, a.id, 1, 'DRAFT',
        jsonb_set(
          jsonb_set(
            jsonb_set($1::jsonb, '{cn,slug}', to_jsonb(a.slug), true),
            '{jp,slug}', to_jsonb(a.slug), true
          ),
          '{hk,slug}', to_jsonb(a.slug), true
        )
      FROM article a
      RETURNING id
    ), audit AS (
      INSERT INTO cms_audit_log (admin_id, action, target_type, target_id, detail_json)
      SELECT $2, 'CREATE_DRAFT', 'news_article', a.id::text, jsonb_build_object('slug', a.slug)
      FROM article a, version v
      RETURNING id
    )
    SELECT id, slug FROM article
  `, [JSON.stringify(createEmptyContent()), adminId])
  if (!rows[0]) throw new Error('创建草稿失败。')
  return numeric(rows[0].id)
}

export async function updateCmsDraft(id: number, draft: CmsArticleContent, adminId: number, expectedVersionId?: number, expectedUpdatedAt?: string) {
  const row = await articleRow(id); if (!row) throw new Error('新闻不存在。')
  if (text(row.status) === 'TRASH') throw new Error('回收站稿件必须先恢复后才能编辑。')
  const normalized = prepareCmsContent(draft, text(row.slug))
  const previous = content(row.content_json)
  const chineseChanged = JSON.stringify(previous.cn) !== JSON.stringify(normalized.cn)
  const translationNeedsRefresh = chineseChanged && (text(row.translation_status) === 'CURRENT' || isContentComplete(previous))
  const categoryName = normalized.cn.category.trim()
  const selectedCategories = categoryName ? await db()("SELECT id FROM news_category WHERE name = $1 AND status = 'ACTIVE'", [categoryName]) : []
  if (categoryName && !selectedCategories[0]) throw new Error('请选择一个已启用的正式分类。')
  const categoryId = selectedCategories[0] ? numeric(selectedCategories[0].id) : null
  const rows = await atomic(`
    WITH target AS (
      SELECT a.id, a.published_version_id, a.draft_version_id, v.id AS selected_version_id, v.version_no
      FROM news_article a
      JOIN news_version v ON v.id = COALESCE(a.draft_version_id, a.published_version_id)
      WHERE a.id = $1 AND a.status <> 'TRASH'
        AND ($6::bigint IS NULL OR v.id = $6)
        AND ($7::timestamptz IS NULL OR date_trunc('milliseconds', a.updated_at) = date_trunc('milliseconds', $7::timestamptz))
    ), new_version AS (
      INSERT INTO news_version (article_id, version_no, state, content_json)
      SELECT t.id, t.version_no + 1, 'DRAFT', $2::jsonb
      FROM target t WHERE t.selected_version_id = t.published_version_id
      RETURNING id
    ), changed_version AS (
      UPDATE news_version v SET content_json = $2::jsonb, previewed_at = NULL, updated_at = NOW()
      FROM target t
      WHERE t.selected_version_id <> COALESCE(t.published_version_id, 0) AND v.id = t.selected_version_id
      RETURNING v.id
    ), selected AS (
      SELECT id FROM new_version UNION ALL SELECT id FROM changed_version
    ), updated AS (
      UPDATE news_article a
      SET draft_version_id = s.id, category_id = $3,
        translation_status = CASE WHEN $4 THEN 'STALE' ELSE a.translation_status END,
        status = CASE WHEN a.published_version_id IS NULL THEN 'DRAFT' ELSE a.status END,
        updated_at = NOW()
      FROM target t, selected s WHERE a.id = t.id
      RETURNING a.id, s.id AS version_id
    ), audit AS (
      INSERT INTO cms_audit_log (admin_id, action, target_type, target_id, detail_json)
      SELECT $5, 'SAVE_DRAFT', 'news_article', u.id::text, jsonb_build_object('versionId', u.version_id)
      FROM updated u
      RETURNING id
    )
    SELECT id, version_id FROM updated
  `, [id, JSON.stringify(normalized), categoryId, translationNeedsRefresh, adminId, expectedVersionId ?? null, expectedUpdatedAt ?? null])
  if (!rows[0]) throw new Error('稿件已在其他窗口发生变化，请复制当前内容后刷新再处理。')
  return getCmsArticle(id)
}

export async function markCmsPreviewed(id: number, adminId: number) { const row = await articleRow(id); if (!row) throw new Error('新闻草稿不存在。'); await db()('UPDATE news_version SET previewed_at = NOW(), updated_at = NOW() WHERE id = $1', [numeric(row.selected_version_id)]); await writeAudit(adminId, 'PREVIEW_DRAFT', 'news_article', String(id), {}) }
export async function markCmsTranslated(id: number, adminId: number) { await ready(); const rows = await db()(`UPDATE news_article SET translation_status = 'CURRENT', updated_at = NOW() WHERE id = $1 RETURNING id`, [id]); if (!rows[0]) throw new Error('新闻不存在。'); await writeAudit(adminId, 'TRANSLATE_DRAFT', 'news_article', String(id), {}) }
export async function publishCmsArticle(id: number, adminId: number, reviewed: boolean) {
  if (!reviewed) throw new Error('请先完成人工审核确认。')
  const row = await articleRow(id)
  if (!row) throw new Error('新闻草稿不存在。')
  if (text(row.status) === 'TRASH') throw new Error('回收站稿件不能发布，请先恢复为草稿。')
  if (!row.draft_version_id || numeric(row.selected_version_id) !== numeric(row.draft_version_id)) throw new Error('没有可发布的草稿版本，请先保存草稿。')
  const draft = content(row.content_json)
  assertCmsLocaleReadyForPublish(draft.cn)
  if (!row.previewed_at) throw new Error('请先预览当前草稿。')
  const publishedLocalesComplete = areAllLocalesReadyForPublication(draft, text(row.translation_status) as CmsArticleRecord['translationStatus'])
  const rows = await atomic(`
    WITH target AS (
      SELECT id, published_version_id, draft_version_id
      FROM news_article
      WHERE id = $1 AND status <> 'TRASH' AND draft_version_id = $2
    ), archived AS (
      UPDATE news_version v SET state = 'ARCHIVED', updated_at = NOW()
      FROM target t
      WHERE v.id = t.published_version_id AND v.id <> t.draft_version_id
      RETURNING v.id
    ), promoted AS (
      UPDATE news_version v SET state = 'PUBLISHED', updated_at = NOW()
      FROM target t WHERE v.id = t.draft_version_id
      RETURNING v.id
    ), updated AS (
      UPDATE news_article a
      SET status = 'PUBLISHED', published_version_id = p.id, draft_version_id = NULL,
        published_locales_complete = $4, published_at = NOW(), offline_at = NULL, updated_at = NOW()
      FROM target t, promoted p WHERE a.id = t.id
      RETURNING a.id, p.id AS version_id
    ), audit AS (
      INSERT INTO cms_audit_log (admin_id, action, target_type, target_id, detail_json)
      SELECT $3, 'PUBLISH', 'news_article', u.id::text, jsonb_build_object('versionId', u.version_id, 'publishedLocalesComplete', $4)
      FROM updated u
      RETURNING id
    )
    SELECT id FROM updated
  `, [id, numeric(row.draft_version_id), adminId, publishedLocalesComplete])
  if (!rows[0]) throw new Error('稿件状态已变化，请刷新后重试。')
}
export async function offlineCmsArticle(id: number, adminId: number) { const sql = db(); const rows = await sql(`UPDATE news_article SET status = 'OFFLINE', offline_at = NOW(), is_pinned = FALSE, pinned_position = NULL, manual_position = NULL, updated_at = NOW() WHERE id = $1 AND status = 'PUBLISHED' RETURNING id`, [id]); if (!rows[0]) throw new Error('只有已发布新闻可以下线。'); await writeAudit(adminId, 'OFFLINE', 'news_article', String(id), {}) }

export async function listCmsCategories(): Promise<CmsCategory[]> {
  await ready()
  const rows = await db()(`
    SELECT c.id, c.name, c.slug, c.status, c.source, c.sort_order,
      COUNT(a.id)::integer AS reference_count
    FROM news_category c
    LEFT JOIN news_article a ON a.category_id = c.id
    GROUP BY c.id
    ORDER BY (c.status = 'ACTIVE') DESC, c.sort_order, c.name
  `)
  return rows.map((row) => ({
    id: numeric(row.id),
    name: text(row.name),
    title: text(row.name),
    slug: text(row.slug),
    status: text(row.status) as CmsCategory['status'],
    source: text(row.source) as CmsCategory['source'],
    sortOrder: numeric(row.sort_order),
    referenceCount: numeric(row.reference_count),
  }))
}
export async function createCmsCategory(name: string, adminId: number) { const normalized = name.trim(); if (!normalized) throw new Error('分类名称不能为空。'); await ready(); if ((await db()('SELECT id FROM news_category WHERE name = $1', [normalized]))[0]) throw new Error('分类名称已存在。'); const id = await ensureCategory(normalized); await writeAudit(adminId, 'CREATE_CATEGORY', 'news_category', String(id), { name: normalized }); return (await listCmsCategories()).find((item) => item.id === id) }
export async function setCmsCategoryStatus(id: number, status: CmsCategory['status'], adminId: number) { await ready(); const rows = await db()('UPDATE news_category SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id', [status, id]); if (!rows[0]) throw new Error('分类不存在。'); await writeAudit(adminId, status === 'ACTIVE' ? 'RESTORE_CATEGORY' : 'DISABLE_CATEGORY', 'news_category', String(id), {}) }

export async function renameCmsCategory(id: number, name: string, adminId: number) {
  const normalized = name.trim()
  if (!normalized) throw new Error('分类名称不能为空。')
  await ready()
  const rows = await db()(`
    WITH source AS (
      SELECT id, name FROM news_category WHERE id = $1
    ), renamed AS (
      UPDATE news_category c
      SET name = $2, updated_at = NOW()
      FROM source s
      WHERE c.id = s.id
        AND NOT EXISTS (SELECT 1 FROM news_category duplicate WHERE duplicate.name = $2 AND duplicate.id <> c.id)
      RETURNING c.id
    ), updated_versions AS (
      UPDATE news_version v
      SET content_json = jsonb_set(v.content_json, '{cn,category}', to_jsonb($2::text), true), updated_at = NOW()
      FROM news_article a, renamed r
      WHERE v.article_id = a.id AND a.category_id = r.id
      RETURNING v.id
    )
    SELECT s.id, s.name AS previous_name FROM source s JOIN renamed r ON r.id = s.id
  `, [id, normalized])
  if (!rows[0]) {
    const existing = await db()('SELECT id FROM news_category WHERE id = $1', [id])
    if (!existing[0]) throw new Error('分类不存在。')
    throw new Error('分类名称已存在。')
  }
  await writeAudit(adminId, 'RENAME_CATEGORY', 'news_category', String(id), { from: text(rows[0].previous_name), to: normalized })
  return (await listCmsCategories()).find((item) => item.id === id)
}

export async function mergeCmsCategory(id: number, targetId: number, adminId: number) {
  if (id === targetId) throw new Error('不能将分类合并到自身。')
  await ready()
  const rows = await db()(`
    WITH source AS (
      SELECT id, name FROM news_category WHERE id = $1
    ), target AS (
      SELECT id, name FROM news_category WHERE id = $2 AND status = 'ACTIVE'
    ), updated_versions AS (
      UPDATE news_version v
      SET content_json = jsonb_set(v.content_json, '{cn,category}', to_jsonb(t.name), true), updated_at = NOW()
      FROM news_article a, source s, target t
      WHERE v.article_id = a.id AND a.category_id = s.id
      RETURNING v.id
    ), updated_articles AS (
      UPDATE news_article a
      SET category_id = t.id, updated_at = NOW()
      FROM source s, target t
      WHERE a.category_id = s.id
      RETURNING a.id
    ), deleted AS (
      DELETE FROM news_category c
      USING source s, target t
      WHERE c.id = s.id
      RETURNING c.id
    )
    SELECT s.name AS source_name, t.id AS target_id, t.name AS target_name
    FROM source s, target t, deleted d
  `, [id, targetId])
  if (!rows[0]) {
    const source = await db()('SELECT id FROM news_category WHERE id = $1', [id])
    const target = await db()('SELECT id, status FROM news_category WHERE id = $1', [targetId])
    if (!source[0] || !target[0]) throw new Error('源分类或目标分类不存在。')
    throw new Error('目标分类必须处于启用状态。')
  }
  await writeAudit(adminId, 'MERGE_CATEGORY', 'news_category', String(id), { sourceName: text(rows[0].source_name), targetId, targetName: text(rows[0].target_name) })
  return (await listCmsCategories()).find((item) => item.id === targetId)
}

export async function deleteCmsCategory(id: number, adminId: number) {
  await ready()
  const rows = await db()(`
    DELETE FROM news_category c
    WHERE c.id = $1
      AND NOT EXISTS (SELECT 1 FROM news_article a WHERE a.category_id = c.id)
    RETURNING c.id, c.name
  `, [id])
  if (!rows[0]) {
    const category = await db()(`SELECT c.id, COUNT(a.id)::integer AS reference_count FROM news_category c LEFT JOIN news_article a ON a.category_id = c.id WHERE c.id = $1 GROUP BY c.id`, [id])
    if (!category[0]) throw new Error('分类不存在。')
    throw new Error(`该分类仍被 ${numeric(category[0].reference_count)} 篇稿件引用，请先合并分类或调整稿件分类。`)
  }
  await writeAudit(adminId, 'DELETE_CATEGORY', 'news_category', String(id), { name: text(rows[0].name) })
}

export async function moveCmsArticleToTrash(id: number, adminId: number) {
  await ready()
  const rows = await atomic(`
    WITH current_article AS (
      SELECT a.*, v.content_json
      FROM news_article a
      LEFT JOIN news_version v ON v.id = a.published_version_id
      WHERE a.id = $1 AND a.status <> 'TRASH'
    ), new_draft AS (
      INSERT INTO news_version (article_id, version_no, state, content_json)
      SELECT c.id,
        (SELECT COALESCE(MAX(version_no), 0) + 1 FROM news_version WHERE article_id = c.id),
        'DRAFT', c.content_json
      FROM current_article c
      WHERE c.draft_version_id IS NULL AND c.published_version_id IS NOT NULL AND c.content_json IS NOT NULL
      RETURNING id, article_id
    ), archived AS (
      UPDATE news_version v
      SET state = 'ARCHIVED', updated_at = NOW()
      FROM current_article c
      WHERE v.id = c.published_version_id
      RETURNING v.id
    )
    , updated AS (
      UPDATE news_article a
      SET status = 'TRASH', deleted_at = NOW(), deleted_from_status = c.status,
        published_version_id = NULL,
        draft_version_id = COALESCE(a.draft_version_id, (SELECT n.id FROM new_draft n WHERE n.article_id = a.id)),
        is_pinned = FALSE, pinned_position = NULL, manual_position = NULL, updated_at = NOW()
      FROM current_article c
      WHERE a.id = c.id
      RETURNING a.id, c.status AS previous_status
    ), audit AS (
      INSERT INTO cms_audit_log (admin_id, action, target_type, target_id, detail_json)
      SELECT $2, 'MOVE_TO_TRASH', 'news_article', u.id::text, jsonb_build_object('from', u.previous_status)
      FROM updated u
      RETURNING id
    )
    SELECT id, previous_status FROM updated
  `, [id, adminId])
  if (!rows[0]) throw new Error('新闻不存在或已在回收站。')
}
export async function restoreCmsArticle(id: number, adminId: number) { await ready(); const rows = await db()(`UPDATE news_article SET status = 'DRAFT', deleted_at = NULL, deleted_from_status = NULL, updated_at = NOW() WHERE id = $1 AND status = 'TRASH' RETURNING id`, [id]); if (!rows[0]) throw new Error('只有回收站稿件可以恢复。'); await writeAudit(adminId, 'RESTORE_FROM_TRASH', 'news_article', String(id), {}) }
export async function deleteCmsArticlePermanently(id: number, adminId: number) { await ready(); const rows = await db()(`DELETE FROM news_article WHERE id = $1 AND status = 'TRASH' RETURNING id`, [id]); if (!rows[0]) throw new Error('只有回收站稿件可以永久删除。'); await writeAudit(adminId, 'DELETE_PERMANENTLY', 'news_article', String(id), {}) }
export async function setCmsArticlePinned(id: number, pinned: boolean, adminId: number) { await ready(); const sql = db(); const result = await sql(`UPDATE news_article SET is_pinned = $1, pinned_position = CASE WHEN $1 THEN (SELECT COALESCE(MIN(pinned_position), 0) - 1 FROM news_article WHERE status = 'PUBLISHED' AND is_pinned = TRUE) ELSE NULL END, updated_at = NOW() WHERE id = $2 AND status = 'PUBLISHED' RETURNING id`, [pinned, id]); if (!result[0]) throw new Error('只有已发布稿件可以置顶。'); await writeAudit(adminId, pinned ? 'PIN_ARTICLE' : 'UNPIN_ARTICLE', 'news_article', String(id), {}) }
export async function reorderCmsPublishedArticles(ids: number[], adminId: number) {
  await ready()
  if (!ids.length || new Set(ids).size !== ids.length || ids.some((id) => !Number.isInteger(id) || id < 1)) throw new Error('排序参数不正确。')
  const rows = await atomic(`
    WITH input AS (
      SELECT id, position FROM unnest($1::bigint[]) WITH ORDINALITY AS value(id, position)
    ), published AS (
      SELECT id, is_pinned FROM news_article WHERE status = 'PUBLISHED'
    ), validation AS (
      SELECT
        (SELECT COUNT(*) FROM input) = (SELECT COUNT(*) FROM published)
        AND NOT EXISTS (SELECT 1 FROM input i LEFT JOIN published p ON p.id = i.id WHERE p.id IS NULL)
        AND NOT EXISTS (SELECT 1 FROM published p LEFT JOIN input i ON i.id = p.id WHERE i.id IS NULL) AS ok
    ), updated AS (
      UPDATE news_article a
      SET pinned_position = CASE WHEN a.is_pinned THEN i.position - 1 ELSE NULL END,
        manual_position = CASE WHEN a.is_pinned THEN NULL ELSE i.position - 1 END,
        updated_at = NOW()
      FROM input i, validation v
      WHERE v.ok AND a.id = i.id AND a.status = 'PUBLISHED'
      RETURNING a.id
    ), audit AS (
      INSERT INTO cms_audit_log (admin_id, action, target_type, target_id, detail_json)
      SELECT $2, 'REORDER_PUBLISHED', 'news_article', 'published', jsonb_build_object('ids', $1::bigint[])
      FROM validation v
      WHERE v.ok AND (SELECT COUNT(*) FROM updated) = (SELECT COUNT(*) FROM input)
      RETURNING id
    )
    SELECT v.ok, (SELECT COUNT(*) FROM updated)::integer AS updated_count FROM validation v
  `, [ids, adminId])
  if (!rows[0] || !rows[0].ok || numeric(rows[0].updated_count) !== ids.length) throw new Error('排序必须包含全部已发布稿件。')
}

export async function importCmsArticle(draft: CmsArticleContent, sourceId: string) {
  const slug = draft.cn.slug.trim()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('导入稿件的 slug 仅支持小写字母、数字和连字符。')
  const payloadHash = createHash('sha256').update(JSON.stringify(draft)).digest('hex')
  const result = await importCmsArticleIdempotent(draft, sourceId, `legacy-${slug}-${payloadHash}`, payloadHash)
  return result.articleId
}

export async function importCmsArticleIdempotent(draft: CmsArticleContent, sourceId: string, idempotencyKey: string, payloadHash: string): Promise<CmsImportResult> {
  const slug = draft.cn.slug.trim()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('导入稿件的 slug 仅支持小写字母、数字和连字符。')
  const key = idempotencyKey.trim()
  const hash = payloadHash.trim()
  if (!key || !hash) throw new Error('导入请求缺少幂等键或载荷摘要。')
  await ready()
  const source = 'NEWS_WORKBENCH'
  const categoryName = draft.cn.category.trim()
  const normalized = prepareCmsContent(draft, slug)
  const sql = client()
  const results = await sql.transaction((transaction) => [
    transaction.query(`SELECT pg_advisory_xact_lock(hashtextextended($1, 0))`, [`${source}:${key}`]),
    transaction.query(`
      INSERT INTO integration_delivery (source, external_id, idempotency_key, payload_hash, result)
      VALUES ($1, $2, $3, $4, NULL)
      ON CONFLICT (source, idempotency_key) DO NOTHING
      RETURNING id
    `, [source, sourceId, key, hash]),
    transaction.query(`
      WITH gate AS (
        SELECT id FROM integration_delivery
        WHERE source = $1 AND idempotency_key = $2 AND payload_hash = $3 AND result IS NULL
      ), existing_category AS (
        SELECT id FROM news_category WHERE name = $4
      ), category_upsert AS (
        INSERT INTO news_category (name, slug, status, source)
        SELECT $4, $5, 'ACTIVE', 'IMPORT' FROM gate WHERE $4 <> ''
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id, (xmax = 0) AS created
      ), existing_article AS (
        SELECT a.* FROM news_article a, gate g WHERE a.slug = $6
      ), article_plan AS (
        SELECT e.id, FALSE AS is_new, e.draft_version_id, e.published_version_id, e.status
        FROM existing_article e WHERE e.status <> 'TRASH'
        UNION ALL
        SELECT nextval(pg_get_serial_sequence('news_article', 'id')), TRUE, NULL::bigint, NULL::bigint, 'DRAFT'
        FROM gate WHERE NOT EXISTS (SELECT 1 FROM existing_article)
      ), version_plan AS (
        SELECT p.*,
          CASE WHEN p.is_new OR p.draft_version_id IS NULL OR p.draft_version_id = p.published_version_id
            THEN nextval(pg_get_serial_sequence('news_version', 'id')) ELSE p.draft_version_id END AS version_id,
          CASE WHEN p.is_new THEN 1 ELSE (SELECT COALESCE(MAX(version_no), 0) + 1 FROM news_version WHERE article_id = p.id) END AS next_version_no,
          (p.is_new OR p.draft_version_id IS NULL OR p.draft_version_id = p.published_version_id) AS create_version
        FROM article_plan p
      ), inserted_article AS (
        INSERT INTO news_article (id, slug, status, draft_version_id, category_id)
        SELECT p.id, $6, 'DRAFT', p.version_id,
          COALESCE((SELECT id FROM category_upsert LIMIT 1), (SELECT id FROM existing_category LIMIT 1))
        FROM version_plan p WHERE p.is_new
        RETURNING id
      ), inserted_version AS (
        INSERT INTO news_version (id, article_id, version_no, state, content_json)
        SELECT p.version_id, p.id, p.next_version_no, 'DRAFT', $7::jsonb
        FROM version_plan p
        LEFT JOIN inserted_article inserted ON inserted.id = p.id
        WHERE p.create_version
        RETURNING id, article_id
      ), updated_version AS (
        UPDATE news_version v SET content_json = $7::jsonb, previewed_at = NULL, updated_at = NOW()
        FROM version_plan p
        WHERE NOT p.create_version AND v.id = p.version_id
        RETURNING v.id
      ), updated_article AS (
        UPDATE news_article a
        SET draft_version_id = p.version_id,
          category_id = COALESCE((SELECT id FROM category_upsert LIMIT 1), (SELECT id FROM existing_category LIMIT 1)),
          translation_status = 'STALE',
          status = CASE WHEN a.published_version_id IS NULL THEN 'DRAFT' ELSE a.status END,
          updated_at = NOW()
        FROM version_plan p
        WHERE NOT p.is_new AND a.id = p.id
        RETURNING a.id
      ), completed_article AS (
        SELECT id FROM inserted_article UNION ALL SELECT id FROM updated_article
      ), result_value AS (
        SELECT jsonb_build_object(
          'articleId', c.id,
          'duplicate', FALSE,
          'categoryCreated', ($4 <> '' AND NOT EXISTS (SELECT 1 FROM existing_category) AND COALESCE((SELECT bool_or(created) FROM category_upsert), FALSE))
        ) AS value
        FROM completed_article c
      ), delivery_update AS (
        UPDATE integration_delivery d SET result = r.value, updated_at = NOW()
        FROM gate g, result_value r WHERE d.id = g.id
        RETURNING d.result
      ), audit AS (
        INSERT INTO cms_audit_log (admin_id, action, target_type, target_id, detail_json)
        SELECT NULL, CASE WHEN p.is_new THEN 'IMPORT_CREATE_DRAFT' ELSE 'IMPORT_UPDATE_DRAFT' END,
          'news_article', p.id::text, jsonb_build_object('sourceId', $8, 'idempotencyKey', $2)
        FROM version_plan p
        RETURNING id
      )
      SELECT result FROM delivery_update
    `, [source, key, hash, categoryName, `${categorySlug(categoryName)}-${Math.random().toString(36).slice(2, 7)}`, slug, JSON.stringify(normalized), sourceId]),
    transaction.query(`SELECT payload_hash, result FROM integration_delivery WHERE source = $1 AND idempotency_key = $2`, [source, key]),
  ])
  const delivery = (results[3] as ArticleRow[])[0]
  if (!delivery) throw new Error('导入幂等记录创建失败。')
  if (text(delivery.payload_hash) !== hash) throw new Error('相同幂等键已用于不同内容，请更换幂等键。')
  if (!delivery.result) {
    await db()('DELETE FROM integration_delivery WHERE source = $1 AND idempotency_key = $2 AND payload_hash = $3 AND result IS NULL', [source, key, hash])
    throw new Error('目标稿件不可导入；若稿件位于回收站，请先恢复后重试。')
  }
  const value = (typeof delivery.result === 'string' ? JSON.parse(delivery.result) : delivery.result) as CmsImportResult
  const inserted = (results[1] as ArticleRow[]).length > 0
  return { articleId: numeric(value.articleId), categoryCreated: Boolean(value.categoryCreated), duplicate: !inserted }
}

export async function createTranslationJob(versionId: number, targetLocale: 'jp' | 'hk', provider: string, model: string) {
  await ready()
  if (!Number.isInteger(versionId) || versionId < 1 || !provider.trim() || !model.trim()) throw new Error('翻译任务参数不完整。')
  const rows = await db()(`INSERT INTO translation_job (version_id, target_locale, status, provider, model) VALUES ($1, $2, 'PENDING', $3, $4) RETURNING id`, [versionId, targetLocale, provider.trim(), model.trim()])
  return numeric(rows[0].id)
}

export async function completeTranslationJob(jobId: number) {
  await ready()
  const rows = await db()(`UPDATE translation_job SET status = 'SUCCEEDED', error_code = NULL, updated_at = NOW() WHERE id = $1 AND status = 'PENDING' RETURNING id`, [jobId])
  if (!rows[0]) throw new Error('待完成的翻译任务不存在。')
}

export async function failTranslationJob(jobId: number, errorCode: string) {
  await ready()
  const rows = await db()(`UPDATE translation_job SET status = 'FAILED', error_code = $2, updated_at = NOW() WHERE id = $1 AND status = 'PENDING' RETURNING id`, [jobId, errorCode.trim() || 'UNKNOWN'])
  if (!rows[0]) throw new Error('待失败标记的翻译任务不存在。')
}

export async function recordCmsAsset(asset: CmsAssetInput, adminId: number | null = null) {
  await ready()
  if (!asset.id.trim() || !asset.blobUrl.trim() || asset.width < 1 || asset.height < 1) throw new Error('素材元数据不完整。')
  await atomic(`
    WITH recorded AS (
      INSERT INTO cms_asset (id, article_id, blob_url, thumbnail_url, mime_type, width, height, alt_text, usage)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET article_id = EXCLUDED.article_id, blob_url = EXCLUDED.blob_url,
        thumbnail_url = EXCLUDED.thumbnail_url, mime_type = EXCLUDED.mime_type, width = EXCLUDED.width,
        height = EXCLUDED.height, alt_text = EXCLUDED.alt_text, usage = EXCLUDED.usage, updated_at = NOW()
      RETURNING id
    )
    INSERT INTO cms_audit_log (admin_id, action, target_type, target_id, detail_json)
    SELECT $10, 'RECORD_ASSET', 'cms_asset', id, jsonb_build_object('articleId', $2::bigint, 'usage', $9::text, 'blobUrl', $3::text)
    FROM recorded
    RETURNING target_id
  `, [asset.id.trim(), asset.articleId ?? null, asset.blobUrl.trim(), asset.thumbnailUrl ?? null, asset.mimeType, asset.width, asset.height, asset.altText ?? null, asset.usage, adminId])
  return asset.id.trim()
}

export async function listCmsAuditLogs(targetType: string, targetId: string, limit = 50): Promise<CmsAuditLog[]> {
  await ready()
  const safeLimit = Math.max(1, Math.min(200, Math.trunc(limit) || 50))
  const rows = await db()(`
    SELECT l.id, l.action, l.created_at, a.username AS admin_username, l.detail_json
    FROM cms_audit_log l
    LEFT JOIN cms_admin a ON a.id = l.admin_id
    WHERE l.target_type = $1 AND l.target_id = $2
    ORDER BY l.created_at DESC, l.id DESC
    LIMIT $3
  `, [targetType, targetId, safeLimit])
  return rows.map((row) => ({ id: numeric(row.id), action: text(row.action), createdAt: timestamp(row.created_at), adminUsername: row.admin_username ? text(row.admin_username) : null, detail: row.detail_json ?? null }))
}
