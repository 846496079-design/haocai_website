import { NextResponse } from 'next/server'
import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import { getCmsAdmin } from '@/lib/cms/auth'
import { normalizeRichTextDocument } from '@/lib/cms/rich-text'
import type { CmsRichTextDocument, CmsRichTextNode } from '@/lib/cms/types'

type ProviderType = 'openrouter' | 'openai' | 'anthropic'

const SYSTEM_PROMPT = `你是微信公众号内容结构排版助手。输入是 CMS 富文本 JSON，你只能调整结构和排版标记，不能改写、增删、翻译或纠正任何原文文字、数字、链接与图片。

允许操作：
1. 在 paragraph、heading、blockquote、bulletList、orderedList、listItem 之间调整合理结构。
2. 为已有文字增加或移除 bold、italic、underline、strike、textStyle 标记。
3. 调整标题层级时只使用 2、3、4。
4. 保持所有文字字符和先后顺序完全一致。
5. 保持所有图片 src、alt、title 及先后顺序完全一致。
6. 保持所有链接 href 完全一致。
7. 只输出 JSON，格式为 {"document":{"type":"doc","content":[]}}，不要输出解释或代码围栏。`

function apiUrl(value: unknown, providerType: ProviderType) {
  const source = String(value ?? '').trim()
  const url = new URL(source)
  if (url.protocol !== 'https:') throw new Error('AI 服务地址必须使用 HTTPS。')
  const host = url.hostname.toLowerCase()
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1' || /^10\.|^192\.168\.|^172\.(?:1[6-9]|2\d|3[01])\./.test(host)) {
    throw new Error('AI 服务地址不能指向本机或内网。')
  }
  const suffix = providerType === 'anthropic' ? 'messages' : 'chat/completions'
  if (!url.pathname.endsWith(`/${suffix}`)) {
    url.pathname = `${url.pathname.replace(/\/$/, '')}/${suffix}`
  }
  return url.toString()
}

function isPrivateAddress(value: string) {
  const address = value.toLowerCase().replace(/^\[|\]$/g, '')
  if (address.startsWith('::ffff:')) return isPrivateAddress(address.slice(7))
  if (isIP(address) === 4) {
    const octets = address.split('.').map(Number)
    return octets[0] === 0
      || octets[0] === 10
      || octets[0] === 127
      || (octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127)
      || (octets[0] === 169 && octets[1] === 254)
      || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31)
      || (octets[0] === 192 && octets[1] === 168)
      || (octets[0] === 198 && (octets[1] === 18 || octets[1] === 19))
      || octets[0] >= 224
  }
  return address === '::' || address === '::1' || /^f[cd]/.test(address) || /^fe[89ab]/.test(address)
}

async function assertPublicEndpoint(value: string) {
  const hostname = new URL(value).hostname.replace(/^\[|\]$/g, '')
  const addresses = isIP(hostname)
    ? [hostname]
    : (await lookup(hostname, { all: true, verbatim: true })).map((item) => item.address)
  if (!addresses.length || addresses.some(isPrivateAddress)) {
    throw new Error('AI 服务地址不能解析到本机或内网。')
  }
}

function parseJsonContent(value: string) {
  const source = value.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  try {
    return JSON.parse(source) as { document?: unknown }
  } catch {
    throw new Error('AI 返回内容不是有效 JSON。')
  }
}

function collectImmutable(node: CmsRichTextNode) {
  const text: string[] = []
  const images: string[] = []
  const links: string[] = []
  let hasImportedHtml = false
  function visit(current: CmsRichTextNode) {
    if (current.type === 'text') {
      text.push(current.text ?? '')
      for (const mark of current.marks ?? []) {
        if (mark.type === 'link') links.push(`${current.text ?? ''}\u0000${String(mark.attrs?.href ?? '')}`)
      }
    }
    if (current.type === 'image') {
      images.push(JSON.stringify({
        src: current.attrs?.src ?? '',
        alt: current.attrs?.alt ?? '',
        title: current.attrs?.title ?? '',
      }))
    }
    if (current.type === 'wechatHtmlBlock') hasImportedHtml = true
    current.content?.forEach(visit)
  }
  visit(node)
  return { text: text.join(''), images, links, hasImportedHtml }
}

async function requestOpenAiCompatible(url: string, apiKey: string, model: string, document: CmsRichTextDocument) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(document) },
      ],
    }),
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(60_000),
  })
  const payload = await response.json().catch(() => null) as {
    error?: { message?: string }
    choices?: Array<{ message?: { content?: string } }>
  } | null
  if (!response.ok) throw new Error(payload?.error?.message || `AI 服务请求失败（${response.status}）。`)
  const content = payload?.choices?.[0]?.message?.content
  if (!content) throw new Error('AI 服务未返回排版建议。')
  return content
}

async function requestAnthropic(url: string, apiKey: string, model: string, document: CmsRichTextDocument) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      temperature: 0.2,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: JSON.stringify(document) }],
    }),
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(60_000),
  })
  const payload = await response.json().catch(() => null) as {
    error?: { message?: string }
    content?: Array<{ type?: string; text?: string }>
  } | null
  if (!response.ok) throw new Error(payload?.error?.message || `AI 服务请求失败（${response.status}）。`)
  const content = payload?.content?.find((item) => item.type === 'text')?.text
  if (!content) throw new Error('AI 服务未返回排版建议。')
  return content
}

export async function POST(request: Request) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '未登录。' }, { status: 401 })
  try {
    const body = await request.json() as {
      providerType?: ProviderType
      baseUrl?: string
      apiKey?: string
      model?: string
      editorDocument?: unknown
    }
    const providerType: ProviderType = body.providerType === 'anthropic' || body.providerType === 'openai'
      ? body.providerType
      : 'openrouter'
    const apiKey = body.apiKey?.trim()
    const model = body.model?.trim()
    if (!apiKey || !model) throw new Error('请填写 AI API Key 和模型名称。')
    const document = normalizeRichTextDocument(body.editorDocument)
    const source = collectImmutable(document)
    if (source.hasImportedHtml) throw new Error('TypeZen 原样导入块不能再由 AI 改写；请在导入前使用 AI 排版，或删除导入块后用 CMS 原生正文。')
    if (JSON.stringify(document).length > 150_000) throw new Error('正文过长，暂不支持 AI 智能排版。')

    const url = apiUrl(body.baseUrl, providerType)
    await assertPublicEndpoint(url)
    const raw = providerType === 'anthropic'
      ? await requestAnthropic(url, apiKey, model, document)
      : await requestOpenAiCompatible(url, apiKey, model, document)
    const proposal = normalizeRichTextDocument(parseJsonContent(raw).document)
    const target = collectImmutable(proposal)
    if (source.text !== target.text || JSON.stringify(source.images) !== JSON.stringify(target.images) || JSON.stringify(source.links) !== JSON.stringify(target.links)) {
      throw new Error('AI 建议改变了原文、链接或图片，系统已拒绝该结果。')
    }
    return NextResponse.json({ proposal })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI 智能排版失败。'
    return NextResponse.json({ message }, { status: 400 })
  }
}
