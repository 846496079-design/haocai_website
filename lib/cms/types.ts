import type { NewsArticle } from '@/lib/news-content'
import type { SiteCode } from '@/lib/site-content'

export type CmsArticleStatus = 'DRAFT' | 'PUBLISHED' | 'OFFLINE'

export type CmsArticleContent = Record<SiteCode, NewsArticle>

export type CmsArticleSummary = {
  id: number
  slug: string
  status: CmsArticleStatus
  date: string
  cover: string
  updatedAt: string
  publishedAt: string | null
  localesComplete: boolean
}

export type CmsArticleRecord = CmsArticleSummary & {
  content: CmsArticleContent
  previewedAt: string | null
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
