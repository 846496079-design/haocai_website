import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { CmsPublishValidationError, assertCmsLocaleReadyForPublish } from '../../lib/cms/publish-validation'
import {
  createEmptyLocaleArticle,
  getMissingLocaleRequiredFields,
  requiredFieldLabels,
} from '../../lib/cms/types'

const root = process.cwd()
const empty = createEmptyLocaleArticle('required-guidance')

assert.deepEqual(
  getMissingLocaleRequiredFields(empty),
  ['category', 'title', 'summary', 'cover', 'body'],
  '中文必填项必须按页面填写顺序返回。',
)
assert.deepEqual(
  requiredFieldLabels(getMissingLocaleRequiredFields(empty)),
  ['分类', '新闻标题', '摘要', '新闻封面', '正文内容'],
  '缺项字段必须映射为用户可理解的中文名称。',
)
assert.throws(
  () => assertCmsLocaleReadyForPublish(empty),
  (error) => error instanceof CmsPublishValidationError
    && error.code === 'MISSING_REQUIRED_FIELDS'
    && error.fields.join(',') === 'category,title,summary,cover,body'
    && error.message === '请补全：分类、新闻标题、摘要、新闻封面、正文内容。',
  '服务端必须返回全部中文缺项和稳定字段标识。',
)

const completeFields = createEmptyLocaleArticle('required-guidance')
completeFields.category = '行业观察'
completeFields.title = '必填字段引导验证'
completeFields.summary = '用于验证发布引导。'
completeFields.cover = '/images/required-guidance.webp'
completeFields.body.editorDocument = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '正文' }] }] }
assert.deepEqual(getMissingLocaleRequiredFields(completeFields), [], '发布日期、作者和标签不得阻塞中文发布。')
assert.throws(
  () => assertCmsLocaleReadyForPublish(completeFields),
  (error) => error instanceof CmsPublishValidationError && error.code === 'PUBLICATION_SNAPSHOT_MISSING',
  '用户字段完整但发布快照缺失时必须提示重新保存。',
)

const editor = readFileSync(resolve(root, 'components/cms/cms-news-editor.tsx'), 'utf8')
const sqliteStore = readFileSync(resolve(root, 'lib/cms/store.ts'), 'utf8')
const postgresStore = readFileSync(resolve(root, 'lib/cms/store-postgres.ts'), 'utf8')
const publishRoute = readFileSync(resolve(root, 'app/api/cms/news/[id]/publish/route.ts'), 'utf8')
const design = readFileSync(resolve(root, 'docs/superpowers/specs/2026-07-20-cms-required-field-publish-guidance-design.md'), 'utf8')

assert.match(editor, /\*<\/span> 为中文发布必填；发布日期、作者、标签选填。/, '中文页必须解释星号和选填字段。')
for (const label of ['分类', '新闻标题', '摘要', '新闻封面']) {
  assert.match(editor, new RegExp(`Field label="${label}"[^>]*required=\\{locale === "cn"\\}`), `${label}必须只在中文页显示必填标识。`)
}
assert.match(editor, /正文内容\{locale === "cn" && <span[^>]*>\*<\/span>\}/, '正文内容必须只在中文页显示必填标识。')
assert.match(editor, /if \(missing\.length\) return revealMissingRequiredFields\(missing\)/, '发布点击必须先汇总全部中文缺项。')
assert.match(editor, /请补全：\{requiredFieldLabels\(missingRequiredFields\)\.join\("、"\)\}/, '编辑区必须持续展示全部未解决缺项。')
assert.match(editor, /setLocale\("cn"\)/, '缺项引导必须切回简体中文页。')
assert.match(editor, /scrollIntoView\(\{ behavior: "smooth", block: "center" \}\)/, '缺项引导必须滚动到首个待填写项。')
assert.match(editor, /target\?\.focus\(\{ preventScroll: true \}\)/, '缺项引导必须聚焦首个待填写项。')
assert.match(editor, /onClick=\{\(\) => void publish\(\)\} disabled=\{operationPending\}/, '确认发布只能在操作请求进行中禁用。')
assert.doesNotMatch(editor, /disabled=\{operationPending \|\| !chineseComplete/, '确认发布不得因内容缺项直接变灰。')
assert.match(sqliteStore, /assertCmsLocaleReadyForPublish\(content\.cn\)/, 'SQLite 发布必须使用共享必填校验。')
assert.match(postgresStore, /assertCmsLocaleReadyForPublish\(draft\.cn\)/, 'PostgreSQL 发布必须使用共享必填校验。')
assert.match(publishRoute, /code: error\.code, fields: error\.fields/, '发布接口必须返回结构化缺项字段。')
assert.match(design, /一次列出全部缺/, '设计依据必须明确一次展示全部缺项。')

console.log('CMS 必填字段与发布引导验证通过。')
