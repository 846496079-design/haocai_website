import type { NewsArticle } from '@/lib/news-content'

export const PUBLICATION_FORMAT = 'wechat-html-v1' as const
export const PUBLICATION_RENDER_VERSION = '1.0.0'

export type PublicationStyleConfig = {
  fontSize: number
  lineHeight: number
  paragraphSpacing: number
  firstLineIndent: boolean
  pagePaddingTop: number
  pagePaddingRight: number
  pagePaddingBottom: number
  pagePaddingLeft: number
  letterSpacing: number
  imageRadius: number
  themeColor: string
  h1Layout: 'left' | 'center'
  h2Layout: 'left' | 'center'
}

export type PublicationAsset = {
  assetId: string
  type: 'image'
  originalUrl?: string | null
  cmsPublicUrl: string
  wechatUrl?: string | null
  wechatMediaId?: string | null
  altText: string
  caption?: string | null
  width: number
  height: number
  mimeType: string
  contentHash?: string | null
}

export type PublicationWechatFields = {
  articleType: 'news'
  author: string
  contentSourceUrl: string
  thumbMediaId?: string | null
  needOpenComment: 0 | 1
  onlyFansCanComment: 0 | 1
  picCrop2351?: string | null
  picCrop11?: string | null
}

export type PublicationBody = {
  format: typeof PUBLICATION_FORMAT
  sourceMarkdown: string
  contentHtml?: string
  templateId: string
  templateVersion?: string
  styleConfig: PublicationStyleConfig
  renderVersion?: string
  contentHash?: string
  assets: PublicationAsset[]
  wechat: PublicationWechatFields
}

export type CmsLocalizedArticle = NewsArticle & {
  publication?: PublicationBody
}

export const DEFAULT_PUBLICATION_STYLE: PublicationStyleConfig = {
  fontSize: 16,
  lineHeight: 1.8,
  paragraphSpacing: 16,
  firstLineIndent: false,
  pagePaddingTop: 16,
  pagePaddingRight: 16,
  pagePaddingBottom: 16,
  pagePaddingLeft: 16,
  letterSpacing: 0,
  imageRadius: 8,
  themeColor: '#1f2937',
  h1Layout: 'center',
  h2Layout: 'left',
}

export function createPublicationBody(sourceMarkdown = ''): PublicationBody {
  return {
    format: PUBLICATION_FORMAT,
    sourceMarkdown,
    templateId: 'minimal-01',
    styleConfig: { ...DEFAULT_PUBLICATION_STYLE },
    assets: [],
    wechat: {
      articleType: 'news',
      author: '账大师',
      contentSourceUrl: '',
      thumbMediaId: null,
      needOpenComment: 0,
      onlyFansCanComment: 0,
      picCrop2351: null,
      picCrop11: null,
    },
  }
}

export function normalizePublicationBody(value: PublicationBody): PublicationBody {
  const fallback = createPublicationBody()
  return {
    ...fallback,
    ...value,
    format: PUBLICATION_FORMAT,
    sourceMarkdown: typeof value.sourceMarkdown === 'string' ? value.sourceMarkdown : '',
    styleConfig: { ...fallback.styleConfig, ...(value.styleConfig ?? {}) },
    assets: Array.isArray(value.assets) ? value.assets : [],
    wechat: { ...fallback.wechat, ...(value.wechat ?? {}), articleType: 'news' },
  }
}

export function articleUsesPublication(article: NewsArticle): article is CmsLocalizedArticle & { publication: PublicationBody } {
  const publication = (article as CmsLocalizedArticle).publication
  return publication?.format === PUBLICATION_FORMAT
}

export function legacyArticleToMarkdown(article: NewsArticle) {
  const blocks: string[] = []
  article.sections.forEach((section) => {
    if (section.title.trim()) blocks.push(`## ${section.title.trim()}`)
    section.paragraphs.forEach((paragraph) => {
      if (paragraph.trim()) blocks.push(paragraph.trim())
    })
    if (section.image) {
      const alt = (section.imageAlt || section.imageCaption || section.title || '正文图片').replace(/[\[\]]/g, '')
      const title = section.imageCaption ? ` "${section.imageCaption.replace(/"/g, '\\"')}"` : ''
      blocks.push(`![${alt}](${section.image}${title})`)
    }
  })
  if (article.closing.some((paragraph) => paragraph.trim())) {
    if (blocks.length) blocks.push('---')
    article.closing.forEach((paragraph) => {
      if (paragraph.trim()) blocks.push(paragraph.trim())
    })
  }
  return blocks.join('\n\n')
}

export function publicationHasBody(article: CmsLocalizedArticle) {
  if (!articleUsesPublication(article)) return Boolean(article.sections.length && article.closing.length)
  return Boolean(article.publication.sourceMarkdown.trim() && article.publication.contentHtml?.trim())
}

export function publicationCopyIssues(body: PublicationBody, renderedHtml?: string) {
  const issues: string[] = []
  const source = body.sourceMarkdown
  const html = renderedHtml ?? body.contentHtml ?? ''
  if (!source.trim()) issues.push('正文不能为空。')
  if (/<!--cms-image-upload:/i.test(source)) issues.push('仍有图片正在上传，请等待完成。')
  if (/\bblob:/i.test(source) || /\bdata:image\//i.test(source)) issues.push('正文包含尚未上传的本地图片。')
  if (html.length > 20_000) issues.push('排版后的 HTML 超过微信公众号图文兼容长度，请精简内容或拆分文章。')
  if (new Blob([html]).size > 1024 * 1024) issues.push('排版后的 HTML 超过 1MB。')
  return issues
}
