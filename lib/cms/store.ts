import 'server-only'

import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { basename, dirname, extname, join } from 'node:path'
import { newsArticles } from '@/lib/news-content'
import type { SiteCode } from '@/lib/site-content'
import { prepareCmsContent } from './publication-server'
import { CMS_LOCALES, areAllLocalesReadyForPublication, createEmptyContent, isContentComplete, isLocaleContentComplete, type CmsArticleContent, type CmsArticleRecord, type CmsArticleStatus, type CmsArticleSummary, type CmsAssetInput, type CmsAuditLog, type CmsCategory, type CmsImportResult, type CmsLocaleArticle } from './types'
import * as postgresStore from './store-postgres'
import { usesPostgres } from './config'

type ArticleRow = {
  id: number
  slug: string
  status: CmsArticleStatus
  published_version_id: number | null
  draft_version_id: number | null
  published_at: string | null
  updated_at: string
  category_id: number | null
  deleted_at: string | null
  is_pinned: number
  pinned_position: number | null
  manual_position: number | null
  translation_status: 'CURRENT' | 'STALE' | 'NOT_TRANSLATED'
  published_locales_complete: number
}

type VersionRow = {
  id: number
  article_id: number
  version_no: number
  state: string
  content_json: string
  previewed_at: string | null
  created_at: string
}

const databasePath = process.env.CMS_DATABASE_PATH || join(process.cwd(), '.data', 'news-cms.sqlite')
let sqliteDatabase: Database.Database | undefined

function loadSqliteDatabase() {
  if (usesPostgres()) throw new Error('PostgreSQL 模式下禁止初始化本地 SQLite。')
  if (!sqliteDatabase) {
    mkdirSync(dirname(databasePath), { recursive: true })
    sqliteDatabase = new Database(databasePath)
    sqliteDatabase.pragma('journal_mode = WAL')
    sqliteDatabase.pragma('foreign_keys = ON')
    initialize()
    seedLegacyArticles()
    seedCategories()
  }
  return sqliteDatabase
}

const database = new Proxy({} as Database.Database, {
  get(_target, property) {
    const instance = loadSqliteDatabase()
    const value = Reflect.get(instance, property, instance)
    return typeof value === 'function' ? value.bind(instance) : value
  },
})

function now() {
  return new Date().toISOString()
}

function initialize() {
  database.exec(`
    CREATE TABLE IF NOT EXISTS cms_admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      failed_login_count INTEGER NOT NULL DEFAULT 0,
      locked_until TEXT,
      last_login_at TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS cms_session (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      revoked_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (admin_id) REFERENCES cms_admin(id)
    );
    CREATE TABLE IF NOT EXISTS news_article (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      published_version_id INTEGER,
      draft_version_id INTEGER,
      published_at TEXT,
      offline_at TEXT,
      published_locales_complete INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS news_version (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL,
      version_no INTEGER NOT NULL,
      state TEXT NOT NULL,
      content_json TEXT NOT NULL,
      previewed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(article_id, version_no),
      FOREIGN KEY (article_id) REFERENCES news_article(id)
    );
    CREATE TABLE IF NOT EXISTS cms_audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      detail_json TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS news_category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      source TEXT NOT NULL DEFAULT 'MANUAL',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS integration_delivery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      external_id TEXT NOT NULL,
      idempotency_key TEXT NOT NULL,
      payload_hash TEXT NOT NULL,
      result TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(source, idempotency_key)
    );
    CREATE TABLE IF NOT EXISTS translation_job (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version_id INTEGER NOT NULL,
      target_locale TEXT NOT NULL,
      status TEXT NOT NULL,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      error_code TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (version_id) REFERENCES news_version(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS cms_asset (
      id TEXT PRIMARY KEY,
      article_id INTEGER,
      blob_url TEXT NOT NULL,
      thumbnail_url TEXT,
      mime_type TEXT NOT NULL,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      alt_text TEXT,
      usage TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (article_id) REFERENCES news_article(id) ON DELETE SET NULL
    );
  `)
  const columns = new Set((database.prepare('PRAGMA table_info(news_article)').all() as { name: string }[]).map((column) => column.name))
  const additions = [
    ['category_id', 'INTEGER'], ['deleted_at', 'TEXT'], ['deleted_from_status', 'TEXT'],
    ['is_pinned', 'INTEGER NOT NULL DEFAULT 0'], ['pinned_position', 'REAL'], ['manual_position', 'REAL'], ['translation_status', "TEXT NOT NULL DEFAULT 'NOT_TRANSLATED'"],
  ] as const
  additions.forEach(([name, definition]) => { if (!columns.has(name)) database.exec(`ALTER TABLE news_article ADD COLUMN ${name} ${definition}`) })
  if (!columns.has('published_locales_complete')) {
    database.exec('ALTER TABLE news_article ADD COLUMN published_locales_complete INTEGER NOT NULL DEFAULT 0')
    database.exec("UPDATE news_article SET published_locales_complete = 1 WHERE status = 'PUBLISHED' AND published_version_id IS NOT NULL")
  }
}

