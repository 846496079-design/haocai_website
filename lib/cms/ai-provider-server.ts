import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import { AI_PROVIDER_CONFIGS, type AiProviderType } from './ai-providers'

export class AiProviderRequestError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'AiProviderRequestError'
    this.status = status
  }
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

export function buildAiProviderEndpoint(baseUrl: string, providerType: AiProviderType) {
  const source = baseUrl.trim() || AI_PROVIDER_CONFIGS[providerType].defaultBaseUrl
  let url: URL
  try {
    url = new URL(source)
  } catch {
    throw new AiProviderRequestError('AI 服务地址格式无效。')
  }
  if (url.protocol !== 'https:') throw new AiProviderRequestError('AI 服务地址必须使用 HTTPS。')
  if (url.username || url.password) throw new AiProviderRequestError('AI 服务地址不能包含账号或密码。')
  const suffix = providerType === 'anthropic' ? 'messages' : 'chat/completions'
  if (!url.pathname.endsWith(`/${suffix}`)) {
    url.pathname = `${url.pathname.replace(/\/$/, '')}/${suffix}`
  }
  url.search = ''
  url.hash = ''
  return url
}

async function assertPublicEndpoint(url: URL) {
  const hostname = url.hostname.replace(/^\[|\]$/g, '')
  if (hostname.toLowerCase() === 'localhost') {
    throw new AiProviderRequestError('AI 服务地址不能指向本机或内网。')
  }
  let addresses: string[]
  try {
    addresses = isIP(hostname)
      ? [hostname]
      : (await lookup(hostname, { all: true, verbatim: true })).map((item) => item.address)
  } catch {
    throw new AiProviderRequestError('AI 服务地址无法解析，请检查域名。')
  }
  if (!addresses.length || addresses.some(isPrivateAddress)) {
    throw new AiProviderRequestError('AI 服务地址不能解析到本机或内网。')
  }
}

function providerErrorMessage(status: number, payload: unknown) {
  const source = payload && typeof payload === 'object' ? payload as {
    error?: string | { message?: string }
    message?: string
  } : {}
  const detail = typeof source.error === 'string'
    ? source.error
    : source.error?.message || source.message
  if (status === 401 || status === 403) return 'API Key 无效或无权限，请检查后重试。'
  if (status === 404) return detail || '模型或 API 地址不存在，请检查配置。'
  if (status === 429) return '模型服务额度不足或请求过于频繁，请检查账户状态。'
  return detail || `AI 服务请求失败（${status}）。`
}

export async function requestAiProviderText({
  providerType,
  baseUrl,
  apiKey,
  model,
  systemPrompt,
  userPrompt,
  maxTokens = 8192,
  temperature = 0.2,
  jsonOutput = false,
}: {
  providerType: AiProviderType
  baseUrl: string
  apiKey: string
  model: string
  systemPrompt: string
  userPrompt: string
  maxTokens?: number
  temperature?: number
  jsonOutput?: boolean
}) {
  const url = buildAiProviderEndpoint(baseUrl, providerType)
  await assertPublicEndpoint(url)

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const body = providerType === 'anthropic'
    ? {
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }
    : {
      model,
      max_tokens: maxTokens,
      temperature,
      ...(jsonOutput ? { response_format: { type: 'json_object' } } : {}),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }
  if (providerType === 'anthropic') {
    headers['x-api-key'] = apiKey
    headers['anthropic-version'] = '2023-06-01'
  } else {
    headers.Authorization = `Bearer ${apiKey}`
  }

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(60_000),
    })
  } catch (error) {
    const message = error instanceof Error && error.name === 'TimeoutError'
      ? 'AI 服务连接超时，请检查地址或网络。'
      : '无法连接 AI 服务，请检查 API 地址和网络。'
    throw new AiProviderRequestError(message, 502)
  }

  const payload = await response.json().catch(() => null) as {
    content?: Array<{ type?: string; text?: string }>
    choices?: Array<{ message?: { content?: string } }>
  } | null
  if (!response.ok) {
    throw new AiProviderRequestError(providerErrorMessage(response.status, payload), response.status)
  }
  const content = providerType === 'anthropic'
    ? payload?.content?.find((item) => item.type === 'text')?.text
    : payload?.choices?.[0]?.message?.content
  if (!content) throw new AiProviderRequestError('AI 服务已连接，但没有返回文字内容。', 502)
  return content
}
