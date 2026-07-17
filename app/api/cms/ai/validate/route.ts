import { NextResponse } from 'next/server'
import { getCmsAdmin } from '@/lib/cms/auth'
import { AiProviderRequestError, requestAiProviderText } from '@/lib/cms/ai-provider-server'
import { AI_PROVIDER_CONFIGS, normalizeAiProviderType } from '@/lib/cms/ai-providers'

export async function POST(request: Request) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '未登录。' }, { status: 401 })
  try {
    const body = await request.json() as {
      providerType?: unknown
      baseUrl?: string
      apiKey?: string
      model?: string
    }
    const providerType = normalizeAiProviderType(body.providerType)
    const apiKey = body.apiKey?.trim()
    const model = body.model?.trim()
    if (!apiKey || !model) throw new Error('请填写 API Key 和模型名称。')
    await requestAiProviderText({
      providerType,
      baseUrl: body.baseUrl ?? '',
      apiKey,
      model,
      systemPrompt: '这是连接测试。只回复 OK，不要输出其他内容。',
      userPrompt: '请确认连接。',
      maxTokens: 8,
      temperature: 0,
    })
    return NextResponse.json({
      ok: true,
      message: `${AI_PROVIDER_CONFIGS[providerType].name} 连接成功，模型 ${model} 可响应。`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI 服务连接测试失败。'
    const status = error instanceof AiProviderRequestError ? error.status : 400
    return NextResponse.json({ message }, { status })
  }
}