function optimizedCoverPath(cover: string) {
  if (extname(cover).toLowerCase() !== '.png') return cover
  return `/images/news/optimized/${basename(cover, extname(cover))}.webp`
}

function seedLegacyArticles() {
  const count = database.prepare('SELECT COUNT(*) AS total FROM news_article').get() as { total: number }
  if (count.total) return
  const insert = database.transaction(() => {
    const articleStatement = database.prepare('INSERT INTO news_article (slug, status, published_at, published_locales_complete, created_at, updated_at) VALUES (?, ?, ?, 1, ?, ?)')
    const versionStatement = database.prepare('INSERT INTO news_version (article_id, version_no, state, content_json, created_at, updated_at) VALUES (?, 1, ?, ?, ?, ?)')
    const updateStatement = database.prepare('UPDATE news_article SET published_version_id = ?, updated_at = ? WHERE id = ?')
    newsArticles.cn.forEach((cnArticle) => {
      const legacy = Object.fromEntries(CMS_LOCALES.map((locale) => {
        const article = newsArticles[locale].find((item) => item.slug === cnArticle.slug) ?? cnArticle
        return [locale, { ...article, slug: cnArticle.slug, cover: optimizedCoverPath(article.cover) }]
      }))
      const content = prepareCmsContent(legacy, cnArticle.slug)
      const timestamp = now()
      const articleResult = articleStatement.run(cnArticle.slug, 'PUBLISHED', timestamp, timestamp, timestamp)
      const versionResult = versionStatement.run(articleResult.lastInsertRowid, 'PUBLISHED', JSON.stringify(content), timestamp, timestamp)
      updateStatement.run(versionResult.lastInsertRowid, timestamp, articleResult.lastInsertRowid)
    })
  })
  insert()
}

function categorySlug(value: string) {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '')
  return normalized || `category-${Date.now()}`
}

function ensureCategory(name: string, source: CmsCategory['source'] = 'MANUAL') {
  const normalized = name.trim()
  if (!normalized) return null
  const existing = database.prepare('SELECT * FROM news_category WHERE name = ?').get(normalized) as { id: number } | undefined
  if (existing) return existing.id
  const timestamp = now()
  const suffix = Math.random().toString(36).slice(2, 7)
  const result = database.prepare("INSERT INTO news_category (name, slug, status, source, created_at, updated_at) VALUES (?, ?, 'ACTIVE', ?, ?, ?)").run(normalized, `${categorySlug(normalized)}-${suffix}`, source, timestamp, timestamp)
  return Number(result.lastInsertRowid)
}

function seedCategories() {
  const rows = database.prepare('SELECT * FROM news_article').all() as ArticleRow[]
  const update = database.prepare('UPDATE news_article SET category_id = ? WHERE id = ?')
  rows.forEach((row) => {
    if (row.category_id) return
    const version = versionFor(row)
    if (!version) return
    const categoryId = ensureCategory(parseContent(version.content_json).cn.category)
    if (categoryId) update.run(categoryId, row.id)
  })
}

function parseContent(value: string): CmsArticleContent {
  return prepareCmsContent(JSON.parse(value))
}

function versionFor(row: ArticleRow, preferDraft = true) {
  const versionId = preferDraft && row.draft_version_id ? row.draft_version_id : row.published_version_id
  if (!versionId) return undefined
  return database.prepare('SELECT * FROM news_version WHERE id = ?').get(versionId) as VersionRow | undefined
}

function toRecord(row: ArticleRow, version: VersionRow): CmsArticleRecord {
  const content = parseContent(version.content_json)
  const first = content.cn
  return {
    id: row.id,
    slug: row.slug,
    title: first.title,
    status: row.status,
    date: first.date,
    category: first.category,
    tags: first.tags ?? [],
    cover: first.cover,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    localesComplete: isContentComplete(content),
    translationStatus: row.translation_status ?? 'NOT_TRANSLATED',
    isPinned: Boolean(row.is_pinned),
    deletedAt: row.deleted_at,
    content,
    previewedAt: version.previewed_at,
    versionId: version.id,
    versionNo: version.version_no,
  }
}

export function listCmsArticles(status?: CmsArticleStatus): CmsArticleSummary[] {
  if (usesPostgres()) return postgresStore.listCmsArticles(status) as unknown as CmsArticleSummary[]
  const query = status ? 'SELECT * FROM news_article WHERE status = ? ORDER BY is_pinned DESC, pinned_position, manual_position, published_at DESC, updated_at DESC' : 'SELECT * FROM news_article ORDER BY is_pinned DESC, pinned_position, manual_position, published_at DESC, updated_at DESC'
  return (database.prepare(query).all(...(status ? [status] : [])) as ArticleRow[]).flatMap((row) => {
    const version = versionFor(row)
    if (!version) return []
    const record = toRecord(row, version)
    const { content: _content, previewedAt: _previewedAt, versionId: _versionId, versionNo: _versionNo, ...summary } = record
    return [summary]
  })
}

