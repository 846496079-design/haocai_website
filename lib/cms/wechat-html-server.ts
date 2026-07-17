import sanitizeHtml from 'sanitize-html'
import type { CmsRichTextDocument, CmsRichTextNode } from './types'

const allowedTags = [
  'section',
  'p',
  'span',
  'strong',
  'em',
  'u',
  's',
  'del',
  'a',
  'img',
  'blockquote',
  'ul',
  'ol',
  'li',
  'hr',
  'br',
  'code',
  'pre',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'mark',
  'sup',
  'sub',
  'svg',
  'circle',
]

const safeCssValue = /^(?!.*(?:url\s*\(|expression\s*\(|javascript:|@import|var\s*\())[-#(),.%\w\s'"/]+$/i
const allowedStyleNames = [
  'width',
  'min-width',
  'max-width',
  'height',
  'min-height',
  'max-height',
  'box-sizing',
  'background',
  'background-color',
  'color',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-decoration',
  'text-decoration-color',
  'text-decoration-thickness',
  'text-indent',
  'text-transform',
  'word-wrap',
  'word-break',
  'overflow',
  'overflow-x',
  'overflow-y',
  'white-space',
  'display',
  'vertical-align',
  'float',
  'clear',
  'object-fit',
  'opacity',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'border',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-radius',
  'border-collapse',
  'box-shadow',
  'table-layout',
  'list-style-type',
  'transform',
]

const allowedStyles = Object.fromEntries(
  allowedStyleNames.map((name) => [name, [safeCssValue]]),
)

export function sanitizeWechatHtmlFragment(value: unknown) {
  const source = String(value ?? '').slice(0, 1_000_000)
  return sanitizeHtml(source, {
    allowedTags,
    allowedAttributes: {
      '*': ['style'],
      a: ['href', 'title'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      table: ['cellpadding', 'cellspacing', 'border'],
      th: ['colspan', 'rowspan', 'bgcolor'],
      td: ['colspan', 'rowspan', 'bgcolor'],
      svg: ['width', 'height', 'viewBox', 'xmlns'],
      circle: ['cx', 'cy', 'r', 'fill'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https', 'data'] },
    allowProtocolRelative: false,
    allowedStyles: { '*': allowedStyles },
    parser: { lowerCaseAttributeNames: false },
  })
}

function sanitizeNode(node: CmsRichTextNode): CmsRichTextNode {
  const content = node.content?.map(sanitizeNode)
  if (node.type !== 'wechatHtmlBlock') {
    return { ...node, ...(content ? { content } : {}) }
  }
  return {
    type: 'wechatHtmlBlock',
    attrs: { html: sanitizeWechatHtmlFragment(node.attrs?.html) },
  }
}

export function sanitizeWechatDocument(document: CmsRichTextDocument): CmsRichTextDocument {
  return sanitizeNode(document) as CmsRichTextDocument
}
