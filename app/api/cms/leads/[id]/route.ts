import { NextResponse } from 'next/server'
import { getCmsAdmin } from '@/lib/cms/auth'
import { getLeadSubmission } from '@/lib/leads/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '未登录。' }, { status: 401 })
  const id = Number((await params).id)
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ message: '线索编号无效。' }, { status: 400 })
  const item = getLeadSubmission(id)
  if (!item) return NextResponse.json({ message: '线索不存在。' }, { status: 404 })
  return NextResponse.json({ item })
}
