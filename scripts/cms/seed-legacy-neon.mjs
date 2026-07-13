#!/usr/bin/env node
import Database from 'better-sqlite3'
import { neon } from '@neondatabase/serverless'
import { databaseUrl, fail, hasFlag, option, requireFile, resolveFromRoot, sha256 } from './_shared.mjs'

const help = `用法：npm run cms:seed-legacy -- [选项]

把本地 SQLite 中当前已发布的新闻版本导入 Neon。脚本按 slug 幂等：
目标库已有同 slug 时跳过，不覆盖线上内容，也不迁移管理员或会话。

选项：
  --source <路径>  SQLite 文件，默认 .data/news-cms.sqlite
  --dry-run        只读取、校验并列出数量，不连接 Neon
  --help           显示帮助
`

function categorySlug(name) {
  const normalized = name.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '') || 'category'
  return `${normalized}-legacy-${sha256(name).slice(0, 6)}`
}

function readSource(file) {
  const database = new Database(file, { readonly: true, fileMustExist: true })
  try {
    const rows = database.prepare(`
      SELECT a.slug, a.published_at, a.created_at, a.updated_at, v.content_json
      FROM news_article a
      JOIN news_version v ON v.id = a.published_version_id
      WHERE a.status = 'PUBLISHED' AND a.published_version_id IS NOT NULL
      ORDER BY a.id
    `).all()
    return rows.map((row) => {
      let content
      try { content = JSON.parse(row.content_json) } catch { throw new Error(`SQLite 稿件 ${row.slug} 的 content_json 无效。`) }
      if (!content.cn || !content.jp || !content.hk) throw new Error(`SQLite 稿件 ${row.slug} 缺少 cn、jp 或 hk 内容。`)
      if (content.cn.slug !== row.slug) throw new Error(`SQLite 稿件 ${row.slug} 的中文内容 slug 不一致。`)
      return { ...row, content, category: String(content.cn.category || '').trim() }
    })
  } finally {
    database.close()
  }
}

async function main() {
  if (hasFlag('--help')) return console.log(help)
  const source = requireFile(resolveFromRoot(option('--source', '.data/news-cms.sqlite')), 'SQLite 源文件')
  const articles = readSource(source)
  if (!articles.length) throw new Error('SQLite 中没有可迁移的已发布稿件。')
  if (hasFlag('--dry-run')) {
    console.log(`dry-run 通过：读取并校验 ${articles.length} 篇已发布稿件；未连接 Neon。`)
    return
  }

  const sql = neon(databaseUrl())
  let inserted = 0
  let skipped = 0
  for (const article of articles) {
    const rows = await sql.query(`
      WITH category_upsert AS (
        INSERT INTO news_category (name, slug, status, source)
        SELECT $2, $3, 'ACTIVE', 'MANUAL' WHERE $2 <> ''
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      ), article_insert AS (
        INSERT INTO news_article (slug, status, category_id, published_at, created_at, updated_at)
        VALUES ($1, 'PUBLISHED', (SELECT id FROM category_upsert), $4, $5, $6)
        ON CONFLICT (slug) DO NOTHING
        RETURNING id
      ), version_insert AS (
        INSERT INTO news_version (article_id, version_no, state, content_json, created_at, updated_at)
        SELECT id, 1, 'PUBLISHED', $7::jsonb, $5, $6 FROM article_insert
        RETURNING id, article_id
      )
      UPDATE news_article a
      SET published_version_id = v.id
      FROM version_insert v
      WHERE a.id = v.article_id
      RETURNING a.id
    `, [article.slug, article.category, categorySlug(article.category || article.slug), article.published_at, article.created_at, article.updated_at, JSON.stringify(article.content)])
    if (rows.length) inserted += 1
    else skipped += 1
  }
  console.log(`历史新闻导入完成：新增 ${inserted} 篇，跳过已有 slug ${skipped} 篇。`)
}

main().catch(fail)
