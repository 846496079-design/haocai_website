import { NextResponse } from 'next/server'
import { getCmsAdmin } from '@/lib/cms/auth'
import { listCmsAuditLogs, writeAudit } from '@/lib/cms/store'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '登录已失效。' }, { status: 401 })
  const id = Number((await params).id)
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ message: '新闻编号无效。' }, { status: 400 })
  return NextResponse.json({ items: await listCmsAuditLogs('news_article', String(id), 30) })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '登录已失效。' }, { status: 401 })
  const id = Number((await params).id)
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ message: '新闻编号无效。' }, { status: 400 })
  const payload = await request.json().catch(() => null) as { action?: unknown; locale?: unknown; templateId?: unknown; fallbackImages?: unknown } | null
  if (payload?.action !== 'COPY_WECHAT_HTML') return NextResponse.json({ message: '不支持的审计动作。' }, { status: 400 })
  const locale = payload.locale === 'jp' || payload.locale === 'hk' ? payload.locale : 'cn'
  const templateId = typeof payload.templateId === 'string' ? payload.templateId.slice(0, 80) : ''
  const fallbackImages = Math.max(0, Math.min(100, Math.trunc(Number(payload.fallbackImages)) || 0))
  await writeAudit(admin.id, 'COPY_WECHAT_HTML', 'news_article', String(id), { locale, templateId, fallbackImages })
  return NextResponse.json({ ok: true })
}
