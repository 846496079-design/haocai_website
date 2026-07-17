import { NextResponse } from 'next/server'
import { getCmsAdmin } from '@/lib/cms/auth'
import { AiProviderRequestError, requestAiProviderText } from '@/lib/cms/ai-provider-server'
import { normalizeAiProviderType } from '@/lib/cms/ai-providers'
import { normalizeRichTextDocument } from '@/lib/cms/rich-text'
import type { CmsRichTextDocument, CmsRichTextNode } from '@/lib/cms/types'

const SYSTEM_PROMPT = `你是微信公众号内容结构排版助手。输入是 CMS 富文本 JSON，你只能调整结构和排版标记，不能改写、增删、翻译或纠正任何原文文字、数字、链接与图片。

允许操作：
1. 在 paragraph、heading、blockquote、bulletList、orderedList、listItem 之间调整合理结构。
2. 为已有文字增加或移除 bold、italic、underline、strike、textStyle 标记。
3. 调整标题层级时只使用 2、3、4。
4. 保持所有文字字符和先后顺序完全一致。
5. 保持所有图片 src、alt、title 及先后顺序完全一致。
6. 保持所有链接 href 完全一致。
7. 只输出 JSON，格式为 {"document":{"type":"doc","content":[]}}，不要输出解释或代码围栏。`

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

export async function POST(request: Request) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '未登录。' }, { status: 401 })
  try {
    const body = await request.json() as {
      providerType?: unknown
      baseUrl?: string
      apiKey?: string
      model?: string
      editorDocument?: unknown
    }
    const providerType = normalizeAiProviderType(body.providerType)
    const apiKey = body.apiKey?.trim()
    const model = body.model?.trim()
    if (!apiKey || !model) throw new Error('请填写 AI API Key 和模型名称。')
    const document = normalizeRichTextDocument(body.editorDocument)
    const source = collectImmutable(document)
    if (source.hasImportedHtml) throw new Error('TypeZen 原样导入块不能再由 AI 改写；请在导入前使用 AI 排版，或删除导入块后用 CMS 原生正文。')
    if (JSON.stringify(document).length > 150_000) throw new Error('正文过长，暂不支持 AI 智能排版。')

    const raw = await requestAiProviderText({
      providerType,
      baseUrl: body.baseUrl ?? '',
      apiKey,
      model,
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: JSON.stringify(document),
      jsonOutput: true,
    })
    const proposal = normalizeRichTextDocument(parseJsonContent(raw).document)
    const target = collectImmutable(proposal)
    if (source.text !== target.text || JSON.stringify(source.images) !== JSON.stringify(target.images) || JSON.stringify(source.links) !== JSON.stringify(target.links)) {
      throw new Error('AI 建议改变了原文、链接或图片，系统已拒绝该结果。')
    }
    return NextResponse.json({ proposal })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI 智能排版失败。'
    const status = error instanceof AiProviderRequestError ? error.status : 400
    return NextResponse.json({ message }, { status })
  }
}