export function getCmsArticle(id: number): CmsArticleRecord | undefined {
  if (usesPostgres()) return postgresStore.getCmsArticle(id) as unknown as CmsArticleRecord | undefined
  const row = database.prepare('SELECT * FROM news_article WHERE id = ?').get(id) as ArticleRow | undefined
  const version = row && versionFor(row)
  return row && version ? toRecord(row, version) : undefined
}

export function getCmsPreviewArticle(id: number, locale: SiteCode) {
  if (usesPostgres()) return postgresStore.getCmsPreviewArticle(id, locale)
  const record = getCmsArticle(id)
  return record ? record.content[locale] : undefined
}

export function getPublishedArticles(locale: SiteCode): CmsLocaleArticle[] {
  if (usesPostgres()) return postgresStore.getPublishedArticles(locale) as unknown as CmsLocaleArticle[]
  const rows = database.prepare("SELECT * FROM news_article WHERE status = 'PUBLISHED' AND published_version_id IS NOT NULL ORDER BY is_pinned DESC, pinned_position, manual_position, published_at DESC, id DESC").all() as ArticleRow[]
  return rows.flatMap((row) => {
    if (locale !== 'cn' && !row.published_locales_complete) return []
    const version = versionFor(row, false)
    return version ? [parseContent(version.content_json)[locale]] : []
  })
}

export function getPublishedArticle(locale: SiteCode, slug: string) {
  if (usesPostgres()) return postgresStore.getPublishedArticle(locale, slug)
  return getPublishedArticles(locale).find((article) => article.slug === slug)
}

export function createCmsArticle(adminId: number) {
  if (usesPostgres()) return postgresStore.createCmsArticle(adminId)
  const timestamp = now()
  const operation = database.transaction(() => {
    const temporarySlug = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const result = database.prepare('INSERT INTO news_article (slug, status, created_at, updated_at) VALUES (?, ?, ?, ?)').run(temporarySlug, 'DRAFT', timestamp, timestamp)
    const articleId = Number(result.lastInsertRowid)
    const slug = `draft-${articleId}`
    database.prepare('UPDATE news_article SET slug = ? WHERE id = ?').run(slug, articleId)
    const versionResult = database.prepare('INSERT INTO news_version (article_id, version_no, state, content_json, created_at, updated_at) VALUES (?, 1, ?, ?, ?, ?)').run(articleId, 'DRAFT', JSON.stringify(createEmptyContent(slug)), timestamp, timestamp)
    database.prepare('UPDATE news_article SET draft_version_id = ? WHERE id = ?').run(versionResult.lastInsertRowid, result.lastInsertRowid)
    writeAudit(adminId, 'CREATE_DRAFT', 'news_article', String(result.lastInsertRowid), { slug })
    return articleId
  })
  return operation()
}

