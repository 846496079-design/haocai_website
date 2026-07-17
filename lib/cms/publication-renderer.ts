import type {
  CmsPublicationBody,
  CmsPublicationStyle,
  CmsRichTextMark,
  CmsRichTextNode,
} from './types'
import { normalizePublicationStyle, normalizeRichTextDocument } from './rich-text'

type PublicationTemplate = {
  id: string
  name: string
  category: string
  background: string
  text: string
  muted: string
  accent: string
  headingStyle: 'bar' | 'underline' | 'label' | 'plain' | 'center' | 'frame'
}

export const publicationTemplates: PublicationTemplate[] = [
  { id: 'brand-tech', name: '品牌科技', category: '品牌', background: '#ffffff', text: '#18243d', muted: '#526078', accent: '#5b6cff', headingStyle: 'bar' },
  { id: 'business-minimal', name: '商务简约', category: '商务', background: '#ffffff', text: '#20242c', muted: '#5f6673', accent: '#1f4f8a', headingStyle: 'underline' },
  { id: 'news-briefing', name: '新闻通告', category: '新闻', background: '#ffffff', text: '#202124', muted: '#5f6368', accent: '#b42318', headingStyle: 'label' },
  { id: 'product-launch', name: '产品发布', category: '产品', background: '#f8faff', text: '#172033', muted: '#526078', accent: '#4f46e5', headingStyle: 'frame' },
  { id: 'industry-insight', name: '行业洞察', category: '洞察', background: '#ffffff', text: '#1f2933', muted: '#52606d', accent: '#176b5b', headingStyle: 'plain' },
  { id: 'event-campaign', name: '活动宣传', category: '活动', background: '#fffaf5', text: '#33251d', muted: '#715c4d', accent: '#c2410c', headingStyle: 'center' },
]

