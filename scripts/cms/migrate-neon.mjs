#!/usr/bin/env node
import { readFileSync, readdirSync } from 'node:fs'
import { relative } from 'node:path'
import { neon } from '@neondatabase/serverless'
import { databaseUrl, fail, hasFlag, option, requireFile, resolveFromRoot, sha256, sqlStatements } from './_shared.mjs'

const help = `用法：npm run cms:migrate -- [选项]

将 CMS PostgreSQL schema 迁移应用到 Neon。数据库地址只从
CMS_DATABASE_URL 或 DATABASE_URL 读取，不会打印到终端。

选项：
  --file <路径>  只执行指定迁移；默认按文件名顺序执行 db/migrations/*.sql
  --dry-run      只解析并校验 SQL，不连接数据库
  --help         显示帮助
`

async function main() {
  if (hasFlag('--help')) return console.log(help)
  const selected = option('--file', '')
  const files = selected
    ? [requireFile(resolveFromRoot(selected), '迁移文件')]
    : readdirSync(resolveFromRoot('db/migrations'), { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
      .map((entry) => resolveFromRoot(`db/migrations/${entry.name}`))
      .sort()
  if (!files.length) throw new Error('db/migrations 中没有可执行的 SQL 迁移。')

  if (hasFlag('--dry-run')) {
    for (const file of files) {
      const statements = sqlStatements(file)
      if (!statements.length) throw new Error(`迁移文件不包含可执行 SQL：${file}`)
      console.log(`dry-run 通过：${relative(resolveFromRoot('db/migrations'), file)}，${statements.length} 条 SQL，checksum ${sha256(readFileSync(file)).slice(0, 12)}…`)
    }
    return
  }

  const sql = neon(databaseUrl())
  await sql.query(`CREATE TABLE IF NOT EXISTS cms_schema_migration (
    version TEXT PRIMARY KEY,
    checksum TEXT NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`)
  for (const file of files) {
    const statements = sqlStatements(file)
    if (!statements.length) throw new Error(`迁移文件不包含可执行 SQL：${file}`)
    const checksum = sha256(readFileSync(file))
    const version = file.replaceAll('\\', '/').split('/').at(-1)
    const applied = await sql.query('SELECT checksum FROM cms_schema_migration WHERE version = $1', [version])
    if (applied[0]) {
      if (applied[0].checksum !== checksum) throw new Error(`迁移 ${version} 已执行，但文件 checksum 已变化；请新增迁移文件，不要覆盖历史迁移。`)
      console.log(`无需执行：${version} 已应用。`)
      continue
    }
    await sql.transaction((tx) => [
      ...statements.map((statement) => tx.query(statement)),
      tx.query('INSERT INTO cms_schema_migration (version, checksum) VALUES ($1, $2)', [version, checksum]),
    ])
    console.log(`迁移完成：${version}（${statements.length} 条 SQL）。`)
  }
}

main().catch(fail)