export function importCmsArticle(content: CmsArticleContent, sourceId: string) {
  if (usesPostgres()) return postgresStore.importCmsArticle(content, sourceId)
  const slug = content.cn.slug.trim()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('导入稿件的 slug 仅支持小写字母、数字和连字符。')
  const existing = database.prepare('SELECT * FROM news_article WHERE slug = ?').get(slug) as ArticleRow | undefined
  const timestamp = now()
  const normalized = prepareCmsContent(content, slug)
  const categoryId = ensureCategory(normalized.cn.category, 'IMPORT')
  const operation = database.transaction(() => {
    if (!existing) {
      const articleResult = database.prepare('INSERT INTO news_article (slug, status, category_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(slug, 'DRAFT', categoryId, timestamp, timestamp)
      const versionResult = database.prepare('INSERT INTO news_version (article_id, version_no, state, content_json, created_at, updated_at) VALUES (?, 1, ?, ?, ?, ?)').run(articleResult.lastInsertRowid, 'DRAFT', JSON.stringify(normalized), timestamp, timestamp)
      database.prepare('UPDATE news_article SET draft_version_id = ? WHERE id = ?').run(versionResult.lastInsertRowid, articleResult.lastInsertRowid)
      writeAudit(null, 'IMPORT_CREATE_DRAFT', 'news_article', String(articleResult.lastInsertRowid), { sourceId })
      return Number(articleResult.lastInsertRowid)
    }
    let version = versionFor(existing)
    if (!version || version.id === existing.published_version_id) {
      const result = database.prepare('INSERT INTO news_version (article_id, version_no, state, content_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(existing.id, (version?.version_no ?? 0) + 1, 'DRAFT', JSON.stringify(normalized), timestamp, timestamp)
      database.prepare('UPDATE news_article SET draft_version_id = ? WHERE id = ?').run(result.lastInsertRowid, existing.id)
      version = database.prepare('SELECT * FROM news_version WHERE id = ?').get(result.lastInsertRowid) as VersionRow
    } else database.prepare('UPDATE news_version SET content_json = ?, previewed_at = NULL, updated_at = ? WHERE id = ?').run(JSON.stringify(normalized), timestamp, version.id)
    database.prepare('UPDATE news_article SET category_id = ?, updated_at = ? WHERE id = ?').run(categoryId, timestamp, existing.id)
    writeAudit(null, 'IMPORT_UPDATE_DRAFT', 'news_article', String(existing.id), { sourceId, versionId: version.id })
    return existing.id
  })
  return operation()
}

export function updateCmsDraft(id: number, content: CmsArticleContent, adminId: number, expectedVersionId?: number, expectedUpdatedAt?: string) {
  if (usesPostgres()) return postgresStore.updateCmsDraft(id, content, adminId, expectedVersionId, expectedUpdatedAt) as unknown as CmsArticleRecord | undefined
  const initialRow = database.prepare('SELECT * FROM news_article WHERE id = ?').get(id) as ArticleRow | undefined
  if (!initialRow) throw new Error('新闻不存在。')
  if (initialRow.status === 'TRASH') throw new Error('回收站稿件必须先恢复后才能编辑。')
  const timestamp = now()
  const operation = database.transaction(() => {
    const row = database.prepare('SELECT * FROM news_article WHERE id = ?').get(id) as ArticleRow | undefined
    if (!row) throw new Error('新闻不存在。')
    let version = versionFor(row)
    if ((expectedVersionId && version?.id !== expectedVersionId) || (expectedUpdatedAt && row.updated_at !== expectedUpdatedAt)) {
      throw new Error('稿件已在其他窗口发生变化，请复制当前内容后刷新再处理。')
    }
    if (!version || version.id === row.published_version_id) {
      const source = version ? parseContent(version.content_json) : createEmptyContent(row.slug)
      const result = database.prepare('INSERT INTO news_version (article_id, version_no, state, content_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(row.id, (version?.version_no ?? 0) + 1, 'DRAFT', JSON.stringify(source), timestamp, timestamp)
      database.prepare('UPDATE news_article SET draft_version_id = ? WHERE id = ?').run(result.lastInsertRowid, row.id)
      version = database.prepare('SELECT * FROM news_version WHERE id = ?').get(result.lastInsertRowid) as VersionRow
    }
    const normalized = prepareCmsContent(content, row.slug)
    const previous = version ? parseContent(version.content_json) : createEmptyContent(row.slug)
    const chineseChanged = JSON.stringify(previous.cn) !== JSON.stringify(normalized.cn)
    const translationNeedsRefresh = chineseChanged && (row.translation_status === 'CURRENT' || isContentComplete(previous))
    const categoryName = normalized.cn.category.trim()
    const selectedCategory = categoryName
      ? database.prepare("SELECT id FROM news_category WHERE name = ? AND status = 'ACTIVE'").get(categoryName) as { id: number } | undefined
      : undefined
    if (categoryName && !selectedCategory) throw new Error('请选择一个已启用的正式分类。')
    const categoryId = selectedCategory?.id ?? null
    database.prepare('UPDATE news_version SET content_json = ?, previewed_at = NULL, updated_at = ? WHERE id = ?').run(JSON.stringify(normalized), timestamp, version.id)
    database.prepare("UPDATE news_article SET category_id = ?, translation_status = CASE WHEN ? THEN 'STALE' ELSE translation_status END, status = CASE WHEN published_version_id IS NULL THEN 'DRAFT' ELSE status END, updated_at = ? WHERE id = ?").run(categoryId, translationNeedsRefresh ? 1 : 0, timestamp, row.id)
    writeAudit(adminId, 'SAVE_DRAFT', 'news_article', String(row.id), { versionId: version.id })
  })
  operation()
  return getCmsArticle(id)
}

export function markCmsPreviewed(id: number, adminId: number) {
  if (usesPostgres()) return postgresStore.markCmsPreviewed(id, adminId)
  const row = database.prepare('SELECT * FROM news_article WHERE id = ?').get(id) as ArticleRow | undefined
  const version = row && versionFor(row)
  if (!row || !version) throw new Error('新闻草稿不存在。')
  const timestamp = now()
  database.prepare('UPDATE news_version SET previewed_at = ?, updated_at = ? WHERE id = ?').run(timestamp, timestamp, version.id)
  writeAudit(adminId, 'PREVIEW_DRAFT', 'news_article', String(id), { versionId: version.id })
}

export function markCmsTranslated(id: number, adminId: number) {
  if (usesPostgres()) return postgresStore.markCmsTranslated(id, adminId)
  const result = database.prepare("UPDATE news_article SET translation_status = 'CURRENT', updated_at = ? WHERE id = ?").run(now(), id)
  if (!result.changes) throw new Error('新闻不存在。')
  writeAudit(adminId, 'TRANSLATE_DRAFT', 'news_article', String(id), {})
}

export function publishCmsArticle(id: number, adminId: number, reviewed: boolean) {
  if (usesPostgres()) return postgresStore.publishCmsArticle(id, adminId, reviewed)
  if (!reviewed) throw new Error('请先完成人工审核确认。')
  const row = database.prepare('SELECT * FROM news_article WHERE id = ?').get(id) as ArticleRow | undefined
  const version = row && versionFor(row)
  if (!row || !version) throw new Error('新闻草稿不存在。')
  if (row.status === 'TRASH') throw new Error('回收站稿件不能发布，请先恢复为草稿。')
  if (!row.draft_version_id || version.id !== row.draft_version_id) throw new Error('没有可发布的草稿版本，请先保存草稿。')
  const content = parseContent(version.content_json)
  if (!version.previewed_at) throw new Error('请先预览当前草稿。')
  if (!isLocaleContentComplete(content.cn)) throw new Error('中文内容、封面和正文必须完整后才能发布。')
  const publishedLocalesComplete = areAllLocalesReadyForPublication(content, row.translation_status)
  const timestamp = now()
  const operation = database.transaction(() => {
    if (row.published_version_id && row.published_version_id !== version.id) database.prepare("UPDATE news_version SET state = 'ARCHIVED', updated_at = ? WHERE id = ?").run(timestamp, row.published_version_id)
    database.prepare("UPDATE news_version SET state = 'PUBLISHED', updated_at = ? WHERE id = ?").run(timestamp, version.id)
    database.prepare("UPDATE news_article SET status = 'PUBLISHED', published_version_id = ?, draft_version_id = NULL, published_locales_complete = ?, published_at = ?, offline_at = NULL, updated_at = ? WHERE id = ?").run(version.id, publishedLocalesComplete ? 1 : 0, timestamp, timestamp, row.id)
    writeAudit(adminId, 'PUBLISH', 'news_article', String(row.id), { versionId: version.id, publishedLocalesComplete })
  })
  operation()
}

export function offlineCmsArticle(id: number, adminId: number) {
  if (usesPostgres()) return postgresStore.offlineCmsArticle(id, adminId)
  const row = database.prepare('SELECT * FROM news_article WHERE id = ?').get(id) as ArticleRow | undefined
  if (!row || row.status !== 'PUBLISHED') throw new Error('只有已发布新闻可以下线。')
  const timestamp = now()
  database.prepare("UPDATE news_article SET status = 'OFFLINE', offline_at = ?, is_pinned = 0, pinned_position = NULL, manual_position = NULL, updated_at = ? WHERE id = ?").run(timestamp, timestamp, id)
  writeAudit(adminId, 'OFFLINE', 'news_article', String(id), {})
}

export function listCmsCategories(): CmsCategory[] {
  if (usesPostgres()) return postgresStore.listCmsCategories() as unknown as CmsCategory[]
  const rows = database.prepare(`
    SELECT c.id, c.name, c.slug, c.status, c.source, c.sort_order,
      COUNT(a.id) AS reference_count
    FROM news_category c
    LEFT JOIN news_article a ON a.category_id = c.id
    GROUP BY c.id
    ORDER BY c.status = 'ACTIVE' DESC, c.sort_order ASC, c.name ASC
  `).all() as Array<{ id: number; name: string; slug: string; status: CmsCategory['status']; source: CmsCategory['source']; sort_order: number; reference_count: number }>
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    title: row.name,
    slug: row.slug,
    status: row.status,
    source: row.source,
    sortOrder: row.sort_order,
    referenceCount: row.reference_count,
  }))
}

