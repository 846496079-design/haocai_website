import type { NewsArticle } from '@/lib/news-content'
import type { SiteCode } from '@/lib/site-content'
import {
  CMS_LOCALES,
  CMS_RENDER_VERSION,
  CMS_RICH_TEXT_SCHEMA_VERSION,
  DEFAULT_PUBLICATION_STYLE,
  createEmptyContent,
  createEmptyDocument,
  createEmptyLocaleArticle,
  type CmsArticleContent,
  type CmsLocaleArticle,
  type CmsPublicationAsset,
  type CmsPublicationStyle,
  type CmsRichTextDocument,
  type CmsRichTextMark,
  type CmsRichTextNode,
} from './types'

const allowedNodeTypes = new Set([
  'doc',
  'paragraph',
  'heading',
  'text',
  'hardBreak',
  'horizontalRule',
  'blockquote',
  'bulletList',
  'orderedList',
  'listItem',
  'codeBlock',
  'image',
  'table',
  'tableRow',
  'tableHeader',
  'tableCell',
])

const allowedMarkTypes = new Set(['bold', 'italic', 'underline', 'strike', 'code', 'link', 'textStyle'])
const allowedTemplateIds = new Set(['brand-tech', 'business-minimal', 'news-briefing', 'product-launch', 'industry-insight', 'event-campaign'])
const allowedFontIds = new Set(['system-sans', 'source-han', 'song', 'kai', 'japanese'])
const allowedFontSizes = new Set(['14px', '15px', '16px', '17px', '18px', '20px', '22px', '24px', '28px', '32px'])

function text(value: unknown) {
  return value == null ? '' : String(value)
}

function number(value: unknown, fallback: number, minimum: number, maximum: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.min(maximum, Math.max(minimum, parsed)) : fallback
}

function safeColor(value: unknown) {
  const candidate = text(value).trim().toLowerCase()
  return /^#[0-9a-f]{6}$/.test(candidate) ? candidate : undefined
}

function safeContentUrl(value: unknown) {
  const candidate = text(value).trim()
  return /^(?:https:\/\/|\/(?!\/)|http:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\/)/i.test(candidate) ? candidate : undefined
}

