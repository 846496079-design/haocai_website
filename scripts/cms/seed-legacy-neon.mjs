#!/usr/bin/env node
import Database from 'better-sqlite3'
import { neon } from '@neondatabase/serverless'
import { databaseUrl, fail, hasFlag, option, requireFile, resolveFromRoot, sha256 } from './_shared.mjs'

const help = `用法：npm run cms:seed-legacy -- [选项]

把本地 SQLite 中当前已发布的新闻版本导入 Neon。脚本按 slug 幂等：
目标库已有且版本指针有效时跳过；指针缺失或无效时只修复版本关系，
不覆盖线上内容，也不迁移管理员或会话。

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
  let repaired = 0
  for (const article of articles) {
    const categoryRows = await sql.query(`
      INSERT INTO news_category (name, slug, status, source)
      SELECT $1, $2, 'ACTIVE', 'MANUAL' WHERE $1 <> ''
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `, [article.category, categorySlug(article.category || article.slug)])
    const categoryId = categoryRows[0]?.id || null

    const articleRows = await sql.query(`
      INSERT INTO news_article (slug, status, category_id, published_at, created_at, updated_at)
      VALUES ($1, 'PUBLISHED', $2, $3, $4, $5)
      ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug
      RETURNING id, published_version_id, (xmax = 0) AS created
    `, [article.slug, categoryId, article.published_at, article.created_at, article.updated_at])
    const target = articleRows[0]
    const validPointer = await sql.query(`
      SELECT v.id
      FROM news_version v
      WHERE v.id = $1 AND v.article_id = $2
    `, [target.published_version_id, target.id])
    if (validPointer.length) {
      skipped += 1
      continue
    }

    const existingVersion = await sql.query(`
      SELECT id
      FROM news_version
      WHERE article_id = $1 AND state = 'PUBLISHED'
      ORDER BY version_no DESC, id DESC
      LIMIT 1
    `, [target.id])
    let versionId = existingVersion[0]?.id
    if (!versionId) {
      const versionRows = await sql.query(`
        INSERT INTO news_version (article_id, version_no, state, content_json, created_at, updated_at)
        VALUES ($1, 1, 'PUBLISHED', $2::jsonb, $3, $4)
        RETURNING id
      `, [target.id, JSON.stringify(article.content), article.created_at, article.updated_at])
      versionId = versionRows[0].id
    }
    await sql.query(`
      UPDATE news_article
      SET status = 'PUBLISHED', published_version_id = $2, draft_version_id = NULL,
        published_at = COALESCE(published_at, $3), updated_at = NOW()
      WHERE id = $1
    `, [target.id, versionId, article.published_at])
    if (target.created) inserted += 1
    else repaired += 1
  }
  console.log(`历史新闻导入完成：新增 ${inserted} 篇，修复不完整记录 ${repaired} 篇，跳过有效记录 ${skipped} 篇。`)
}

main().catch(fail)
