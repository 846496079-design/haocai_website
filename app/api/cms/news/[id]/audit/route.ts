import { NextResponse } from 'next/server'
import { getCmsAdmin } from '@/lib/cms/auth'
import { listCmsAuditLogs, writeAudit } from '@/lib/cms/store'

const editorActions = new Set(['COPY_WECHAT_HTML', 'AI_STRUCTURE_ACCEPT'])

function articleId(value: string) {
  const id = Number(value)
  if (!Number.isInteger(id) || id < 1) throw new Error('新闻编号无效。')
  return id
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '登录已失效。' }, { status: 401 })
  const id = articleId((await params).id)
  return NextResponse.json({ items: await listCmsAuditLogs('news_article', String(id), 30) })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '登录已失效。' }, { status: 401 })
  try {
    const id = articleId((await params).id)
    const body = await request.json() as { action?: string; detail?: unknown }
    if (!body.action || !editorActions.has(body.action)) throw new Error('审计动作不受支持。')
    await writeAudit(admin.id, body.action, 'news_article', String(id), body.detail ?? {})
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : '记录失败。' }, { status: 400 })
  }
}
