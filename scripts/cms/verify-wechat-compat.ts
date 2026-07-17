import assert from 'node:assert/strict'
import { renderPublicationDocument } from '../../lib/cms/publication-renderer'
import { sanitizeWechatDocument } from '../../lib/cms/wechat-html-server'
import { translateCmsContent } from '../../lib/cms/translation'
import { createEmptyContent, DEFAULT_PUBLICATION_STYLE, type CmsRichTextDocument } from '../../lib/cms/types'

const document: CmsRichTextDocument = {
  type: 'doc',
  content: [
    {
      type: 'wechatHtmlBlock',
      attrs: {
        html: '<section style="width:100%;box-sizing:border-box" onclick="alert(1)"><script>alert(1)</script><p style="color:#1e40af;background-image:url(javascript:alert(1))">TypeZen 导入正文</p><a href="data:text/html,unsafe">危险链接</a><img src="https://example.com/imported.png" onerror="alert(1)"></section>',
      },
    },
    { type: 'heading', attrs: { level: 2, textAlign: 'left' }, content: [{ type: 'text', text: '原生标题' }] },
    {
      type: 'bulletList',
      content: [
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '列表一' }] }] },
        { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '列表二' }] }] },
      ],
    },
    { type: 'image', attrs: { src: 'https://example.com/a.png', alt: '图片一' } },
    { type: 'image', attrs: { src: 'https://example.com/b.png', alt: '图片二' } },
    {
      type: 'table',
      content: [{
        type: 'tableRow',
        content: [
          { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: '表头' }] }] },
          { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '内容' }] }] },
        ],
      }],
    },
  ],
}

const sanitized = sanitizeWechatDocument(document)
const html = renderPublicationDocument(sanitized, DEFAULT_PUBLICATION_STYLE)

assert.match(html, /TypeZen 导入正文/)
assert.doesNotMatch(html, /<script|onclick=|onerror=|javascript:|background-image/i)
assert.doesNotMatch(html, /href="data:/i)
assert.match(html, /原生标题/)
assert.doesNotMatch(html, /<h[1-6]\b/i)
assert.match(html, /float:left;width:24px/)
assert.match(html, /display:inline-block;width:/)
assert.match(html, /<th bgcolor=/)
assert.match(html, /<td bgcolor="#ffffff"/)
assert.equal((html.match(/object-fit:cover/g) ?? []).length, 2)

const translatedContent = createEmptyContent('wechat-compat-test')
translatedContent.cn.body.editorDocument = document
void assert.rejects(
  () => translateCmsContent(translatedContent),
  /TypeZen 原样导入块不能自动翻译/,
).then(() => {
  console.log('微信公众号兼容渲染、TypeZen 导入净化和多图结构验证通过。')
}).catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