export function createCmsCategory(name: string, adminId: number) {
  if (usesPostgres()) return postgresStore.createCmsCategory(name, adminId) as unknown as CmsCategory | undefined
  const normalized = name.trim()
  if (!normalized) throw new Error('分类名称不能为空。')
  if (database.prepare('SELECT id FROM news_category WHERE name = ?').get(normalized)) throw new Error('分类名称已存在。')
  const id = ensureCategory(normalized, 'MANUAL')
  if (!id) throw new Error('分类创建失败。')
  writeAudit(adminId, 'CREATE_CATEGORY', 'news_category', String(id), { name: name.trim() })
  return listCmsCategories().find((item) => item.id === id)
}

export function setCmsCategoryStatus(id: number, status: CmsCategory['status'], adminId: number) {
  if (usesPostgres()) return postgresStore.setCmsCategoryStatus(id, status, adminId)
  const result = database.prepare('UPDATE news_category SET status = ?, updated_at = ? WHERE id = ?').run(status, now(), id)
  if (!result.changes) throw new Error('分类不存在。')
  writeAudit(adminId, status === 'ACTIVE' ? 'RESTORE_CATEGORY' : 'DISABLE_CATEGORY', 'news_category', String(id), {})
}

export function renameCmsCategory(id: number, name: string, adminId: number) {
  if (usesPostgres()) return postgresStore.renameCmsCategory(id, name, adminId)
  const normalized = name.trim()
  if (!normalized) throw new Error('分类名称不能为空。')
  const category = database.prepare('SELECT * FROM news_category WHERE id = ?').get(id) as { id: number; name: string } | undefined
  if (!category) throw new Error('分类不存在。')
  const duplicate = database.prepare('SELECT id FROM news_category WHERE name = ? AND id <> ?').get(normalized, id)
  if (duplicate) throw new Error('分类名称已存在。')
  database.transaction(() => {
    database.prepare('UPDATE news_category SET name = ?, updated_at = ? WHERE id = ?').run(normalized, now(), id)
    const versions = database.prepare(`
      SELECT v.id, v.content_json
      FROM news_version v
      JOIN news_article a ON a.id = v.article_id
      WHERE a.category_id = ?
    `).all(id) as Array<{ id: number; content_json: string }>
    const updateVersion = database.prepare('UPDATE news_version SET content_json = ?, updated_at = ? WHERE id = ?')
    const timestamp = now()
    versions.forEach((version) => {
      const value = parseContent(version.content_json)
      value.cn.category = normalized
      updateVersion.run(JSON.stringify(value), timestamp, version.id)
    })
    writeAudit(adminId, 'RENAME_CATEGORY', 'news_category', String(id), { from: category.name, to: normalized })
  })()
  return listCmsCategories().find((item) => item.id === id)
}

