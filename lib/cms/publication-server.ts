import 'server-only'

import { createHash } from 'node:crypto'
import { CMS_LOCALES, type CmsArticleContent } from './types'
import { normalizePublicationBody, PUBLICATION_RENDER_VERSION } from './publication'
import { renderPublicationMarkdown } from './publication-renderer'
import { sanitizePublicationHtml } from './publication-sanitizer'

export function prepareCmsPublicationContent(content: CmsArticleContent): CmsArticleContent {
  return Object.fromEntries(CMS_LOCALES.map((locale) => {
    const article = content[locale]
    if (!article.publication) return [locale, article]
    const publication = normalizePublicationBody(article.publication)
    const rendered = renderPublicationMarkdown(publication)
    if (rendered.warnings.length) throw new Error(`${locale.toUpperCase()} 排版失败：${rendered.warnings.join('；')}`)
    const contentHtml = sanitizePublicationHtml(rendered.html)
    if (!contentHtml.includes('data-publication-root="true"')) throw new Error(`${locale.toUpperCase()} 排版结果未通过安全校验。`)
    const contentHash = createHash('sha256').update(contentHtml).digest('hex')
    return [locale, {
      ...article,
      publication: {
        ...publication,
        styleConfig: rendered.styleConfig,
        templateId: rendered.template.id,
        templateVersion: rendered.template.version,
        renderVersion: PUBLICATION_RENDER_VERSION,
        contentHtml,
        contentHash,
      },
    }]
  })) as CmsArticleContent
}
