import { NextResponse } from 'next/server'
import { getCmsAdmin } from '@/lib/cms/auth'
import type { OpenRouterModel } from '@/lib/cms/ai-providers'

const MODELS_API_URL = 'https://openrouter.ai/api/v1/models?output_modalities=text'

type OpenRouterApiModel = {
  id?: unknown
  name?: unknown
  description?: unknown
  context_length?: unknown
  pricing?: { prompt?: unknown; completion?: unknown; request?: unknown }
}

function numberValue(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeModel(value: OpenRouterApiModel): OpenRouterModel | undefined {
  if (typeof value.id !== 'string' || typeof value.name !== 'string') return undefined
  const promptPrice = numberValue(value.pricing?.prompt)
  const completionPrice = numberValue(value.pricing?.completion)
  const requestPrice = numberValue(value.pricing?.request)
  return {
    id: value.id,
    name: value.name,
    description: typeof value.description === 'string' ? value.description : '',
    contextLength: typeof value.context_length === 'number' ? value.context_length : 0,
    promptPrice: String(promptPrice),
    completionPrice: String(completionPrice),
    isFree: value.id === 'openrouter/free'
      || value.id.endsWith(':free')
      || (promptPrice === 0 && completionPrice === 0 && requestPrice === 0),
  }
}

export async function GET() {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '未登录。' }, { status: 401 })
  try {
    const response = await fetch(MODELS_API_URL, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 * 30 },
      redirect: 'error',
    })
    if (!response.ok) {
      return NextResponse.json({ message: 'OpenRouter 模型列表暂时不可用，请稍后重试。' }, { status: response.status })
    }
    const payload = await response.json() as { data?: unknown }
    const models = (Array.isArray(payload.data) ? payload.data : [])
      .map((item) => normalizeModel(item as OpenRouterApiModel))
      .filter((item): item is OpenRouterModel => Boolean(item))
      .sort((left, right) => left.isFree === right.isFree
        ? left.name.localeCompare(right.name, 'zh-Hans-CN')
        : left.isFree ? -1 : 1)
    return NextResponse.json({ models })
  } catch {
    return NextResponse.json({ message: 'OpenRouter 模型列表加载失败，请检查网络后重试。' }, { status: 502 })
  }
}
