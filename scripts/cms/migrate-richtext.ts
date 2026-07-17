#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { mkdir } from 'node:fs/promises'
import { dirname, relative } from 'node:path'
import Database from 'better-sqlite3'
import { neon } from '@neondatabase/serverless'
import { normalizeCmsContent } from '../../lib/cms/rich-text'
import { renderPublicationBody } from '../../lib/cms/publication-renderer'
import { CMS_LOCALES, CMS_RENDER_VERSION, type CmsArticleContent, type CmsRichTextNode } from '../../lib/cms/types'
import { databaseUrl, fail, hasFlag, option, resolveFromRoot } from './_shared.mjs'

type VersionRow = {
  id: number | string
  slug: string
  content: unknown
}

const help = `用法：npm run cms:migrate-richtext -- [选项]

将所有新闻版本从旧 lead/sections/closing 正文转换为统一富文本模型，
并生成公众号兼容的内联 HTML 快照。默认只演练，不写入。

选项：
  --apply               执行写入；SQLite 会先自动备份
  --verify              只校验；仍有待迁移版本时退出码为 1
  --postgres            操作 CMS_DATABASE_URL 或 DATABASE_URL 指向的 PostgreSQL
  --backup-confirmed    确认 PostgreSQL 已完成恢复点或备份；正式写入必填
  --source <路径>       SQLite 文件；默认 .data/news-cms.sqlite
  --help                显示帮助
`

