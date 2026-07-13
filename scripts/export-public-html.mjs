import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const projectRoot = process.cwd()
const baseUrl = process.env.PUBLIC_EXPORT_BASE_URL ?? 'http://127.0.0.1:3000'
const outputRoot = path.resolve(projectRoot, process.env.PUBLIC_EXPORT_DIR ?? 'dist/public-static')

const pages = [
  '/cn/', '/cn/product/', '/cn/company/', '/cn/cases/', '/cn/partners/', '/cn/join/', '/cn/news/',
  '/hk/', '/hk/product/', '/hk/company/', '/hk/cases/', '/hk/partners/', '/hk/join/', '/hk/news/',
  '/jp/', '/jp/product/', '/jp/company/', '/jp/cases/', '/jp/partners/', '/jp/join/', '/jp/news/',
]

function outputFile(pagePath) {
  const relativePath = pagePath.replace(/^\/+|\/+$/g, '')
  return path.join(outputRoot, relativePath, 'index.html')
}

async function exportPage(pagePath) {
  const response = await fetch(new URL(pagePath, baseUrl))
  if (!response.ok) throw new Error(`导出 ${pagePath} 失败：HTTP ${response.status}`)
  const target = outputFile(pagePath)
  await mkdir(path.dirname(target), { recursive: true })
  await writeFile(target, await response.text(), 'utf8')
}

async function copyRuntimeAssets() {
  const publicDir = path.join(projectRoot, 'public')
  const nextStaticDir = path.join(projectRoot, '.next', 'static')
  await cp(publicDir, outputRoot, { recursive: true, force: true })
  await cp(nextStaticDir, path.join(outputRoot, '_next', 'static'), { recursive: true, force: true })
}

await rm(outputRoot, { recursive: true, force: true })
await mkdir(outputRoot, { recursive: true })
for (const pagePath of pages) await exportPage(pagePath)
await copyRuntimeAssets()
console.log(`已导出 ${pages.length} 个公开页面到 ${outputRoot}`)
