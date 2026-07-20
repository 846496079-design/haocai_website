#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process'
import { closeSync, mkdtempSync, openSync, readFileSync, rmSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = process.cwd()
const tempRoot = mkdtempSync(join(tmpdir(), 'zds-cms-optional-translation-'))
const databasePath = join(tempRoot, 'cms.sqlite')
const logPath = join(tempRoot, 'next.log')

function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (!address || typeof address === 'string') {
        server.close()
        reject(new Error('无法分配本地验收端口。'))
        return
      }
      server.close((error) => error ? reject(error) : resolve(address.port))
    })
  })
}

async function waitUntilReady(url, child) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (child.exitCode !== null) break
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`临时 Next.js 服务未就绪。\n${readFileSync(logPath, 'utf8')}`)
}

function runDatabaseScript(source) {
  const result = spawnSync(process.execPath, ['-e', source], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ZDS_SMOKE_DATABASE_PATH: databasePath },
  })
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || '隔离数据库脚本执行失败。')
}

function insertSmokeArticle() {
  runDatabaseScript(String.raw`
    const Database = require('better-sqlite3')
    const database = new Database(process.env.ZDS_SMOKE_DATABASE_PATH)
    const source = database.prepare("SELECT v.content_json FROM news_article a JOIN news_version v ON v.id = a.published_version_id WHERE a.status = 'PUBLISHED' LIMIT 1").get()
    if (!source) throw new Error('隔离数据库没有可复用的历史发布稿。')
    const content = JSON.parse(source.content_json)
    const slug = 'optional-translation-runtime-smoke'
    const title = '非阻塞翻译运行时验收稿'
    for (const locale of ['cn', 'jp', 'hk']) {
      content[locale].slug = slug
      content[locale].title = title
    }
    const timestamp = new Date().toISOString()
    const article = database.prepare("INSERT INTO news_article (slug, status, published_at, published_locales_complete, created_at, updated_at) VALUES (?, 'PUBLISHED', ?, 0, ?, ?)").run(slug, timestamp, timestamp, timestamp)
    const version = database.prepare("INSERT INTO news_version (article_id, version_no, state, content_json, previewed_at, created_at, updated_at) VALUES (?, 1, 'PUBLISHED', ?, ?, ?, ?)").run(article.lastInsertRowid, JSON.stringify(content), timestamp, timestamp, timestamp)
    database.prepare('UPDATE news_article SET published_version_id = ? WHERE id = ?').run(version.lastInsertRowid, article.lastInsertRowid)
    database.close()
  `)
}

function setForeignSitesVisible() {
  runDatabaseScript(String.raw`
    const Database = require('better-sqlite3')
    const database = new Database(process.env.ZDS_SMOKE_DATABASE_PATH)
    database.prepare("UPDATE news_article SET published_locales_complete = 1 WHERE slug = 'optional-translation-runtime-smoke'").run()
    database.close()
  `)
}

function cleanTemporaryDirectory() {
  try {
    rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 250 })
  } catch (error) {
    const retryable = process.platform === 'win32' && error instanceof Error && ['EPERM', 'EBUSY', 'ENOTEMPTY'].includes(error.code)
    if (!retryable) throw error
    const cleanup = spawn(process.execPath, ['-e', `
      const { rmSync } = require('node:fs')
      setTimeout(() => rmSync(process.env.ZDS_CLEANUP_TARGET, { recursive: true, force: true, maxRetries: 20, retryDelay: 250 }), 500)
    `], {
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, ZDS_CLEANUP_TARGET: tempRoot },
    })
    cleanup.unref()
  }
}

async function html(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${url} 返回 ${response.status}。`)
  return response.text()
}

const port = await freePort()
const logFd = openSync(logPath, 'a')
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '-H', '127.0.0.1', '-p', String(port)], {
  cwd: root,
  stdio: ['ignore', logFd, logFd],
  env: {
    ...process.env,
    DATABASE_URL: '',
    CMS_DATABASE_URL: '',
    CMS_DATABASE_PATH: databasePath,
    CMS_COOKIE_SECURE: 'false',
  },
})

try {
  const origin = `http://127.0.0.1:${port}`
  await waitUntilReady(`${origin}/cn/news/`, child)
  insertSmokeArticle()

  const [cn, jpHidden, hkHidden] = await Promise.all([
    html(`${origin}/cn/news/`),
    html(`${origin}/jp/news/`),
    html(`${origin}/hk/news/`),
  ])
  if (!cn.includes('非阻塞翻译运行时验收稿')) throw new Error('未翻译稿没有出现在中文站。')
  if (jpHidden.includes('非阻塞翻译运行时验收稿')) throw new Error('未翻译稿错误出现在日文站。')
  if (hkHidden.includes('非阻塞翻译运行时验收稿')) throw new Error('未翻译稿错误出现在香港站。')

  setForeignSitesVisible()
  const [jpVisible, hkVisible] = await Promise.all([
    html(`${origin}/jp/news/`),
    html(`${origin}/hk/news/`),
  ])
  if (!jpVisible.includes('非阻塞翻译运行时验收稿')) throw new Error('外语公开标识开启后，稿件没有出现在日文站。')
  if (!hkVisible.includes('非阻塞翻译运行时验收稿')) throw new Error('外语公开标识开启后，稿件没有出现在香港站。')
  console.log('隔离 SQLite 运行时验收通过：CN 可见；JP/HK 按发布快照隐藏和恢复。')
} finally {
  if (process.platform === 'win32' && child.pid) {
    spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
  } else {
    child.kill('SIGTERM')
  }
  await Promise.race([
    new Promise((resolve) => child.once('exit', resolve)),
    new Promise((resolve) => setTimeout(resolve, 3_000)),
  ])
  if (process.platform !== 'win32' && child.exitCode === null) child.kill('SIGKILL')
  closeSync(logFd)
  cleanTemporaryDirectory()
}
