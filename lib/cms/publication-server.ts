import 'server-only'

import { createHash } from 'node:crypto'
import type { SiteCode } from '@/lib/site-content'
import { normalizeCmsContent, normalizeLocaleArticle } from './rich-text'
import { renderPublicationBody } from './publication-renderer'
import { sanitizeWechatDocument } from './wechat-html-server'
import {
  CMS_LOCALES,
  CMS_RENDER_VERSION,
  type CmsArticleContent,
  type CmsLocaleArticle,
} from './types'

function hash(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

export function prepareLocaleArticle(value: unknown, slug = ''): CmsLocaleArticle {
  const article = normalizeLocaleArticle(value, slug)
  const editorDocument = sanitizeWechatDocument(article.body.editorDocument)
  const body = { ...article.body, editorDocument }
  const publicationHtml = renderPublicationBody(body)
  return {
    ...article,
    slug: article.slug || slug,
    body: {
      ...body,
      publicationHtml,
      contentHash: hash(publicationHtml),
      renderVersion: CMS_RENDER_VERSION,
    },
  }
}

export function prepareCmsContent(value: unknown, slug = ''): CmsArticleContent {
  const normalized = normalizeCmsContent(value, slug)
  return Object.fromEntries(CMS_LOCALES.map((locale: SiteCode) => [
    locale,
    prepareLocaleArticle(normalized[locale], slug),
  ])) as CmsArticleContent
}
