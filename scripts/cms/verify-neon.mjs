#!/usr/bin/env node
import Database from 'better-sqlite3'
import { existsSync } from 'node:fs'
import { neon } from '@neondatabase/serverless'
import { contentHash, databaseUrl, fail, hasFlag, option, resolveFromRoot } from './_shared.mjs'

const help = `用法：npm run cms:verify -- [选项]

检查 Neon CMS schema、指针完整性、三语内容和可选的 SQLite 对账。
任一检查失败时退出码为 1，适合部署门禁。

选项：
  --source <路径>  与 SQLite 已发布新闻逐篇对账；默认存在时使用 .data/news-cms.sqlite
  --no-source      只检查 Neon，不做 SQLite 对账
  --dry-run        仅显示将执行的检查，不连接数据库
  --help           显示帮助
`

function sourceArticles(file) {
  const database = new Database(file, { readonly: true, fileMustExist: true })
  try {
    return database.prepare(`SELECT a.slug, v.content_json FROM news_article a JOIN news_version v ON v.id = a.published_version_id WHERE a.status = 'PUBLISHED'`).all()
      .map((row) => ({ slug: row.slug, content: JSON.parse(row.content_json) }))
  } finally { database.close() }
}

async function main() {
  if (hasFlag('--help')) return console.log(help)
  const defaultSource = resolveFromRoot('.data/news-cms.sqlite')
  const source = hasFlag('--no-source') ? undefined : resolveFromRoot(option('--source', defaultSource))
  if (hasFlag('--dry-run')) {
    console.log(`dry-run：将检查 schema、孤立版本指针、三语 JSON${source && existsSync(source) ? '，并与 SQLite 对账' : ''}；未连接 Neon。`)
    return
  }

  const sql = neon(databaseUrl())
  const requiredTables = ['cms_admin', 'cms_session', 'news_category', 'news_article', 'news_version', 'cms_audit_log']
  const tables = await sql.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ANY($1::text[])`, [requiredTables])
  const present = new Set(tables.map((row) => row.table_name))
  const missingTables = requiredTables.filter((table) => !present.has(table))
  if (missingTables.length) throw new Error(`Neon 缺少表：${missingTables.join(', ')}。请先运行 cms:migrate。`)
  const requiredArticleColumns = ['translation_status', 'published_locales_complete']
  const articleColumns = await sql.query(`SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'news_article' AND column_name = ANY($1::text[])`, [requiredArticleColumns])
  const presentArticleColumns = new Set(articleColumns.map((row) => row.column_name))
  const missingArticleColumns = requiredArticleColumns.filter((column) => !presentArticleColumns.has(column))
  if (missingArticleColumns.length) throw new Error(`news_article 缺少字段：${missingArticleColumns.join(', ')}。请先运行 cms:migrate。`)

  const [counts, broken, invalidContent, targetRows] = await Promise.all([
    sql.query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'PUBLISHED')::int AS published FROM news_article`),
    sql.query(`SELECT a.slug FROM news_article a LEFT JOIN news_version v ON v.id = a.published_version_id AND v.article_id = a.id WHERE a.status = 'PUBLISHED' AND v.id IS NULL`),
    sql.query(`SELECT a.slug FROM news_article a JOIN news_version v ON v.id = a.published_version_id WHERE a.status = 'PUBLISHED' AND NOT (v.content_json ? 'cn' AND v.content_json ? 'jp' AND v.content_json ? 'hk')`),
    sql.query(`SELECT a.slug, v.content_json FROM news_article a JOIN news_version v ON v.id = a.published_version_id WHERE a.status = 'PUBLISHED'`),
  ])
  if (broken.length) throw new Error(`发现 ${broken.length} 篇已发布稿件的 published_version_id 无效：${broken.slice(0, 5).map((row) => row.slug).join(', ')}`)
  if (invalidContent.length) throw new Error(`发现 ${invalidContent.length} 篇已发布稿件缺少三语内容：${invalidContent.slice(0, 5).map((row) => row.slug).join(', ')}`)

  if (source && existsSync(source)) {
    const expected = sourceArticles(source)
    const actual = new Map(targetRows.map((row) => [row.slug, row.content_json]))
    const missing = expected.filter((article) => !actual.has(article.slug))
    const changed = expected.filter((article) => actual.has(article.slug) && contentHash(article.content) !== contentHash(actual.get(article.slug)))
    if (missing.length || changed.length) throw new Error(`SQLite 对账失败：缺少 ${missing.length} 篇，内容不一致 ${changed.length} 篇。`)
    console.log(`SQLite 对账通过：${expected.length} 篇历史已发布新闻一致。`)
  } else if (source) {
    console.log(`提示：未找到 SQLite 源文件 ${source}，已跳过逐篇对账。`)
  }
  console.log(`Neon 校验通过：稿件 ${counts[0].total} 篇，其中已发布 ${counts[0].published} 篇。`)
}

main().catch(fail)
