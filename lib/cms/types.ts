import type { NewsArticle } from '@/lib/news-content'
import type { SiteCode } from '@/lib/site-content'

export type CmsArticleStatus = 'DRAFT' | 'PUBLISHED' | 'OFFLINE' | 'TRASH'

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

export type CmsArticleContent = Record<SiteCode, NewsArticle>

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
  translationStatus: 'CURRENT' | 'STALE' | 'NOT_TRANSLATED'
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

export function createEmptyContent(slug = ''): CmsArticleContent {
  return {
    cn: { slug, date: '', category: '', tags: [], title: '', summary: '', lead: '', cover: '', sections: [], closing: [] },
    jp: { slug, date: '', category: '', tags: [], title: '', summary: '', lead: '', cover: '', sections: [], closing: [] },
    hk: { slug, date: '', category: '', tags: [], title: '', summary: '', lead: '', cover: '', sections: [], closing: [] },
  }
}

export function isContentComplete(content: CmsArticleContent) {
  return CMS_LOCALES.every((locale) => {
    const article = content[locale]
    return Boolean(article.title.trim() && article.summary.trim() && article.lead.trim() && article.category.trim() && article.cover && article.sections.length && article.closing.length)
  })
}
