import 'server-only'

function endpoint() {
  const value = process.env.CMS_TRANSLATION_API_URL?.trim()
  if (!value) throw new Error('尚未配置 AI 服务。请设置 CMS_TRANSLATION_API_URL、CMS_TRANSLATION_API_KEY 和 CMS_TRANSLATION_MODEL。')
  return value
}

function semanticFingerprint(markdown: string) {
  return markdown
    .replace(/```[^\n]*\n?/g, '')
    .replace(/<\/?(?:mark|sup|sub)>/gi, '')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1 $2')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 $2')
    .replace(/^\s{0,3}(?:#{1,6}|>|[-+*]|\d+[.)])\s+/gm, '')
    .replace(/^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/gm, '')
    .replace(/[|*_~`]/g, '')
    .replace(/\s+/g, '')
}

function prompt(sourceMarkdown: string) {
  return `你是企业官网编辑助手。只调整下面 Markdown 的结构和排版标记，不得改写、增删、翻译或纠正任何原文文字、数字、链接、图片地址与代码内容。可做的操作只有：调整段落空行；把已有的整行文字设为标题；把已有行设为列表或引用；给已有文字添加加粗、高亮、上标、下标；把已有的结构化行整理为 Markdown 表格。不要创建新标题或总结。只输出 JSON，格式必须是 {"proposal":"完整 Markdown"}。\n\n原稿：\n${sourceMarkdown}`
}

export async function proposeMarkdownStructure(sourceMarkdown: string) {
  const source = sourceMarkdown.trim()
  if (!source) throw new Error('正文不能为空。')
  if (source.length > 100_000) throw new Error('正文超过 10 万字符，暂不支持 AI 结构排版。')
  const apiKey = process.env.CMS_TRANSLATION_API_KEY?.trim()
  const model = process.env.CMS_TRANSLATION_MODEL?.trim()
  if (!apiKey || !model) throw new Error('尚未完整配置 AI 服务凭据。')
  const response = await fetch(endpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt(source) }],
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(45_000),
  })
  if (!response.ok) throw new Error(`AI 服务请求失败（${response.status}）。`)
  const payload = await response.json() as { choices?: { message?: { content?: string } }[] }
  const raw = payload.choices?.[0]?.message?.content
  if (!raw) throw new Error('AI 服务未返回可用内容。')
  let parsed: { proposal?: string }
  try {
    parsed = JSON.parse(raw) as { proposal?: string }
  } catch {
    throw new Error('AI 服务返回的内容不是有效 JSON。')
  }
  const proposal = parsed.proposal?.trim()
  if (!proposal) throw new Error('AI 服务没有返回结构建议。')
  if (semanticFingerprint(source) !== semanticFingerprint(proposal)) {
    throw new Error('AI 建议改变了原文内容，系统已拒绝该结果。')
  }
  return proposal
}
