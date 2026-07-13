import 'server-only'

import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { basename, dirname, extname, join } from 'node:path'
import { newsArticles, type NewsArticle } from '@/lib/news-content'
import type { SiteCode } from '@/lib/site-content'
import { CMS_LOCALES, createEmptyContent, isContentComplete, type CmsArticleContent, type CmsArticleRecord, type CmsArticleStatus, type CmsArticleSummary } from './types'

type ArticleRow = {
  id: number
  slug: string
  status: CmsArticleStatus
  published_version_id: number | null
  draft_version_id: number | null
  published_at: string | null
  updated_at: string
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
mkdirSync(dirname(databasePath), { recursive: true })
const database = new Database(databasePath)
database.pragma('journal_mode = WAL')
database.pragma('foreign_keys = ON')

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
  `)
}

initialize()

function optimizedCoverPath(cover: string) {
  if (extname(cover).toLowerCase() !== '.png') return cover
  return `/images/news/optimized/${basename(cover, extname(cover))}.webp`
}

function normalizeArticle(article: NewsArticle, slug: string): NewsArticle {
  return { ...article, slug, cover: optimizedCoverPath(article.cover), tags: article.tags ?? [], sections: article.sections.map((section) => ({ ...section, paragraphs: [...section.paragraphs] })), closing: [...article.closing] }
}

function seedLegacyArticles() {
  const count = database.prepare('SELECT COUNT(*) AS total FROM news_article').get() as { total: number }
  if (count.total) return
  const insert = database.transaction(() => {
    const articleStatement = database.prepare('INSERT INTO news_article (slug, status, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
    const versionStatement = database.prepare('INSERT INTO news_version (article_id, version_no, state, content_json, created_at, updated_at) VALUES (?, 1, ?, ?, ?, ?)')
    const updateStatement = database.prepare('UPDATE news_article SET published_version_id = ?, updated_at = ? WHERE id = ?')
    newsArticles.cn.forEach((cnArticle) => {
      const content = Object.fromEntries(CMS_LOCALES.map((locale) => {
        const article = newsArticles[locale].find((item) => item.slug === cnArticle.slug) ?? cnArticle
        return [locale, normalizeArticle(article, cnArticle.slug)]
      })) as CmsArticleContent
      const timestamp = now()
      const articleResult = articleStatement.run(cnArticle.slug, 'PUBLISHED', timestamp, timestamp, timestamp)
      const versionResult = versionStatement.run(articleResult.lastInsertRowid, 'PUBLISHED', JSON.stringify(content), timestamp, timestamp)
      updateStatement.run(versionResult.lastInsertRowid, timestamp, articleResult.lastInsertRowid)
    })
  })
  insert()
}

seedLegacyArticles()

function parseContent(value: string): CmsArticleContent {
  const parsed = JSON.parse(value) as Partial<CmsArticleContent>
  const fallback = createEmptyContent()
  CMS_LOCALES.forEach((locale) => {
    fallback[locale] = normalizeArticle(parsed[locale] ?? fallback[locale], parsed[locale]?.slug ?? '')
  })
  return fallback
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
    status: row.status,
    date: first.date,
    cover: first.cover,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    localesComplete: isContentComplete(content),
    content,
    previewedAt: version.previewed_at,
    versionNo: version.version_no,
  }
}

export function listCmsArticles(): CmsArticleSummary[] {
  return (database.prepare('SELECT * FROM news_article ORDER BY updated_at DESC').all() as ArticleRow[]).flatMap((row) => {
    const version = versionFor(row)
    if (!version) return []
    const record = toRecord(row, version)
    const { content: _content, previewedAt: _previewedAt, versionNo: _versionNo, ...summary } = record
    return [summary]
  })
}

export function getCmsArticle(id: number): CmsArticleRecord | undefined {
  const row = database.prepare('SELECT * FROM news_article WHERE id = ?').get(id) as ArticleRow | undefined
  const version = row && versionFor(row)
  return row && version ? toRecord(row, version) : undefined
}

export function getCmsPreviewArticle(id: number, locale: SiteCode) {
  const record = getCmsArticle(id)
  return record ? record.content[locale] : undefined
}

export function getPublishedArticles(locale: SiteCode): NewsArticle[] {
  const rows = database.prepare("SELECT * FROM news_article WHERE status = 'PUBLISHED' AND published_version_id IS NOT NULL ORDER BY published_at DESC").all() as ArticleRow[]
  return rows.flatMap((row) => {
    const version = versionFor(row, false)
    return version ? [parseContent(version.content_json)[locale]] : []
  })
}

export function getPublishedArticle(locale: SiteCode, slug: string) {
  return getPublishedArticles(locale).find((article) => article.slug === slug)
}

export function createCmsArticle(slug: string, adminId: number) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('文章路径仅支持小写字母、数字和连字符。')
  const timestamp = now()
  const operation = database.transaction(() => {
    const result = database.prepare('INSERT INTO news_article (slug, status, created_at, updated_at) VALUES (?, ?, ?, ?)').run(slug, 'DRAFT', timestamp, timestamp)
    const versionResult = database.prepare('INSERT INTO news_version (article_id, version_no, state, content_json, created_at, updated_at) VALUES (?, 1, ?, ?, ?, ?)').run(result.lastInsertRowid, 'DRAFT', JSON.stringify(createEmptyContent(slug)), timestamp, timestamp)
    database.prepare('UPDATE news_article SET draft_version_id = ? WHERE id = ?').run(versionResult.lastInsertRowid, result.lastInsertRowid)
    writeAudit(adminId, 'CREATE_DRAFT', 'news_article', String(result.lastInsertRowid), { slug })
    return Number(result.lastInsertRowid)
  })
  return operation()
}

export function updateCmsDraft(id: number, content: CmsArticleContent, adminId: number) {
  const row = database.prepare('SELECT * FROM news_article WHERE id = ?').get(id) as ArticleRow | undefined
  if (!row) throw new Error('新闻不存在。')
  const timestamp = now()
  const operation = database.transaction(() => {
    let version = versionFor(row)
    if (!version || version.id === row.published_version_id) {
      const source = version ? parseContent(version.content_json) : createEmptyContent(row.slug)
      const result = database.prepare('INSERT INTO news_version (article_id, version_no, state, content_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)').run(row.id, (version?.version_no ?? 0) + 1, 'DRAFT', JSON.stringify(source), timestamp, timestamp)
      database.prepare('UPDATE news_article SET draft_version_id = ? WHERE id = ?').run(result.lastInsertRowid, row.id)
      version = database.prepare('SELECT * FROM news_version WHERE id = ?').get(result.lastInsertRowid) as VersionRow
    }
    const normalized = Object.fromEntries(CMS_LOCALES.map((locale) => [locale, normalizeArticle(content[locale], row.slug)])) as CmsArticleContent
    database.prepare('UPDATE news_version SET content_json = ?, previewed_at = NULL, updated_at = ? WHERE id = ?').run(JSON.stringify(normalized), timestamp, version.id)
    database.prepare("UPDATE news_article SET status = CASE WHEN published_version_id IS NULL THEN 'DRAFT' ELSE status END, updated_at = ? WHERE id = ?").run(timestamp, row.id)
    writeAudit(adminId, 'SAVE_DRAFT', 'news_article', String(row.id), { versionId: version.id })
  })
  operation()
  return getCmsArticle(id)
}

export function markCmsPreviewed(id: number, adminId: number) {
  const row = database.prepare('SELECT * FROM news_article WHERE id = ?').get(id) as ArticleRow | undefined
  const version = row && versionFor(row)
  if (!row || !version) throw new Error('新闻草稿不存在。')
  const timestamp = now()
  database.prepare('UPDATE news_version SET previewed_at = ?, updated_at = ? WHERE id = ?').run(timestamp, timestamp, version.id)
  writeAudit(adminId, 'PREVIEW_DRAFT', 'news_article', String(id), { versionId: version.id })
}

export function publishCmsArticle(id: number, adminId: number, reviewed: boolean) {
  if (!reviewed) throw new Error('请先完成人工审核确认。')
  const row = database.prepare('SELECT * FROM news_article WHERE id = ?').get(id) as ArticleRow | undefined
  const version = row && versionFor(row)
  if (!row || !version) throw new Error('新闻草稿不存在。')
  const content = parseContent(version.content_json)
  if (!version.previewed_at) throw new Error('请先预览当前草稿。')
  if (!isContentComplete(content)) throw new Error('CN、JP、HK 内容、封面和正文必须完整后才能发布。')
  const timestamp = now()
  const operation = database.transaction(() => {
    if (row.published_version_id && row.published_version_id !== version.id) database.prepare("UPDATE news_version SET state = 'ARCHIVED', updated_at = ? WHERE id = ?").run(timestamp, row.published_version_id)
    database.prepare("UPDATE news_version SET state = 'PUBLISHED', updated_at = ? WHERE id = ?").run(timestamp, version.id)
    database.prepare("UPDATE news_article SET status = 'PUBLISHED', published_version_id = ?, draft_version_id = NULL, published_at = ?, offline_at = NULL, updated_at = ? WHERE id = ?").run(version.id, timestamp, timestamp, row.id)
    writeAudit(adminId, 'PUBLISH', 'news_article', String(row.id), { versionId: version.id })
  })
  operation()
}

export function offlineCmsArticle(id: number, adminId: number) {
  const row = database.prepare('SELECT * FROM news_article WHERE id = ?').get(id) as ArticleRow | undefined
  if (!row || row.status !== 'PUBLISHED') throw new Error('只有已发布新闻可以下线。')
  const timestamp = now()
  database.prepare("UPDATE news_article SET status = 'OFFLINE', offline_at = ?, updated_at = ? WHERE id = ?").run(timestamp, timestamp, id)
  writeAudit(adminId, 'OFFLINE', 'news_article', String(id), {})
}

export function writeAudit(adminId: number | null, action: string, targetType: string, targetId: string, detail: unknown) {
  database.prepare('INSERT INTO cms_audit_log (admin_id, action, target_type, target_id, detail_json, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(adminId, action, targetType, targetId, JSON.stringify(detail), now())
}

export function getDatabase() {
  return database
}
