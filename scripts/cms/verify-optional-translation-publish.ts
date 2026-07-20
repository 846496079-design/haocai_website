import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  CMS_LOCALES,
  areAllLocalesReadyForPublication,
  createEmptyContent,
  isContentComplete,
  isLocaleContentComplete,
  type CmsLocaleArticle,
} from '../../lib/cms/types'

const root = process.cwd()

function readyLocale(article: CmsLocaleArticle, title: string): CmsLocaleArticle {
  return {
    ...article,
    title,
    summary: `${title}摘要`,
    category: '公司新闻',
    cover: '/images/news/test.webp',
    body: {
      ...article.body,
      editorDocument: {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: `${title}正文` }] }],
      },
      publicationHtml: `<p>${title}正文</p>`,
      contentHash: `${title}-hash`,
    },
  }
}

const chineseOnly = createEmptyContent('optional-translation-test')
chineseOnly.cn = readyLocale(chineseOnly.cn, '中文稿')
assert.equal(isLocaleContentComplete(chineseOnly.cn), true, '完整中文稿必须达到发布条件。')
assert.equal(isContentComplete(chineseOnly), false, '只有中文时不应被误判为三语完整。')
assert.equal(areAllLocalesReadyForPublication(chineseOnly, 'NOT_TRANSLATED'), false, '未翻译稿不能进入外语站。')

const complete = createEmptyContent('optional-translation-test')
for (const locale of CMS_LOCALES) complete[locale] = readyLocale(complete[locale], locale)
assert.equal(areAllLocalesReadyForPublication(complete, 'CURRENT'), true, '当前三语稿应允许三个站点公开。')
assert.equal(areAllLocalesReadyForPublication(complete, 'NOT_TRANSLATED'), true, '人工填写的完整三语稿不依赖模型调用。')
assert.equal(areAllLocalesReadyForPublication(complete, 'STALE'), false, '中文更新后的旧译稿不能进入外语站。')

const sqliteStore = readFileSync(resolve(root, 'lib/cms/store.ts'), 'utf8')
const postgresStore = readFileSync(resolve(root, 'lib/cms/store-postgres.ts'), 'utf8')
const editor = readFileSync(resolve(root, 'components/cms/cms-news-editor.tsx'), 'utf8')
const translation = readFileSync(resolve(root, 'lib/cms/translation.ts'), 'utf8')
const migration = readFileSync(resolve(root, 'db/migrations/003_optional_translation_publish.sql'), 'utf8')
const selfHosting = readFileSync(resolve(root, 'docs/cms/self-hosting-runbook.md'), 'utf8')
const neonVerifier = readFileSync(resolve(root, 'scripts/cms/verify-neon.mjs'), 'utf8')

for (const source of [sqliteStore, postgresStore]) {
  assert.match(source, /isLocaleContentComplete\([^)]*\.cn\)/, '双存储发布门禁都必须只要求中文完整。')
  assert.match(source, /published_locales_complete/, '双存储都必须固化外语公开状态。')
  assert.match(source, /areAllLocalesReadyForPublication/, '双存储必须共用同一外语公开判定。')
}
assert.match(sqliteStore, /locale !== 'cn' && !row\.published_locales_complete/, 'SQLite 的 JP/HK 公开读取必须过滤未翻译稿。')
assert.match(postgresStore, /\$1::text = 'cn' OR a\.published_locales_complete = TRUE/, 'PostgreSQL 的 JP/HK 公开读取必须过滤未翻译稿。')
assert.match(editor, /!chineseComplete \|\| dirty \|\| !hasCurrentPreview/, '发布按钮必须只使用中文完整度作为内容门禁。')
assert.doesNotMatch(editor, /disabled=\{saving \|\| uploading \|\| !complete/, '发布按钮不能继续被三语完整度禁用。')
assert.match(translation, /process\.env\.CMS_TRANSLATION_API_KEY/, '翻译密钥必须由服务端环境读取。')
assert.doesNotMatch(translation, /NEXT_PUBLIC_/, '翻译实现不得读取公开环境变量。')
assert.match(migration, /WHERE published_locales_complete IS NULL/, '迁移只能回填未初始化的线上状态。')
assert.match(selfHosting, /\/www\/zhangdashi-deploy\/shared\/env\/\.env\.local/, '自有服务器文档必须给出共享密钥文件路径。')
assert.match(neonVerifier, /published_locales_complete/, 'Neon 验收必须阻止缺少外语公开状态字段的 schema 上线。')

console.log('CMS 非阻塞翻译发布验证通过。')