function hash(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function prepare(value: unknown, slug: string): CmsArticleContent {
  const normalized = normalizeCmsContent(value, slug)
  return Object.fromEntries(CMS_LOCALES.map((locale) => {
    const article = normalized[locale]
    const publicationHtml = renderPublicationBody(article.body)
    return [locale, {
      ...article,
      body: {
        ...article.body,
        publicationHtml,
        contentHash: hash(publicationHtml),
        renderVersion: CMS_RENDER_VERSION,
      },
    }]
  })) as CmsArticleContent
}

function collectDocument(node: unknown, key: 'text' | 'src', output: string[] = []): string[] {
  if (!node || typeof node !== 'object') return output
  const current = node as CmsRichTextNode
  if (key === 'text' && current.type === 'text' && typeof current.text === 'string') output.push(current.text)
  if (key === 'src' && current.type === 'image' && typeof current.attrs?.src === 'string') output.push(current.attrs.src)
  current.content?.forEach((child) => collectDocument(child, key, output))
  return output
}

function collectLegacy(value: unknown, key: 'text' | 'src'): string[] | undefined {
  if (!value || typeof value !== 'object') return undefined
  const source = value as {
    lead?: unknown
    sections?: Array<{ title?: unknown; paragraphs?: unknown[]; image?: unknown }>
    closing?: unknown[]
  }
  if (typeof source.lead !== 'string' || !Array.isArray(source.sections) || !Array.isArray(source.closing)) return undefined
  if (key === 'src') return source.sections.map((section) => typeof section.image === 'string' ? section.image : '').filter(Boolean)
  const output = [source.lead.trim()].filter(Boolean)
  for (const section of source.sections) {
    if (typeof section.title === 'string' && section.title.trim()) output.push(section.title.trim())
    if (Array.isArray(section.paragraphs)) {
      for (const paragraph of section.paragraphs) {
        if (typeof paragraph === 'string' && paragraph.trim()) output.push(paragraph.trim())
      }
    }
  }
  for (const paragraph of source.closing) {
    if (typeof paragraph === 'string' && paragraph.trim()) output.push(paragraph.trim())
  }
  return output
}

function assertPreserved(source: unknown, target: CmsArticleContent, row: VersionRow) {
  const content = source && typeof source === 'object' ? source as Record<string, unknown> : {}
  for (const locale of CMS_LOCALES) {
    const input = content[locale]
    const legacyText = collectLegacy(input, 'text')
    const legacyImages = collectLegacy(input, 'src')
    const inputBody = input && typeof input === 'object' ? (input as { body?: { editorDocument?: unknown } }).body : undefined
    const sourceDocument = inputBody?.editorDocument
    const expectedText = legacyText ?? (sourceDocument ? collectDocument(sourceDocument, 'text') : [])
    const expectedImages = legacyImages ?? (sourceDocument ? collectDocument(sourceDocument, 'src') : [])
    const actualText = collectDocument(target[locale].body.editorDocument, 'text')
    const actualImages = collectDocument(target[locale].body.editorDocument, 'src')
    if (JSON.stringify(expectedText) !== JSON.stringify(actualText) || JSON.stringify(expectedImages) !== JSON.stringify(actualImages)) {
      throw new Error(`版本 ${row.id}（${row.slug}/${locale}）迁移前后文字或图片顺序不一致。`)
    }
    if (!target[locale].body.publicationHtml || !target[locale].body.contentHash) {
      throw new Error(`版本 ${row.id}（${row.slug}/${locale}）未生成发布快照。`)
    }
  }
}

function convert(rows: VersionRow[]) {
  return rows.map((row) => {
    const target = prepare(row.content, row.slug)
    assertPreserved(row.content, target, row)
    const before = JSON.stringify(row.content)
    const after = JSON.stringify(target)
    return { ...row, target, changed: before !== after }
  })
}

async function migrateSqlite(source: string, apply: boolean, verify: boolean) {
  const database = new Database(source, { readonly: !apply, fileMustExist: true })
  try {
    const rows = database.prepare(`
      SELECT v.id, a.slug, v.content_json
      FROM news_version v
      JOIN news_article a ON a.id = v.article_id
      ORDER BY v.id
    `).all().map((row) => {
      const value = row as { id: number; slug: string; content_json: string }
      return { id: value.id, slug: value.slug, content: JSON.parse(value.content_json) }
    })
    const converted = convert(rows)
    const changed = converted.filter((row) => row.changed)
    if (verify && changed.length) throw new Error(`SQLite 仍有 ${changed.length} 个新闻版本未迁移或发布快照已过期。`)
    if (apply && changed.length) {
      const backup = resolveFromRoot(`.data/backups/news-cms-before-richtext-${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`)
      await mkdir(dirname(backup), { recursive: true })
      await database.backup(backup)
      const update = database.prepare('UPDATE news_version SET content_json = ? WHERE id = ?')
      database.transaction(() => {
        for (const row of changed) update.run(JSON.stringify(row.target), row.id)
        database.prepare(`INSERT INTO cms_audit_log (admin_id, action, target_type, target_id, detail_json, created_at)
          VALUES (NULL, 'MIGRATE_RICHTEXT', 'cms_migration', 'cms-richtext.v1', ?, ?)`).run(
            JSON.stringify({ migratedVersions: changed.length, backup: relative(resolveFromRoot('.'), backup).replaceAll('\\', '/') }),
            new Date().toISOString(),
          )
      })()
      console.log(`SQLite 迁移完成：${changed.length}/${converted.length} 个版本；备份 ${backup}`)
      return
    }
    console.log(`${verify ? 'SQLite 校验通过' : 'SQLite 演练完成'}：共 ${converted.length} 个版本，待迁移 ${changed.length} 个。`)
  } finally {
    database.close()
  }
}

async function migratePostgres(apply: boolean, verify: boolean) {
  if (apply && !hasFlag('--backup-confirmed')) throw new Error('PostgreSQL 正式迁移前必须建立恢复点或备份，并传入 --backup-confirmed。')
  const sql = neon(databaseUrl())
  const result = await sql.query(`
    SELECT v.id, a.slug, v.content_json
    FROM news_version v
    JOIN news_article a ON a.id = v.article_id
    ORDER BY v.id
  `)
  const rows = result.map((row) => ({ id: row.id as string, slug: String(row.slug), content: row.content_json }))
  const converted = convert(rows)
  const changed = converted.filter((row) => row.changed)
  if (verify && changed.length) throw new Error(`PostgreSQL 仍有 ${changed.length} 个新闻版本未迁移或发布快照已过期。`)
  if (apply && changed.length) {
    await sql.transaction((transaction) => [
      ...changed.map((row) => transaction.query('UPDATE news_version SET content_json = $1::jsonb WHERE id = $2', [JSON.stringify(row.target), row.id])),
      transaction.query(`INSERT INTO cms_audit_log (admin_id, action, target_type, target_id, detail_json)
        VALUES (NULL, 'MIGRATE_RICHTEXT', 'cms_migration', 'cms-richtext.v1', $1::jsonb)`, [JSON.stringify({ migratedVersions: changed.length })]),
    ])
    console.log(`PostgreSQL 迁移完成：${changed.length}/${converted.length} 个版本。`)
    return
  }
  console.log(`${verify ? 'PostgreSQL 校验通过' : 'PostgreSQL 演练完成'}：共 ${converted.length} 个版本，待迁移 ${changed.length} 个。`)
}

async function main() {
  if (hasFlag('--help')) return console.log(help)
  const apply = hasFlag('--apply')
  const verify = hasFlag('--verify')
  if (apply && verify) throw new Error('--apply 与 --verify 不能同时使用。')
  if (hasFlag('--postgres')) return migratePostgres(apply, verify)
  const source = resolveFromRoot(option('--source', '.data/news-cms.sqlite'))
  return migrateSqlite(source, apply, verify)
}

main().catch(fail)