export function mergeCmsCategory(id: number, targetId: number, adminId: number) {
  if (usesPostgres()) return postgresStore.mergeCmsCategory(id, targetId, adminId)
  if (id === targetId) throw new Error('不能将分类合并到自身。')
  const source = database.prepare('SELECT * FROM news_category WHERE id = ?').get(id) as { id: number; name: string } | undefined
  const target = database.prepare('SELECT * FROM news_category WHERE id = ?').get(targetId) as { id: number; name: string; status: CmsCategory['status'] } | undefined
  if (!source || !target) throw new Error('源分类或目标分类不存在。')
  if (target.status !== 'ACTIVE') throw new Error('目标分类必须处于启用状态。')
  database.transaction(() => {
    const versions = database.prepare(`
      SELECT v.id, v.content_json
      FROM news_version v
      JOIN news_article a ON a.id = v.article_id
      WHERE a.category_id = ?
    `).all(id) as Array<{ id: number; content_json: string }>
    const updateVersion = database.prepare('UPDATE news_version SET content_json = ?, updated_at = ? WHERE id = ?')
    const timestamp = now()
    versions.forEach((version) => {
      const value = parseContent(version.content_json)
      value.cn.category = target.name
      updateVersion.run(JSON.stringify(value), timestamp, version.id)
    })
    database.prepare('UPDATE news_article SET category_id = ?, updated_at = ? WHERE category_id = ?').run(targetId, timestamp, id)
    database.prepare('DELETE FROM news_category WHERE id = ?').run(id)
    writeAudit(adminId, 'MERGE_CATEGORY', 'news_category', String(id), { sourceName: source.name, targetId, targetName: target.name })
  })()
  return listCmsCategories().find((item) => item.id === targetId)
}

export function deleteCmsCategory(id: number, adminId: number) {
  if (usesPostgres()) return postgresStore.deleteCmsCategory(id, adminId)
  const category = database.prepare('SELECT * FROM news_category WHERE id = ?').get(id) as { id: number; name: string } | undefined
  if (!category) throw new Error('分类不存在。')
  const references = database.prepare('SELECT COUNT(*) AS total FROM news_article WHERE category_id = ?').get(id) as { total: number }
  if (references.total > 0) throw new Error(`该分类仍被 ${references.total} 篇稿件引用，请先合并分类或调整稿件分类。`)
  database.transaction(() => {
    database.prepare('DELETE FROM news_category WHERE id = ?').run(id)
    writeAudit(adminId, 'DELETE_CATEGORY', 'news_category', String(id), { name: category.name })
  })()
}

export function moveCmsArticleToTrash(id: number, adminId: number) {
  if (usesPostgres()) return postgresStore.moveCmsArticleToTrash(id, adminId)
  const row = database.prepare('SELECT * FROM news_article WHERE id = ?').get(id) as ArticleRow | undefined
  if (!row || row.status === 'TRASH') throw new Error('新闻不存在或已在回收站。')
  const timestamp = now()
  database.transaction(() => {
    let draftVersionId = row.draft_version_id
    if (!draftVersionId && row.published_version_id) {
      const published = database.prepare('SELECT * FROM news_version WHERE id = ?').get(row.published_version_id) as VersionRow | undefined
      if (published) {
        const next = database.prepare('SELECT COALESCE(MAX(version_no), 0) + 1 AS value FROM news_version WHERE article_id = ?').get(id) as { value: number }
        const created = database.prepare("INSERT INTO news_version (article_id, version_no, state, content_json, previewed_at, created_at, updated_at) VALUES (?, ?, 'DRAFT', ?, NULL, ?, ?)").run(id, next.value, published.content_json, timestamp, timestamp)
        draftVersionId = Number(created.lastInsertRowid)
      }
    }
    if (row.published_version_id) database.prepare("UPDATE news_version SET state = 'ARCHIVED', updated_at = ? WHERE id = ?").run(timestamp, row.published_version_id)
    database.prepare("UPDATE news_article SET status = 'TRASH', deleted_at = ?, deleted_from_status = ?, published_version_id = NULL, draft_version_id = ?, is_pinned = 0, pinned_position = NULL, manual_position = NULL, updated_at = ? WHERE id = ?").run(timestamp, row.status, draftVersionId, timestamp, id)
    writeAudit(adminId, 'MOVE_TO_TRASH', 'news_article', String(id), { from: row.status })
  })()
}

