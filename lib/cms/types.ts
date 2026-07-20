import type { SiteCode } from '@/lib/site-content'

export type CmsArticleStatus = 'DRAFT' | 'PUBLISHED' | 'OFFLINE' | 'TRASH'
export type CmsTranslationStatus = 'CURRENT' | 'STALE' | 'NOT_TRANSLATED'

export type CmsRichTextMark = {
  type: string
  attrs?: Record<string, unknown>
}

export type CmsRichTextNode = {
  type: string
  attrs?: Record<string, unknown>
  content?: CmsRichTextNode[]
  marks?: CmsRichTextMark[]
  text?: string
}

export type CmsRichTextDocument = CmsRichTextNode & {
  type: 'doc'
  content: CmsRichTextNode[]
}

export type CmsPublicationStyle = {
  templateId: string
  themeColor: string
  fontFamily: string
  fontSize: number
  lineHeight: number
  paragraphSpacing: number
  pagePadding: number
  letterSpacing: number
  imageRadius: number
}

export type CmsPublicationAsset = {
  assetId: string
  cmsPublicUrl: string
  thumbnailUrl?: string | null
  mimeType: string
  width: number
  height: number
  altText: string
  caption?: string
  contentHash?: string
}

export type CmsPublicationBody = {
  schemaVersion: 'cms-richtext.v1'
  editorDocument: CmsRichTextDocument
  styleConfig: CmsPublicationStyle
  assets: CmsPublicationAsset[]
  publicationHtml: string
  contentHash: string
  renderVersion: string
}

export type CmsLocaleArticle = {
  slug: string
  date: string
  category: string
  tags: string[]
  title: string
  author: string
  summary: string
  cover: string
  body: CmsPublicationBody
}

export type CmsArticleContent = Record<SiteCode, CmsLocaleArticle>

export type CmsCategory = {
  id: number
  name: string
  slug: string
  title: string
  status: 'ACTIVE' | 'DISABLED'
  source: 'MANUAL' | 'IMPORT'
  sortOrder: number
  referenceCount: number
}

export type CmsImportResult = {
  articleId: number
  duplicate: boolean
  categoryCreated: boolean
}

export type CmsTranslationJobStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED'

export type CmsAssetInput = {
  id: string
  blobUrl: string
  thumbnailUrl?: string | null
  mimeType: string
  width: number
  height: number
  altText?: string | null
  usage: 'COVER' | 'CONTENT'
  articleId?: number | null
}

export type CmsAuditLog = {
  id: number
  action: string
  createdAt: string
  adminUsername: string | null
  detail: unknown
}

export type CmsArticleSummary = {
  id: number
  slug: string
  title: string
  status: CmsArticleStatus
  date: string
  category: string
  tags: string[]
  cover: string
  updatedAt: string
  publishedAt: string | null
  localesComplete: boolean
  translationStatus: CmsTranslationStatus
  isPinned: boolean
  deletedAt: string | null
}

export type CmsArticleRecord = CmsArticleSummary & {
  content: CmsArticleContent
  previewedAt: string | null
  versionId: number
  versionNo: number
}

export const CMS_LOCALES: SiteCode[] = ['cn', 'jp', 'hk']

export const CMS_REQUIRED_FIELDS = ['category', 'title', 'summary', 'cover', 'body'] as const

export type CmsRequiredField = typeof CMS_REQUIRED_FIELDS[number]

export const CMS_REQUIRED_FIELD_LABELS: Record<CmsRequiredField, string> = {
  category: '分类',
  title: '新闻标题',
  summary: '摘要',
  cover: '新闻封面',
  body: '正文内容',
}

export const CMS_RICH_TEXT_SCHEMA_VERSION = 'cms-richtext.v1' as const
export const CMS_RENDER_VERSION = 'wechat-inline.v2'

export const DEFAULT_PUBLICATION_STYLE: CmsPublicationStyle = {
  templateId: 'brand-tech',
  themeColor: '#5b6cff',
  fontFamily: 'system-sans',
  fontSize: 16,
  lineHeight: 1.8,
  paragraphSpacing: 16,
  pagePadding: 16,
  letterSpacing: 0,
  imageRadius: 8,
}

export function createEmptyDocument(): CmsRichTextDocument {
  return {
    type: 'doc',
    content: [{ type: 'paragraph' }],
  }
}

export function createEmptyLocaleArticle(slug = ''): CmsLocaleArticle {
  return {
    slug,
    date: '',
    category: '',
    tags: [],
    title: '',
    author: '账大师',
    summary: '',
    cover: '',
    body: {
      schemaVersion: CMS_RICH_TEXT_SCHEMA_VERSION,
      editorDocument: createEmptyDocument(),
      styleConfig: { ...DEFAULT_PUBLICATION_STYLE },
      assets: [],
      publicationHtml: '',
      contentHash: '',
      renderVersion: CMS_RENDER_VERSION,
    },
  }
}

export function createEmptyContent(slug = ''): CmsArticleContent {
  return {
    cn: createEmptyLocaleArticle(slug),
    jp: createEmptyLocaleArticle(slug),
    hk: createEmptyLocaleArticle(slug),
  }
}

function documentHasContent(node: CmsRichTextNode): boolean {
  if (node.type === 'image' && typeof node.attrs?.src === 'string' && node.attrs.src.trim()) return true
  if (node.type === 'wechatHtmlBlock' && typeof node.attrs?.html === 'string' && node.attrs.html.trim()) return true
  if (typeof node.text === 'string' && node.text.trim()) return true
  return Boolean(node.content?.some(documentHasContent))
}

export function getMissingLocaleRequiredFields(article: CmsLocaleArticle): CmsRequiredField[] {
  const missing: CmsRequiredField[] = []
  if (!article.category.trim()) missing.push('category')
  if (!article.title.trim()) missing.push('title')
  if (!article.summary.trim()) missing.push('summary')
  if (!article.cover.trim()) missing.push('cover')
  if (!documentHasContent(article.body.editorDocument)) missing.push('body')
  return missing
}

export function requiredFieldLabels(fields: readonly CmsRequiredField[]) {
  return fields.map((field) => CMS_REQUIRED_FIELD_LABELS[field])
}

export function isCmsRequiredField(value: unknown): value is CmsRequiredField {
  return typeof value === 'string' && (CMS_REQUIRED_FIELDS as readonly string[]).includes(value)
}

export function isLocaleContentComplete(article: CmsLocaleArticle) {
  return Boolean(
    getMissingLocaleRequiredFields(article).length === 0
    && article.body.publicationHtml.trim()
    && article.body.contentHash,
  )
}

export function isContentComplete(content: CmsArticleContent) {
  return CMS_LOCALES.every((locale) => isLocaleContentComplete(content[locale]))
}

export function areAllLocalesReadyForPublication(content: CmsArticleContent, translationStatus: CmsTranslationStatus) {
  return isContentComplete(content) && translationStatus !== 'STALE'
}