function safeLinkUrl(value: unknown) {
  const candidate = text(value).trim()
  return /^(?:https?:\/\/|mailto:|tel:|#|\/(?!\/))/i.test(candidate) ? candidate : '#'
}

function normalizeMark(value: unknown): CmsRichTextMark | undefined {
  if (!value || typeof value !== 'object') return undefined
  const source = value as CmsRichTextMark
  if (!allowedMarkTypes.has(source.type)) return undefined
  if (source.type === 'link') return { type: 'link', attrs: { href: safeLinkUrl(source.attrs?.href) } }
  if (source.type === 'textStyle') {
    const fontSize = allowedFontSizes.has(text(source.attrs?.fontSize)) ? text(source.attrs?.fontSize) : undefined
    const fontFamily = text(source.attrs?.fontFamily).slice(0, 240) || undefined
    const foreground = safeColor(source.attrs?.color)
    const backgroundColor = safeColor(source.attrs?.backgroundColor)
    const lineHeightValue = Number(source.attrs?.lineHeight)
    const lineHeight = Number.isFinite(lineHeightValue) && lineHeightValue >= 1.2 && lineHeightValue <= 2.5 ? lineHeightValue : undefined
    const attrs = Object.fromEntries(Object.entries({ fontSize, fontFamily, color: foreground, backgroundColor, lineHeight }).filter(([, item]) => item !== undefined))
    return Object.keys(attrs).length ? { type: 'textStyle', attrs } : undefined
  }
  return { type: source.type }
}

function normalizeNodeAttrs(type: string, value: unknown): Record<string, unknown> | undefined {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  if (type === 'paragraph') {
    return source.textAlign === 'center' || source.textAlign === 'right' ? { textAlign: source.textAlign } : undefined
  }
  if (type === 'heading') {
    const level = source.level === 3 || source.level === 4 ? source.level : 2
    const textAlign = source.textAlign === 'center' || source.textAlign === 'right' ? source.textAlign : 'left'
    return { level, textAlign }
  }
  if (type === 'image') {
    const src = safeContentUrl(source.src)
    if (!src) return undefined
    return { src, alt: text(source.alt).slice(0, 300), title: text(source.title).slice(0, 300) }
  }
  if (type === 'orderedList') return { start: number(source.start, 1, 1, 9999) }
  if (type === 'codeBlock') return text(source.language) ? { language: text(source.language).slice(0, 40) } : undefined
  if (type === 'tableHeader' || type === 'tableCell') {
    const colwidth = Array.isArray(source.colwidth)
      ? source.colwidth.map((item) => number(item, 0, 0, 4000)).filter((item) => item > 0).slice(0, 20)
      : undefined
    return {
      colspan: number(source.colspan, 1, 1, 20),
      rowspan: number(source.rowspan, 1, 1, 20),
      ...(colwidth?.length ? { colwidth } : {}),
    }
  }
  return undefined
}

function normalizeNode(value: unknown, depth = 0): CmsRichTextNode | undefined {
  if (!value || typeof value !== 'object' || depth > 40) return undefined
  const source = value as CmsRichTextNode
  if (!allowedNodeTypes.has(source.type)) return undefined
  if (source.type === 'text') {
    const valueText = text(source.text)
    if (!valueText) return undefined
    const marks = Array.isArray(source.marks)
      ? source.marks.map(normalizeMark).filter((item): item is CmsRichTextMark => Boolean(item))
      : undefined
    return marks?.length ? { type: 'text', text: valueText, marks } : { type: 'text', text: valueText }
  }
  const attrs = normalizeNodeAttrs(source.type, source.attrs)
  if (source.type === 'image' && !attrs) return undefined
  const content = Array.isArray(source.content)
    ? source.content
      .map((item) => normalizeNode(item, depth + 1))
      .filter((item): item is CmsRichTextNode => Boolean(item))
    : undefined
  return {
    type: source.type,
    ...(attrs ? { attrs } : {}),
    ...(content?.length ? { content } : {}),
  }
}

export function normalizeRichTextDocument(value: unknown): CmsRichTextDocument {
  const normalized = normalizeNode(value)
  if (!normalized || normalized.type !== 'doc') return createEmptyDocument()
  return {
    type: 'doc',
    content: normalized.content?.length ? normalized.content : [{ type: 'paragraph' }],
  }
}

export function normalizePublicationStyle(value: unknown): CmsPublicationStyle {
  const source = value && typeof value === 'object' ? value as Partial<CmsPublicationStyle> : {}
  const themeColor = /^#[0-9a-f]{6}$/i.test(text(source.themeColor))
    ? text(source.themeColor).toLowerCase()
    : DEFAULT_PUBLICATION_STYLE.themeColor
  return {
    templateId: allowedTemplateIds.has(text(source.templateId)) ? text(source.templateId) : DEFAULT_PUBLICATION_STYLE.templateId,
    themeColor,
    fontFamily: allowedFontIds.has(text(source.fontFamily)) ? text(source.fontFamily) : DEFAULT_PUBLICATION_STYLE.fontFamily,
    fontSize: number(source.fontSize, DEFAULT_PUBLICATION_STYLE.fontSize, 14, 20),
    lineHeight: number(source.lineHeight, DEFAULT_PUBLICATION_STYLE.lineHeight, 1.4, 2.4),
    paragraphSpacing: number(source.paragraphSpacing, DEFAULT_PUBLICATION_STYLE.paragraphSpacing, 8, 32),
    pagePadding: number(source.pagePadding, DEFAULT_PUBLICATION_STYLE.pagePadding, 0, 32),
    letterSpacing: number(source.letterSpacing, DEFAULT_PUBLICATION_STYLE.letterSpacing, 0, 4),
    imageRadius: number(source.imageRadius, DEFAULT_PUBLICATION_STYLE.imageRadius, 0, 24),
  }
}

function normalizeAsset(value: unknown): CmsPublicationAsset | undefined {
  if (!value || typeof value !== 'object') return undefined
  const source = value as Partial<CmsPublicationAsset>
  const assetId = text(source.assetId).trim()
  const cmsPublicUrl = text(source.cmsPublicUrl).trim()
  if (!assetId || !cmsPublicUrl) return undefined
  return {
    assetId,
    cmsPublicUrl,
    thumbnailUrl: source.thumbnailUrl ? text(source.thumbnailUrl) : null,
    mimeType: text(source.mimeType) || 'image/jpeg',
    width: number(source.width, 1, 1, 20000),
    height: number(source.height, 1, 1, 20000),
    altText: text(source.altText),
    caption: source.caption ? text(source.caption) : undefined,
    contentHash: source.contentHash ? text(source.contentHash) : undefined,
  }
}

function paragraph(value: string, marks?: CmsRichTextMark[]): CmsRichTextNode {
  return value
    ? { type: 'paragraph', content: [{ type: 'text', text: value, ...(marks?.length ? { marks } : {}) }] }
    : { type: 'paragraph' }
}

export function legacyArticleToDocument(article: NewsArticle): CmsRichTextDocument {
  const content: CmsRichTextNode[] = []
  if (article.lead.trim()) {
    content.push(paragraph(article.lead.trim(), [{ type: 'bold' }]))
  }
  for (const section of article.sections) {
    if (section.title.trim()) {
      content.push({
        type: 'heading',
        attrs: { level: 2, textAlign: 'left' },
        content: [{ type: 'text', text: section.title.trim() }],
      })
    }
    for (const item of section.paragraphs) {
      if (item.trim()) content.push(paragraph(item.trim()))
    }
    if (section.image) {
      content.push({
        type: 'image',
        attrs: {
          src: section.image,
          alt: section.imageAlt || section.imageCaption || section.title,
          title: section.imageCaption || '',
        },
      })
    }
  }
  if (article.closing.some((item) => item.trim())) {
    content.push({ type: 'horizontalRule' })
    for (const item of article.closing) {
      if (item.trim()) content.push(paragraph(item.trim()))
    }
  }
  return { type: 'doc', content: content.length ? content : [{ type: 'paragraph' }] }
}

export function legacyArticleToLocale(article: NewsArticle): CmsLocaleArticle {
  const empty = createEmptyLocaleArticle(article.slug)
  return {
    ...empty,
    slug: article.slug,
    date: article.date,
    category: article.category,
    tags: article.tags ?? [],
    title: article.title,
    summary: article.summary,
    cover: article.cover,
    body: {
      ...empty.body,
      editorDocument: legacyArticleToDocument(article),
    },
  }
}

function isLegacyArticle(value: unknown): value is NewsArticle {
  if (!value || typeof value !== 'object') return false
  const source = value as Partial<NewsArticle>
  return typeof source.lead === 'string' && Array.isArray(source.sections) && Array.isArray(source.closing)
}

export function normalizeLocaleArticle(value: unknown, slug = ''): CmsLocaleArticle {
  if (isLegacyArticle(value)) return legacyArticleToLocale({ ...value, slug: value.slug || slug })
  const source = value && typeof value === 'object' ? value as Partial<CmsLocaleArticle> : {}
  const empty = createEmptyLocaleArticle(text(source.slug) || slug)
  const body = source.body && typeof source.body === 'object' ? source.body : empty.body
  return {
    slug: text(source.slug) || slug,
    date: text(source.date),
    category: text(source.category),
    tags: Array.isArray(source.tags) ? source.tags.map(text).map((item) => item.trim()).filter(Boolean) : [],
    title: text(source.title),
    author: text(source.author) || empty.author,
    summary: text(source.summary),
    cover: text(source.cover),
    body: {
      schemaVersion: CMS_RICH_TEXT_SCHEMA_VERSION,
      editorDocument: normalizeRichTextDocument(body.editorDocument),
      styleConfig: normalizePublicationStyle(body.styleConfig),
      assets: Array.isArray(body.assets)
        ? body.assets.map(normalizeAsset).filter((item): item is CmsPublicationAsset => Boolean(item))
        : [],
      publicationHtml: text(body.publicationHtml),
      contentHash: text(body.contentHash),
      renderVersion: text(body.renderVersion) || CMS_RENDER_VERSION,
    },
  }
}

export function normalizeCmsContent(value: unknown, fallbackSlug = ''): CmsArticleContent {
  const source = value && typeof value === 'object' ? value as Partial<Record<SiteCode, unknown>> : {}
  const fallback = createEmptyContent(fallbackSlug)
  return Object.fromEntries(CMS_LOCALES.map((locale) => {
    const item = normalizeLocaleArticle(source[locale] ?? fallback[locale], fallbackSlug)
    return [locale, item]
  })) as CmsArticleContent
}

export function extractDocumentText(node: CmsRichTextNode): string {
  if (node.type === 'text') return node.text ?? ''
  if (node.type === 'hardBreak') return '\n'
  const content = node.content?.map(extractDocumentText).join('') ?? ''
  if (['paragraph', 'heading', 'blockquote', 'listItem', 'codeBlock', 'tableRow'].includes(node.type)) return `${content}\n`
  return content
}

export function collectDocumentTextSegments(node: CmsRichTextNode): string[] {
  const output: string[] = []
  function visit(current: CmsRichTextNode) {
    if (current.type === 'text') {
      output.push(current.text ?? '')
      return
    }
    current.content?.forEach(visit)
  }
  visit(node)
  return output
}

export function replaceDocumentTextSegments(
  document: CmsRichTextDocument,
  segments: string[],
  existing?: CmsRichTextDocument,
  keepExisting = false,
): CmsRichTextDocument {
  const existingSegments = existing ? collectDocumentTextSegments(existing) : []
  let index = 0
  function visit(node: CmsRichTextNode): CmsRichTextNode {
    if (node.type === 'text') {
      const translated = text(segments[index])
      const previous = text(existingSegments[index])
      index += 1
      return { ...node, text: keepExisting && previous.trim() ? previous : translated || node.text || '' }
    }
    return node.content ? { ...node, content: node.content.map(visit) } : { ...node }
  }
  return normalizeRichTextDocument(visit(document))
}
