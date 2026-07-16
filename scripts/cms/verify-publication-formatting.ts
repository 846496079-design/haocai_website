import assert from 'node:assert/strict'
import { createPublicationBody } from '../../lib/cms/publication'
import { renderPublicationMarkdown } from '../../lib/cms/publication-renderer'
import { publicationTemplateCategories, publicationTemplates } from '../../lib/cms/publication-templates'

const sample = `# 统一排版验证

这是包含 **加粗**、*斜体*、<mark>高亮</mark>、H<sub>2</sub>O 和 10<sup>2</sup> 的正文。

## 列表与引用

> 这是需要保留的引用内容。

- 第一项
- 第二项

| 字段 | 内容 |
| --- | --- |
| 标题 | 示例 |

![示例图片](/images/news/default.webp "图片说明")

\`\`\`ts
const valid = true
\`\`\`

<script>alert('blocked')</script>`

assert.equal(publicationTemplates.length, 72, '模板总数必须固定为 72')
assert.equal(publicationTemplateCategories.length, 6, '模板分类必须固定为 6')
for (const category of publicationTemplateCategories) {
  assert.equal(publicationTemplates.filter((template) => template.category === category.id).length, 12, `${category.id} 必须包含 12 套模板`)
}

for (const template of publicationTemplates) {
  const body = createPublicationBody(sample)
  body.templateId = template.id
  const first = renderPublicationMarkdown(body)
  const second = renderPublicationMarkdown(body)
  assert.equal(first.html, second.html, `${template.id} 渲染必须确定性一致`)
  assert.match(first.html, /data-publication-root="true"/)
  assert.match(first.html, /<blockquote/)
  assert.match(first.html, /<table/)
  assert.match(first.html, /<pre/)
  assert.match(first.html, /<img/)
  assert.doesNotMatch(first.html, /<script>/i)
  assert.equal(first.warnings.length, 0)
}

console.log('微信兼容排版回归验证通过：72 套模板、Markdown 组件和确定性渲染均符合预期。')
