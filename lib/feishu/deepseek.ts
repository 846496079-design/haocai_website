import { getLeadQueryAiConfig, type LeadQueryAiConfig } from './config'
import { leadQueryPlanPrompt, parseLeadQueryPlan, type LeadQueryPlan } from './query-plan'

export type DeepSeekPlanningErrorCode =
  | 'INVALID_QUESTION'
  | 'TIMEOUT'
  | 'RATE_LIMITED'
  | 'SERVICE_UNAVAILABLE'
  | 'HTTP_ERROR'
  | 'INVALID_RESPONSE'

export class DeepSeekPlanningError extends Error {
  constructor(public readonly code: DeepSeekPlanningErrorCode, message: string) {
    super(message)
  }
}

type ChatCompletionResponse = {
  choices?: Array<{
    finish_reason?: string
    message?: { content?: string | null }
  }>
}

type PlanLeadQuestionOptions = {
  config?: LeadQueryAiConfig
  fetchImplementation?: typeof fetch
  now?: Date
}

function formatBeijingNow(now: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    dateStyle: 'full',
    timeStyle: 'long',
    hour12: false,
  }).format(now)
}

function normalizeQuestion(question: string) {
  const normalized = question.replace(/\s+/g, ' ').trim()
  if (!normalized || normalized.length > 500) {
    throw new DeepSeekPlanningError('INVALID_QUESTION', '问题必须是 1 至 500 个字符。')
  }
  return normalized
}

export async function planLeadQuestion(question: string, options: PlanLeadQuestionOptions = {}): Promise<LeadQueryPlan> {
  const normalizedQuestion = normalizeQuestion(question)
  const config = options.config || getLeadQueryAiConfig()
  const fetchImplementation = options.fetchImplementation || fetch
  const now = options.now || new Date()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), config.timeoutMilliseconds)

  try {
    const response = await fetchImplementation(config.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: leadQueryPlanPrompt },
          { role: 'user', content: `当前北京时间：${formatBeijingNow(now)}\n用户问题：${normalizedQuestion}` },
        ],
        response_format: { type: 'json_object' },
        thinking: { type: 'disabled' },
        temperature: 0,
        max_tokens: 900,
        stream: false,
      }),
      signal: controller.signal,
    })

    if (response.status === 429) throw new DeepSeekPlanningError('RATE_LIMITED', '智能问数请求过于频繁，请稍后重试。')
    if (response.status >= 500) throw new DeepSeekPlanningError('SERVICE_UNAVAILABLE', '智能问数服务暂时不可用。')
    if (!response.ok) throw new DeepSeekPlanningError('HTTP_ERROR', '智能问数服务拒绝了请求。')

    const data = await response.json().catch(() => undefined) as ChatCompletionResponse | undefined
    const choice = data?.choices?.[0]
    if (!choice || choice.finish_reason === 'length' || choice.finish_reason === 'content_filter') {
      throw new DeepSeekPlanningError('INVALID_RESPONSE', '智能问数服务没有返回完整查询计划。')
    }
    const content = choice.message?.content?.trim()
    if (!content) throw new DeepSeekPlanningError('INVALID_RESPONSE', '智能问数服务返回了空查询计划。')

    let parsed: unknown
    try {
      parsed = JSON.parse(content)
    } catch {
      throw new DeepSeekPlanningError('INVALID_RESPONSE', '智能问数服务返回的查询计划不是有效 JSON。')
    }
    try {
      return parseLeadQueryPlan(parsed)
    } catch {
      throw new DeepSeekPlanningError('INVALID_RESPONSE', '智能问数服务返回的查询计划未通过安全校验。')
    }
  } catch (error) {
    if (error instanceof DeepSeekPlanningError) throw error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new DeepSeekPlanningError('TIMEOUT', '智能问数服务响应超时。')
    }
    throw new DeepSeekPlanningError('SERVICE_UNAVAILABLE', '无法连接智能问数服务。')
  } finally {
    clearTimeout(timeout)
  }
}
