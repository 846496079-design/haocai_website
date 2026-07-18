type Environment = Record<string, string | undefined>

export type FeishuBotConfig = {
  appId: string
  appSecret: string
  allowedChatIds: ReadonlySet<string>
  allowedUserIds: ReadonlySet<string>
  alertChatId: string
}

export type LeadQueryAiConfig = {
  provider: 'deepseek'
  apiUrl: string
  apiKey: string
  model: string
  timeoutMilliseconds: number
}

function requiredValue(environment: Environment, name: string, minimumLength = 1) {
  const value = environment[name]?.trim()
  if (!value || value.length < minimumLength) throw new Error(`${name} 尚未正确配置。`)
  return value
}

function parseIdentifierList(value: string | undefined) {
  return new Set((value || '').split(',').map((item) => item.trim()).filter(Boolean))
}

function parseTimeout(value: string | undefined) {
  if (!value) return 15_000
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 3_000 || parsed > 60_000) {
    throw new Error('LEAD_QUERY_AI_TIMEOUT_MS 必须是 3000 至 60000 之间的整数。')
  }
  return parsed
}

function normalizeChatCompletionsUrl(value: string) {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error('LEAD_QUERY_AI_API_URL 不是有效的 HTTPS 地址。')
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('LEAD_QUERY_AI_API_URL 必须是不含账号、查询参数和片段的 HTTPS 地址。')
  }
  const pathname = url.pathname.replace(/\/$/, '')
  url.pathname = pathname.endsWith('/chat/completions') ? pathname : `${pathname}/chat/completions`
  return url.toString()
}

export function hasFeishuBotConfiguration(environment: Environment = process.env) {
  return Boolean(environment.FEISHU_BOT_APP_ID?.trim() && environment.FEISHU_BOT_APP_SECRET?.trim())
}

export function getFeishuBotConfig(environment: Environment = process.env): FeishuBotConfig {
  const allowedChatIds = parseIdentifierList(environment.FEISHU_BOT_ALLOWED_CHAT_IDS)
  const allowedUserIds = parseIdentifierList(environment.FEISHU_BOT_ALLOWED_USER_IDS)
  if (allowedChatIds.size === 0 && allowedUserIds.size === 0) {
    throw new Error('飞书机器人至少需要配置一个允许的群聊或用户。')
  }
  const alertChatId = requiredValue(environment, 'FEISHU_BOT_ALERT_CHAT_ID')
  if (!allowedChatIds.has(alertChatId)) {
    throw new Error('FEISHU_BOT_ALERT_CHAT_ID 必须同时包含在 FEISHU_BOT_ALLOWED_CHAT_IDS 中。')
  }
  return {
    appId: requiredValue(environment, 'FEISHU_BOT_APP_ID', 8),
    appSecret: requiredValue(environment, 'FEISHU_BOT_APP_SECRET', 16),
    allowedChatIds,
    allowedUserIds,
    alertChatId,
  }
}

export function getLeadQueryAiConfig(environment: Environment = process.env): LeadQueryAiConfig {
  const provider = requiredValue(environment, 'LEAD_QUERY_AI_PROVIDER').toLowerCase()
  if (provider !== 'deepseek') throw new Error('LEAD_QUERY_AI_PROVIDER 当前只支持 deepseek。')
  const model = requiredValue(environment, 'LEAD_QUERY_AI_MODEL')
  if (!/^[a-z0-9][a-z0-9._-]{1,127}$/i.test(model)) throw new Error('LEAD_QUERY_AI_MODEL 格式无效。')
  return {
    provider,
    apiUrl: normalizeChatCompletionsUrl(requiredValue(environment, 'LEAD_QUERY_AI_API_URL')),
    apiKey: requiredValue(environment, 'LEAD_QUERY_AI_API_KEY', 16),
    model,
    timeoutMilliseconds: parseTimeout(environment.LEAD_QUERY_AI_TIMEOUT_MS),
  }
}
