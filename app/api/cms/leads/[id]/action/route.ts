import { NextResponse } from 'next/server'
import { getCmsAdmin } from '@/lib/cms/auth'
import { writeAudit } from '@/lib/cms/store'
import { pauseLeadSubmission, retryLeadSubmission } from '@/lib/leads/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '未登录。' }, { status: 401 })
  try {
    const id = Number((await params).id)
    if (!Number.isInteger(id) || id < 1) throw new Error('线索编号无效。')
    const body = await request.json() as { action?: 'retry' | 'pause' }
    const changed = body.action === 'retry'
      ? retryLeadSubmission(id)
      : body.action === 'pause'
        ? pauseLeadSubmission(id)
        : false
    if (!body.action || !['retry', 'pause'].includes(body.action)) throw new Error('不支持的操作。')
    if (!changed) throw new Error('当前状态不支持该操作，或线索不存在。')
    await writeAudit(admin.id, body.action === 'retry' ? 'LEAD_RETRY' : 'LEAD_PAUSE', 'lead_submission', String(id), {})
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : '操作失败。' }, { status: 400 })
  }
}
