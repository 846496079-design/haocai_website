import 'server-only'

import type { CmsArticleContent } from './types'
import { articleUsesPublication, type CmsLocalizedArticle } from './publication'

type TranslationTarget = 'jp' | 'hk'
export type TranslationMode = 'overwrite' | 'fill-missing'

function endpoint() {
  const value = process.env.CMS_TRANSLATION_API_URL?.trim()
  if (!value) throw new Error('尚未配置翻译服务。请设置 CMS_TRANSLATION_API_URL、CMS_TRANSLATION_API_KEY 和 CMS_TRANSLATION_MODEL 后重试。')
  return value
}

function translationPrompt(source: CmsLocalizedArticle, target: TranslationTarget) {
  const language = target === 'jp' ? '日语' : '繁体中文（香港用语）'
  const publicationField = articleUsesPublication(source)
    ? '另外必须返回 publicationSourceMarkdown 字段：翻译完整 Markdown 正文，严格保留 Markdown 结构、链接、图片地址和代码，只翻译自然语言。'
    : ''
  return `你是企业官网编辑翻译。将以下简体中文新闻翻译为${language}，保持事实、日期、数字、产品名和链接准确，不得扩写或省略。只输出 JSON，不要 Markdown 代码围栏。JSON 必须有 title、summary、lead、category、tags、sections、closing 字段；sections 为对象数组，每项包含 title、paragraphs、image、imageAlt、imageCaption；paragraphs 为字符串数组；image 保留原始图片 URL，imageAlt 和 imageCaption 需要翻译。${publicationField}\n\n源稿：${JSON.stringify(source)}`
}

async function requestTranslation(source: CmsLocalizedArticle, target: TranslationTarget): Promise<CmsLocalizedArticle> {
  const apiKey = process.env.CMS_TRANSLATION_API_KEY?.trim()
  const model = process.env.CMS_TRANSLATION_MODEL?.trim()
  if (!apiKey || !model) throw new Error('尚未完整配置翻译服务凭据。请设置 CMS_TRANSLATION_API_KEY 与 CMS_TRANSLATION_MODEL。')
  const response = await fetch(endpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, temperature: 0.2, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: translationPrompt(source, target) }] }),
    cache: 'no-store',
    signal: AbortSignal.timeout(45_000),
  })
  if (!response.ok) throw new Error(`翻译服务请求失败（${response.status}）。`)
  const payload = await response.json() as { choices?: { message?: { content?: string } }[] }
  const raw = payload.choices?.[0]?.message?.content
  if (!raw) throw new Error('翻译服务未返回可用内容。')
  let translated: Partial<CmsLocalizedArticle> & { publicationSourceMarkdown?: string }
  try { translated = JSON.parse(raw) as Partial<CmsLocalizedArticle> & { publicationSourceMarkdown?: string } } catch { throw new Error('翻译服务返回的内容不是有效 JSON。') }
  if (!translated.title || !translated.summary || !translated.lead || !translated.category || !Array.isArray(translated.sections) || !Array.isArray(translated.closing)) throw new Error('翻译服务返回字段不完整。')
  if (articleUsesPublication(source) && !translated.publicationSourceMarkdown?.trim()) throw new Error('翻译服务未返回排版正文。')
  return {
    ...source,
    ...translated,
    slug: source.slug,
    date: source.date,
    cover: source.cover,
    tags: translated.tags ?? [],
    sections: translated.sections.map((section) => ({ title: section.title ?? '', paragraphs: section.paragraphs ?? [], image: section.image, imageAlt: section.imageAlt, imageCaption: section.imageCaption })),
    closing: translated.closing,
    publication: articleUsesPublication(source) ? {
      ...source.publication,
      sourceMarkdown: translated.publicationSourceMarkdown ?? '',
      contentHtml: undefined,
      contentHash: undefined,
      renderVersion: undefined,
      templateVersion: undefined,
    } : undefined,
  }
}

function keepManualValues(existing: CmsLocalizedArticle, generated: CmsLocalizedArticle): CmsLocalizedArticle {
  return {
    ...generated,
    title: existing.title.trim() || generated.title,
    summary: existing.summary.trim() || generated.summary,
    lead: existing.lead.trim() || generated.lead,
    category: existing.category.trim() || generated.category,
    tags: existing.tags?.length ? existing.tags : generated.tags,
    sections: existing.sections.length ? existing.sections.map((section, index) => {
      const candidate = generated.sections[index]
      if (!candidate) return section
      return {
        ...candidate,
        title: section.title.trim() || candidate.title,
        paragraphs: section.paragraphs.some((paragraph) => paragraph.trim()) ? section.paragraphs : candidate.paragraphs,
        image: section.image || candidate.image,
        imageAlt: section.imageAlt || candidate.imageAlt,
        imageCaption: section.imageCaption || candidate.imageCaption,
      }
    }) : generated.sections,
    closing: existing.closing.some((paragraph) => paragraph.trim()) ? existing.closing : generated.closing,
    publication: articleUsesPublication(generated) ? {
      ...generated.publication,
      sourceMarkdown: articleUsesPublication(existing) && existing.publication.sourceMarkdown.trim()
        ? existing.publication.sourceMarkdown
        : generated.publication.sourceMarkdown,
      contentHtml: undefined,
      contentHash: undefined,
    } : undefined,
  }
}

export async function translateCmsContent(content: CmsArticleContent, mode: TranslationMode = 'overwrite'): Promise<CmsArticleContent> {
  const [jp, hk] = await Promise.all([requestTranslation(content.cn, 'jp'), requestTranslation(content.cn, 'hk')])
  if (mode === 'fill-missing') return { ...content, jp: keepManualValues(content.jp, jp), hk: keepManualValues(content.hk, hk) }
  return { ...content, jp, hk }
}