export function restoreCmsArticle(id: number, adminId: number) {
  if (usesPostgres()) return postgresStore.restoreCmsArticle(id, adminId)
  const row = database.prepare('SELECT * FROM news_article WHERE id = ?').get(id) as ArticleRow | undefined
  if (!row || row.status !== 'TRASH') throw new Error('只有回收站稿件可以恢复。')
  database.prepare("UPDATE news_article SET status = 'DRAFT', deleted_at = NULL, deleted_from_status = NULL, updated_at = ? WHERE id = ?").run(now(), id)
  writeAudit(adminId, 'RESTORE_FROM_TRASH', 'news_article', String(id), {})
}

export function deleteCmsArticlePermanently(id: number, adminId: number) {
  if (usesPostgres()) return postgresStore.deleteCmsArticlePermanently(id, adminId)
  const row = database.prepare('SELECT * FROM news_article WHERE id = ?').get(id) as ArticleRow | undefined
  if (!row || row.status !== 'TRASH') throw new Error('只有回收站稿件可以永久删除。')
  database.transaction(() => { database.prepare('DELETE FROM news_version WHERE article_id = ?').run(id); database.prepare('DELETE FROM news_article WHERE id = ?').run(id); writeAudit(adminId, 'DELETE_PERMANENTLY', 'news_article', String(id), {}) })()
}

export function setCmsArticlePinned(id: number, pinned: boolean, adminId: number) {
  if (usesPostgres()) return postgresStore.setCmsArticlePinned(id, pinned, adminId)
  const row = database.prepare('SELECT * FROM news_article WHERE id = ?').get(id) as ArticleRow | undefined
  if (!row || row.status !== 'PUBLISHED') throw new Error('只有已发布稿件可以置顶。')
  const position = pinned ? Number((database.prepare('SELECT COALESCE(MIN(pinned_position), 0) - 1 AS value FROM news_article WHERE status = ? AND is_pinned = 1').get('PUBLISHED') as { value: number }).value) : null
  database.prepare('UPDATE news_article SET is_pinned = ?, pinned_position = ?, updated_at = ? WHERE id = ?').run(pinned ? 1 : 0, position, now(), id)
  writeAudit(adminId, pinned ? 'PIN_ARTICLE' : 'UNPIN_ARTICLE', 'news_article', String(id), {})
}

export function reorderCmsPublishedArticles(ids: number[], adminId: number) {
  if (usesPostgres()) return postgresStore.reorderCmsPublishedArticles(ids, adminId)
  if (!ids.length || new Set(ids).size !== ids.length) throw new Error('排序参数不正确。')
  const rows = database.prepare("SELECT id, is_pinned FROM news_article WHERE status = 'PUBLISHED'").all() as { id: number; is_pinned: number }[]
  if (rows.length !== ids.length || rows.some((row) => !ids.includes(row.id))) throw new Error('排序必须包含全部已发布稿件。')
  const update = database.prepare('UPDATE news_article SET pinned_position = ?, manual_position = ?, updated_at = ? WHERE id = ?')
  const timestamp = now()
  database.transaction(() => {
    ids.forEach((id, index) => {
      const row = rows.find((item) => item.id === id)!
      update.run(row.is_pinned ? index : null, row.is_pinned ? null : index, timestamp, id)
    })
    writeAudit(adminId, 'REORDER_PUBLISHED', 'news_article', 'published', { ids })
  })()
}

export function importCmsArticleIdempotent(content: CmsArticleContent, sourceId: string, idempotencyKey: string, payloadHash: string): CmsImportResult | Promise<CmsImportResult> {
  if (usesPostgres()) return postgresStore.importCmsArticleIdempotent(content, sourceId, idempotencyKey, payloadHash)
  const key = idempotencyKey.trim()
  const hash = payloadHash.trim()
  if (!key || !hash) throw new Error('导入请求缺少幂等键或载荷摘要。')
  const source = 'NEWS_WORKBENCH'
  return database.transaction(() => {
    const existing = database.prepare('SELECT payload_hash, result FROM integration_delivery WHERE source = ? AND idempotency_key = ?').get(source, key) as { payload_hash: string; result: string | null } | undefined
    if (existing) {
      if (existing.payload_hash !== hash) throw new Error('相同幂等键已用于不同内容，请更换幂等键。')
      if (!existing.result) throw new Error('该导入请求仍在处理中，请稍后重试。')
      const result = JSON.parse(existing.result) as CmsImportResult
      return { ...result, duplicate: true }
    }
    const timestamp = now()
    database.prepare('INSERT INTO integration_delivery (source, external_id, idempotency_key, payload_hash, result, created_at, updated_at) VALUES (?, ?, ?, ?, NULL, ?, ?)').run(source, sourceId, key, hash, timestamp, timestamp)
    const categoryName = content.cn.category.trim()
    const categoryCreated = Boolean(categoryName && !database.prepare('SELECT id FROM news_category WHERE name = ?').get(categoryName))
    const articleId = importCmsArticle(content, sourceId) as number
    const result: CmsImportResult = { articleId, duplicate: false, categoryCreated }
    database.prepare('UPDATE integration_delivery SET result = ?, updated_at = ? WHERE source = ? AND idempotency_key = ?').run(JSON.stringify(result), now(), source, key)
    return result
  })()
}

