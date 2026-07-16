import { NextResponse } from 'next/server'
import { getCmsAdmin } from '@/lib/cms/auth'
import { listCmsAuditLogs } from '@/lib/cms/store'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '登录已失效。' }, { status: 401 })
  const id = Number((await params).id)
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ message: '新闻编号无效。' }, { status: 400 })
  return NextResponse.json({ items: await listCmsAuditLogs('news_article', String(id), 30) })
}