export const publicationFontOptions = [
  { id: 'system-sans', name: '系统黑体', css: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif" },
  { id: 'source-han', name: '思源黑体兼容', css: "'Noto Sans CJK SC', 'Source Han Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif" },
  { id: 'song', name: '宋体', css: "'Songti SC', 'SimSun', serif" },
  { id: 'kai', name: '楷体', css: "'Kaiti SC', 'KaiTi', serif" },
  { id: 'japanese', name: '日文系统字体', css: "-apple-system, BlinkMacSystemFont, 'Yu Gothic', 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif" },
] as const

const allowedFontSizes = new Set(['14px', '15px', '16px', '17px', '18px', '20px', '22px', '24px', '28px', '32px'])

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function color(value: unknown, fallback: string) {
  const candidate = String(value ?? '').trim()
  return /^#[0-9a-f]{6}$/i.test(candidate) ? candidate.toLowerCase() : fallback
}

function safeImageUrl(value: unknown) {
  const source = String(value ?? '').trim()
  if (/^https:\/\//i.test(source) || source.startsWith('/')) return source
  if (process.env.NODE_ENV !== 'production' && /^http:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\//i.test(source)) return source
  return ''
}

function safeLinkUrl(value: unknown) {
  const source = String(value ?? '').trim()
  if (/^(?:https?:\/\/|mailto:|tel:|#|\/)/i.test(source)) return source
  return '#'
}

function safeTextAlign(value: unknown) {
  return value === 'center' || value === 'right' ? value : 'left'
}

function safeFontFamily(value: unknown, fallback: string) {
  const source = String(value ?? '')
  return publicationFontOptions.find((item) => item.id === source || item.css === source)?.css ?? fallback
}

function safeFontSize(value: unknown) {
  const source = String(value ?? '')
  return allowedFontSizes.has(source) ? source : ''
}

function styleDeclaration(values: Array<[string, string | number | undefined]>) {
  return values
    .filter((item): item is [string, string | number] => item[1] !== undefined && item[1] !== '')
    .map(([property, value]) => `${property}:${value}`)
    .join(';')
}

function renderTextMarks(value: string, marks: CmsRichTextMark[] | undefined, template: PublicationTemplate, baseFont: string) {
  let html = escapeHtml(value)
  for (const mark of marks ?? []) {
    if (mark.type === 'bold') html = `<strong style="font-weight:700">${html}</strong>`
    else if (mark.type === 'italic') html = `<em style="font-style:italic">${html}</em>`
    else if (mark.type === 'underline') html = `<u style="text-decoration:underline;text-underline-offset:2px">${html}</u>`
    else if (mark.type === 'strike') html = `<s style="text-decoration:line-through">${html}</s>`
    else if (mark.type === 'code') html = `<code style="font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:0.9em;background-color:#f2f4f7;color:${template.accent};padding:2px 5px;border-radius:4px">${html}</code>`
    else if (mark.type === 'link') {
      const href = safeLinkUrl(mark.attrs?.href)
      html = `<a href="${escapeHtml(href)}" style="color:${template.accent};text-decoration:underline;text-underline-offset:3px">${html}</a>`
    } else if (mark.type === 'textStyle') {
      const fontSize = safeFontSize(mark.attrs?.fontSize)
      const fontFamily = safeFontFamily(mark.attrs?.fontFamily, '')
      const foreground = color(mark.attrs?.color, '')
      const background = color(mark.attrs?.backgroundColor, '')
      const lineHeightValue = Number(mark.attrs?.lineHeight)
      const lineHeight = Number.isFinite(lineHeightValue) && lineHeightValue >= 1.2 && lineHeightValue <= 2.5
        ? lineHeightValue
        : undefined
      const style = styleDeclaration([
        ['font-size', fontSize],
        ['font-family', fontFamily || undefined],
        ['color', foreground || undefined],
        ['background-color', background || undefined],
        ['line-height', lineHeight],
      ])
      if (style) html = `<span style="${style};font-family:${fontFamily || baseFont}">${html}</span>`
    }
  }
  return html
}

function headingStyle(level: number, template: PublicationTemplate, style: CmsPublicationStyle) {
  const fontSize = level === 2 ? 24 : level === 3 ? 20 : 18
  const common = `font-size:${fontSize}px;line-height:1.45;font-weight:700;color:${template.text};margin:0`
  if (template.headingStyle === 'bar') return `${common};padding:7px 12px;border-radius:6px;background-color:${style.themeColor};color:#ffffff`
  if (template.headingStyle === 'underline') return `${common};padding-bottom:7px;border-bottom:2px solid ${style.themeColor}`
  if (template.headingStyle === 'label') return `${common};padding:5px 10px;border:1px solid ${style.themeColor};color:${style.themeColor};display:inline-block`
  if (template.headingStyle === 'frame') return `${common};padding:10px 13px;border:1px solid ${style.themeColor};background-color:#f7f8ff`
  if (template.headingStyle === 'center') return `${common};text-align:center;color:${style.themeColor}`
  return `${common};color:${style.themeColor}`
}

function renderImage(node: CmsRichTextNode, template: PublicationTemplate, style: CmsPublicationStyle) {
  const src = safeImageUrl(node.attrs?.src)
  if (!src) return ''
  const alt = escapeHtml(node.attrs?.alt)
  const caption = String(node.attrs?.title ?? '').trim()
  return `<section style="margin:22px 0;text-align:center"><img src="${escapeHtml(src)}" alt="${alt}" style="display:block;width:100%;max-width:100%;height:auto;margin:0 auto;border-radius:${style.imageRadius}px">${caption ? `<p style="margin:8px 0 0;font-size:13px;line-height:1.6;color:${template.muted}">${escapeHtml(caption)}</p>` : ''}</section>`
}

function renderImageRow(nodes: CmsRichTextNode[], template: PublicationTemplate, style: CmsPublicationStyle) {
  const width = Math.max(20, (100 / nodes.length) - 1.5)
  const images = nodes.map((node) => {
    const src = safeImageUrl(node.attrs?.src)
    if (!src) return ''
    return `<section style="display:inline-block;width:${width}%;padding:0 4px;box-sizing:border-box;vertical-align:top"><img src="${escapeHtml(src)}" alt="${escapeHtml(node.attrs?.alt)}" style="display:block;width:100%;max-width:100%;height:auto;margin:0;border-radius:${style.imageRadius}px;vertical-align:middle;object-fit:cover"></section>`
  }).join('')
  return `<section style="text-align:center;margin:0 0 ${style.paragraphSpacing}px;line-height:0">${images}</section>`
}

function renderChildren(nodes: CmsRichTextNode[], template: PublicationTemplate, style: CmsPublicationStyle, baseFont: string) {
  let output = ''
  for (let index = 0; index < nodes.length;) {
    if (nodes[index].type === 'image') {
      const images: CmsRichTextNode[] = []
      while (index < nodes.length && nodes[index].type === 'image') {
        images.push(nodes[index])
        index += 1
      }
      output += images.length > 1
        ? renderImageRow(images, template, style)
        : renderImage(images[0], template, style)
      continue
    }
    output += renderNode(nodes[index], template, style, baseFont)
    index += 1
  }
  return output
}

function renderList(node: CmsRichTextNode, ordered: boolean, template: PublicationTemplate, style: CmsPublicationStyle, baseFont: string) {
  const start = Math.max(1, Number(node.attrs?.start) || 1)
  const items = (node.content ?? []).map((item, index) => {
    const icon = ordered ? `${start + index}.` : '•'
    const content = renderChildren(item.content ?? [], template, style, baseFont)
    return `<section style="display:block;clear:both;margin-bottom:10px"><section style="float:left;width:24px;box-sizing:border-box;color:${style.themeColor};font-weight:700;text-align:left">${icon}</section><section style="margin-left:24px;box-sizing:border-box;overflow:hidden"><section style="display:block;overflow:hidden">${content}</section></section><section style="display:block;clear:both;height:0;line-height:0;font-size:0;overflow:hidden"><br></section></section>`
  }).join('')
  return `<section style="margin:18px 0 ${style.paragraphSpacing}px;padding:0;color:${template.text}">${items}</section>`
}

function renderNode(node: CmsRichTextNode, template: PublicationTemplate, style: CmsPublicationStyle, baseFont: string): string {
  if (node.type === 'text') return renderTextMarks(node.text ?? '', node.marks, template, baseFont)
  if (node.type === 'wechatHtmlBlock') return String(node.attrs?.html ?? '')
  if (node.type === 'hardBreak') return '<br>'
  if (node.type === 'horizontalRule') return `<hr style="border:0;border-top:1px solid ${style.themeColor};margin:28px 0;opacity:0.45">`

  if (node.type === 'bulletList') return renderList(node, false, template, style, baseFont)
  if (node.type === 'orderedList') return renderList(node, true, template, style, baseFont)
  if (node.type === 'image') return renderImage(node, template, style)

  const children = renderChildren(node.content ?? [], template, style, baseFont)
  if (node.type === 'doc') return children
  if (node.type === 'paragraph') {
    const align = safeTextAlign(node.attrs?.textAlign)
    return `<p style="margin:0 0 ${style.paragraphSpacing}px;line-height:${style.lineHeight};font-size:${style.fontSize}px;letter-spacing:${style.letterSpacing}px;color:${template.text};text-align:${align}">${children || '<br>'}</p>`
  }
  if (node.type === 'heading') {
    const sourceLevel = Number(node.attrs?.level)
    const level = sourceLevel === 3 || sourceLevel === 4 ? sourceLevel : 2
    const align = safeTextAlign(node.attrs?.textAlign)
    return `<section style="margin:${level === 2 ? 30 : 24}px 0 14px;text-align:${align}"><section style="${headingStyle(level, template, style)};display:${template.headingStyle === 'label' ? 'inline-block' : 'block'};text-align:${align}"><section style="margin:0;padding:0;font-size:1em;font-weight:inherit;line-height:1.45;background:none;border:0;color:inherit">${children}</section></section></section>`
  }
  if (node.type === 'blockquote') {
    return `<blockquote style="margin:22px 0;padding:14px 16px;border:1px solid ${style.themeColor};background-color:${template.background};color:${template.muted};border-radius:8px">${children}</blockquote>`
  }
  if (node.type === 'listItem') return children
  if (node.type === 'codeBlock') {
    return `<pre style="margin:20px 0;padding:14px 16px;overflow-x:auto;white-space:pre-wrap;word-break:break-word;background-color:#172033;color:#f8fafc;border-radius:8px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:13px;line-height:1.65"><code>${children}</code></pre>`
  }
  if (node.type === 'table') return `<table cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;line-height:1.6;color:${template.text}"><tbody>${children}</tbody></table>`
  if (node.type === 'tableRow') return `<tr>${children}</tr>`
  if (node.type === 'tableHeader') return `<th bgcolor="${style.themeColor}" style="border:1px solid #d8dee9;padding:9px 10px;background-color:${style.themeColor};color:#ffffff;text-align:left;font-weight:700">${children}</th>`
  if (node.type === 'tableCell') return `<td bgcolor="#ffffff" style="border:1px solid #d8dee9;padding:9px 10px;background-color:#ffffff;vertical-align:top">${children}</td>`
  return children
}

export function renderPublicationDocument(documentValue: unknown, styleValue: unknown) {
  const document = normalizeRichTextDocument(documentValue)
  const style = normalizePublicationStyle(styleValue)
  const base = publicationTemplates.find((item) => item.id === style.templateId) ?? publicationTemplates[0]
  const template = { ...base, accent: style.themeColor }
  const baseFont = safeFontFamily(style.fontFamily, publicationFontOptions[0].css)
  const inner = renderNode(document, template, style, baseFont)
  return `<section style="width:100%;max-width:100%;box-sizing:border-box;background-color:${template.background}"><section style="box-sizing:border-box;width:100%;padding:${style.pagePadding}px;font-family:${baseFont};font-size:${style.fontSize}px;line-height:${style.lineHeight};letter-spacing:${style.letterSpacing}px;color:${template.text};word-wrap:break-word;overflow-wrap:anywhere">${inner}</section></section>`
}

export function renderPublicationBody(body: CmsPublicationBody) {
  return renderPublicationDocument(body.editorDocument, body.styleConfig)
}
