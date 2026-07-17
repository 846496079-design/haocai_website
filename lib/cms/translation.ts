import { collectDocumentTextSegments, replaceDocumentTextSegments } from './rich-text'
import type { CmsArticleContent, CmsLocaleArticle } from './types'

type TranslationTarget = 'Japanese' | 'Traditional Chinese'
export type TranslationMode = 'fill-missing' | 'overwrite'

type TranslationPayload = {
  title: string
  summary: string
  category: string
  tags: string[]
  author: string
  segments: string[]
}

function translationPrompt(source: CmsLocaleArticle, target: TranslationTarget) {
  const payload: TranslationPayload = {
    title: source.title,
    summary: source.summary,
    category: source.category,
    tags: source.tags,
    author: source.author,
    segments: collectDocumentTextSegments(source.body.editorDocument),
  }
  return [
    `Translate the JSON values into ${target}.`,
    'Return JSON only with exactly these keys: title, summary, category, tags, author, segments.',
    'Keep the segments array length and order exactly unchanged.',
    'Do not add, remove, merge, split, summarize, or rewrite facts.',
    'Do not translate brand names, URLs, numbers, or product identifiers unless the source already has an established localized form.',
    JSON.stringify(payload),
  ].join('\n')
}

function validatePayload(value: unknown, expectedSegmentCount: number): TranslationPayload {
  if (!value || typeof value !== 'object') throw new Error('翻译服务返回的内容不是有效对象。')
  const source = value as Partial<TranslationPayload>
  if (!Array.isArray(source.tags) || !Array.isArray(source.segments)) throw new Error('翻译服务返回的数组字段无效。')
  if (source.segments.length !== expectedSegmentCount) throw new Error('翻译服务改变了正文结构，请重试。')
  return {
    title: String(source.title ?? ''),
    summary: String(source.summary ?? ''),
    category: String(source.category ?? ''),
    tags: source.tags.map((item) => String(item)),
    author: String(source.author ?? ''),
    segments: source.segments.map((item) => String(item)),
  }
}

async function requestTranslation(source: CmsLocaleArticle, target: TranslationTarget): Promise<TranslationPayload> {
  const apiUrl = process.env.CMS_TRANSLATION_API_URL
  const apiKey = process.env.CMS_TRANSLATION_API_KEY
  const model = process.env.CMS_TRANSLATION_MODEL
  if (!apiUrl || !apiKey || !model) {
    throw new Error('尚未配置翻译服务，请设置 CMS_TRANSLATION_API_URL、CMS_TRANSLATION_API_KEY 和 CMS_TRANSLATION_MODEL。')
  }
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: translationPrompt(source, target) }],
    }),
    signal: AbortSignal.timeout(60_000),
  })
  if (!response.ok) throw new Error(`翻译服务请求失败（${response.status}）。`)
  const data = await response.json() as { choices?: { message?: { content?: string } }[] }
  const raw = data.choices?.[0]?.message?.content
  if (!raw) throw new Error('翻译服务没有返回正文。')
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('翻译服务返回的内容不是有效 JSON。')
  }
  return validatePayload(parsed, collectDocumentTextSegments(source.body.editorDocument).length)
}

function translatedLocale(
  source: CmsLocaleArticle,
  existing: CmsLocaleArticle,
  translated: TranslationPayload,
  mode: TranslationMode,
): CmsLocaleArticle {
  const keepExisting = mode === 'fill-missing'
  return {
    ...source,
    title: keepExisting && existing.title.trim() ? existing.title : translated.title,
    summary: keepExisting && existing.summary.trim() ? existing.summary : translated.summary,
    category: keepExisting && existing.category.trim() ? existing.category : translated.category,
    tags: keepExisting && existing.tags.length ? existing.tags : translated.tags,
    author: keepExisting && existing.author.trim() ? existing.author : translated.author,
    body: {
      ...source.body,
      editorDocument: replaceDocumentTextSegments(
        source.body.editorDocument,
        translated.segments,
        existing.body.editorDocument,
        keepExisting,
      ),
      publicationHtml: '',
      contentHash: '',
    },
  }
}

export async function translateCmsContent(
  content: CmsArticleContent,
  mode: TranslationMode = 'overwrite',
): Promise<CmsArticleContent> {
  const [japanese, traditional] = await Promise.all([
    requestTranslation(content.cn, 'Japanese'),
    requestTranslation(content.cn, 'Traditional Chinese'),
  ])
  return {
    cn: content.cn,
    jp: translatedLocale(content.cn, content.jp, japanese, mode),
    hk: translatedLocale(content.cn, content.hk, traditional, mode),
  }
}
