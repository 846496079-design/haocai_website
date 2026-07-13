import 'server-only'

import type { NewsArticle } from '@/lib/news-content'
import type { CmsArticleContent } from './types'

type TranslationTarget = 'jp' | 'hk'

function endpoint() {
  const value = process.env.CMS_TRANSLATION_API_URL?.trim()
  if (!value) throw new Error('尚未配置翻译服务。请设置 CMS_TRANSLATION_API_URL、CMS_TRANSLATION_API_KEY 和 CMS_TRANSLATION_MODEL 后重试。')
  return value
}

function translationPrompt(source: NewsArticle, target: TranslationTarget) {
  const language = target === 'jp' ? '日语' : '繁体中文（香港用语）'
  return `你是企业官网编辑翻译。将以下简体中文新闻翻译为${language}，保持事实、日期、数字、产品名和链接准确，不得扩写或省略。只输出 JSON，不要 Markdown。JSON 必须有 title、summary、lead、category、tags、sections、closing 字段；sections 为对象数组，每项包含 title、paragraphs、image；paragraphs 为字符串数组；image 保留原始图片 URL。\n\n源稿：${JSON.stringify(source)}`
}

async function requestTranslation(source: NewsArticle, target: TranslationTarget): Promise<NewsArticle> {
  const apiKey = process.env.CMS_TRANSLATION_API_KEY?.trim()
  const model = process.env.CMS_TRANSLATION_MODEL?.trim()
  if (!apiKey || !model) throw new Error('尚未完整配置翻译服务凭据。请设置 CMS_TRANSLATION_API_KEY 与 CMS_TRANSLATION_MODEL。')
  const response = await fetch(endpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, temperature: 0.2, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: translationPrompt(source, target) }] }),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`翻译服务请求失败（${response.status}）。`)
  const payload = await response.json() as { choices?: { message?: { content?: string } }[] }
  const raw = payload.choices?.[0]?.message?.content
  if (!raw) throw new Error('翻译服务未返回可用内容。')
  let translated: Partial<NewsArticle>
  try { translated = JSON.parse(raw) as Partial<NewsArticle> } catch { throw new Error('翻译服务返回的内容不是有效 JSON。') }
  if (!translated.title || !translated.summary || !translated.lead || !translated.category || !Array.isArray(translated.sections) || !Array.isArray(translated.closing)) throw new Error('翻译服务返回字段不完整。')
  return { ...source, ...translated, slug: source.slug, date: source.date, cover: source.cover, tags: translated.tags ?? [], sections: translated.sections.map((section) => ({ title: section.title ?? '', paragraphs: section.paragraphs ?? [], image: section.image })), closing: translated.closing }
}

export async function translateCmsContent(content: CmsArticleContent): Promise<CmsArticleContent> {
  const [jp, hk] = await Promise.all([requestTranslation(content.cn, 'jp'), requestTranslation(content.cn, 'hk')])
  return { ...content, jp, hk }
}
