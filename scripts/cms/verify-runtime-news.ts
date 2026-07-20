import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const locales = ['cn', 'jp', 'hk'] as const

const runtimeRoutes = locales.flatMap((locale) => [
  `app/${locale}/page.tsx`,
  `app/${locale}/news/page.tsx`,
  `app/${locale}/news/[slug]/page.tsx`,
])

for (const route of runtimeRoutes) {
  const source = readFileSync(resolve(root, route), 'utf8')
  assert.match(source, /export const dynamic = ['"]force-dynamic['"]/, `${route} 必须按请求读取 CMS 数据。`)
  assert.match(source, /getPublishedArticles/, `${route} 必须使用现有 CMS 已发布列表读取函数。`)
  if (route.includes('[slug]')) {
    assert.match(source, /getPublishedArticle\(/, `${route} 必须使用现有 CMS 已发布详情读取函数。`)
  }
}

for (const locale of locales) {
  for (const page of ['product', 'company']) {
    const route = `app/${locale}/${page}/page.tsx`
    const source = readFileSync(resolve(root, route), 'utf8')
    assert.doesNotMatch(source, /export const dynamic = ['"]force-dynamic['"]/, `${route} 不应被本次修复改为动态路由。`)
  }
}

console.log('三站 CMS 新闻运行时读取路由验证通过。')
