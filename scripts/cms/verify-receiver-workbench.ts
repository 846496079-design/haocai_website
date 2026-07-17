import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const newsEditor = readFileSync(resolve(root, 'components/cms/cms-news-editor.tsx'), 'utf8')
const richTextEditor = readFileSync(resolve(root, 'components/cms/cms-rich-text-editor.tsx'), 'utf8')

for (const hiddenLabel of ['排版模板', '手机宽度预览', 'AI 智能排版', '配置 AI 服务', '正文排版工具栏']) {
  assert.doesNotMatch(`${newsEditor}\n${richTextEditor}`, new RegExp(hiddenLabel))
}

assert.match(newsEditor, /正文内容/)
assert.match(newsEditor, /一键复制到公众号/)
assert.match(newsEditor, /prepareClipboardHtml/)
assert.match(newsEditor, /CmsRichTextEditor/)
assert.match(richTextEditor, /富文本粘贴接收区/)
assert.match(richTextEditor, /handlePaste/)
assert.match(richTextEditor, /wechatHtmlBlock/)
assert.match(richTextEditor, /min-h-\[44rem\]/)

assert.equal(existsSync(resolve(root, 'lib/cms/publication-renderer.ts')), true)
assert.equal(existsSync(resolve(root, 'app/api/cms/news/[id]/ai-format/route.ts')), true)

console.log('CMS 粘贴接收器界面和富文本协议保留项验证通过。')