export function createTranslationJob(versionId: number, targetLocale: 'jp' | 'hk', provider: string, model: string) {
  if (usesPostgres()) return postgresStore.createTranslationJob(versionId, targetLocale, provider, model)
  if (!Number.isInteger(versionId) || versionId < 1 || !provider.trim() || !model.trim()) throw new Error('翻译任务参数不完整。')
  const timestamp = now()
  const result = database.prepare("INSERT INTO translation_job (version_id, target_locale, status, provider, model, created_at, updated_at) VALUES (?, ?, 'PENDING', ?, ?, ?, ?)").run(versionId, targetLocale, provider.trim(), model.trim(), timestamp, timestamp)
  return Number(result.lastInsertRowid)
}

export function completeTranslationJob(jobId: number) {
  if (usesPostgres()) return postgresStore.completeTranslationJob(jobId)
  const result = database.prepare("UPDATE translation_job SET status = 'SUCCEEDED', error_code = NULL, updated_at = ? WHERE id = ? AND status = 'PENDING'").run(now(), jobId)
  if (!result.changes) throw new Error('待完成的翻译任务不存在。')
}

export function failTranslationJob(jobId: number, errorCode: string) {
  if (usesPostgres()) return postgresStore.failTranslationJob(jobId, errorCode)
  const result = database.prepare("UPDATE translation_job SET status = 'FAILED', error_code = ?, updated_at = ? WHERE id = ? AND status = 'PENDING'").run(errorCode.trim() || 'UNKNOWN', now(), jobId)
  if (!result.changes) throw new Error('待失败标记的翻译任务不存在。')
}

export function recordCmsAsset(asset: CmsAssetInput, adminId: number | null = null) {
  if (usesPostgres()) return postgresStore.recordCmsAsset(asset, adminId)
  if (!asset.id.trim() || !asset.blobUrl.trim() || asset.width < 1 || asset.height < 1) throw new Error('素材元数据不完整。')
  const timestamp = now()
  database.prepare(`
    INSERT INTO cms_asset (id, article_id, blob_url, thumbnail_url, mime_type, width, height, alt_text, usage, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET article_id = excluded.article_id, blob_url = excluded.blob_url,
      thumbnail_url = excluded.thumbnail_url, mime_type = excluded.mime_type, width = excluded.width,
      height = excluded.height, alt_text = excluded.alt_text, usage = excluded.usage, updated_at = excluded.updated_at
  `).run(asset.id.trim(), asset.articleId ?? null, asset.blobUrl.trim(), asset.thumbnailUrl ?? null, asset.mimeType, asset.width, asset.height, asset.altText ?? null, asset.usage, timestamp, timestamp)
  writeAudit(adminId, 'RECORD_ASSET', 'cms_asset', asset.id.trim(), { articleId: asset.articleId ?? null, usage: asset.usage, blobUrl: asset.blobUrl })
  return asset.id.trim()
}

export function listCmsAuditLogs(targetType: string, targetId: string, limit = 50): CmsAuditLog[] | Promise<CmsAuditLog[]> {
  if (usesPostgres()) return postgresStore.listCmsAuditLogs(targetType, targetId, limit)
  const safeLimit = Math.max(1, Math.min(200, Math.trunc(limit) || 50))
  const rows = database.prepare(`
    SELECT l.id, l.action, l.created_at, a.username AS admin_username, l.detail_json
    FROM cms_audit_log l
    LEFT JOIN cms_admin a ON a.id = l.admin_id
    WHERE l.target_type = ? AND l.target_id = ?
    ORDER BY l.created_at DESC, l.id DESC
    LIMIT ?
  `).all(targetType, targetId, safeLimit) as Array<{ id: number; action: string; created_at: string; admin_username: string | null; detail_json: string | null }>
  return rows.map((row) => ({ id: row.id, action: row.action, createdAt: row.created_at, adminUsername: row.admin_username, detail: row.detail_json ? JSON.parse(row.detail_json) : null }))
}

export function writeAudit(adminId: number | null, action: string, targetType: string, targetId: string, detail: unknown) {
  if (usesPostgres()) return postgresStore.writeAudit(adminId, action, targetType, targetId, detail)
  database.prepare('INSERT INTO cms_audit_log (admin_id, action, target_type, target_id, detail_json, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(adminId, action, targetType, targetId, JSON.stringify(detail), now())
}

export function getDatabase() {
  return loadSqliteDatabase()
}
