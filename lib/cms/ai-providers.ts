export type AiProviderType = 'openrouter' | 'openai' | 'anthropic'

export type AiSettings = {
  providerType: AiProviderType
  baseUrl: string
  apiKey: string
  model: string
}

export type OpenRouterModel = {
  id: string
  name: string
  description: string
  contextLength: number
  promptPrice: string
  completionPrice: string
  isFree: boolean
}

export const AI_PROVIDER_CONFIGS: Record<AiProviderType, {
  name: string
  description: string
  defaultBaseUrl: string
  modelPlaceholder: string
  apiKeyUrl: string
}> = {
  openrouter: {
    name: 'OpenRouter',
    description: '一个 API 访问多家模型，支持模型库检索与价格查看。',
    defaultBaseUrl: 'https://openrouter.ai/api/v1',
    modelPlaceholder: '选择下方模型，或输入模型 ID',
    apiKeyUrl: 'https://openrouter.ai/settings/keys',
  },
  openai: {
    name: 'OpenAI 兼容',
    description: '支持 OpenAI 官方接口，以及遵循 Chat Completions 协议的兼容服务。',
    defaultBaseUrl: 'https://api.openai.com/v1',
    modelPlaceholder: '例如 gpt-4.1-mini',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
  },
  anthropic: {
    name: 'Anthropic',
    description: '使用 Anthropic Messages API 或兼容地址。',
    defaultBaseUrl: 'https://api.anthropic.com/v1',
    modelPlaceholder: '例如 claude-sonnet-4-5',
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
  },
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
  providerType: 'openrouter',
  baseUrl: AI_PROVIDER_CONFIGS.openrouter.defaultBaseUrl,
  apiKey: '',
  model: '',
}

export function normalizeAiProviderType(value: unknown): AiProviderType {
  return value === 'openai' || value === 'anthropic' ? value : 'openrouter'
}

export function normalizeAiSettings(value: unknown): AiSettings {
  const source = value && typeof value === 'object' ? value as Partial<AiSettings> : {}
  const providerType = normalizeAiProviderType(source.providerType)
  return {
    providerType,
    baseUrl: String(source.baseUrl ?? '').trim() || AI_PROVIDER_CONFIGS[providerType].defaultBaseUrl,
    apiKey: String(source.apiKey ?? '').trim(),
    model: String(source.model ?? '').trim(),
  }
}
