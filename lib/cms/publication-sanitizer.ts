import 'server-only'

import sanitizeHtml from 'sanitize-html'

const lengthValue = /^-?\d+(?:\.\d+)?(?:px|em|rem|%|vw)?$/
const colorValue = /^(?:#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|transparent)$/i
const simpleValue = /^[#a-z0-9\s,.'"()/%\-]+$/i

export function sanitizePublicationHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ['section', 'p', 'span', 'strong', 'em', 's', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'ul', 'ol', 'li', 'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'a', 'hr', 'mark', 'sup', 'sub'],
    allowedAttributes: {
      '*': ['style'],
      section: ['style', 'data-publication-root', 'data-template-id'],
      a: ['href', 'title', 'style'],
      img: ['src', 'alt', 'title', 'width', 'height', 'style'],
      ol: ['start', 'style'],
      code: ['data-language', 'style'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowProtocolRelative: false,
    allowedStyles: {
      '*': {
        color: [colorValue], 'background-color': [colorValue], background: [colorValue, simpleValue],
        'font-size': [lengthValue], 'font-weight': [/^(?:400|500|600|700|bold)$/], 'font-style': [/^(?:normal|italic)$/],
        'font-family': [simpleValue], 'line-height': [/^\d+(?:\.\d+)?$/], 'letter-spacing': [lengthValue],
        margin: [simpleValue], 'margin-top': [lengthValue], 'margin-right': [lengthValue], 'margin-bottom': [lengthValue], 'margin-left': [lengthValue],
        padding: [simpleValue], 'padding-top': [lengthValue], 'padding-right': [lengthValue], 'padding-bottom': [lengthValue], 'padding-left': [lengthValue],
        border: [simpleValue], 'border-top': [simpleValue], 'border-bottom': [simpleValue], 'border-left': [simpleValue], 'border-radius': [lengthValue],
        width: [lengthValue], 'max-width': [lengthValue], height: [lengthValue, /^auto$/], display: [/^(?:block|inline|inline-block|flex|table)$/],
        gap: [lengthValue], 'align-items': [simpleValue], 'vertical-align': [simpleValue], 'text-align': [/^(?:left|center|right|justify)$/],
        'text-indent': [lengthValue], 'text-decoration': [simpleValue], 'text-underline-offset': [lengthValue], opacity: [/^(?:0(?:\.\d+)?|1(?:\.0+)?)$/],
        'white-space': [simpleValue], overflow: [simpleValue], 'overflow-x': [simpleValue], 'overflow-wrap': [simpleValue], 'word-break': [simpleValue],
        'box-sizing': [simpleValue], 'border-collapse': [simpleValue], 'box-shadow': [simpleValue],
      },
    },
    disallowedTagsMode: 'discard',
  })
}
