import { NextResponse } from 'next/server'
import { getCmsAdmin } from '@/lib/cms/auth'
import { getLeadStats, listLeadSubmissions } from '@/lib/leads/store'
import type { LeadKind, LeadStatus } from '@/lib/leads/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '未登录。' }, { status: 401 })
  const url = new URL(request.url)
  const statusValue = url.searchParams.get('status')
  const kindValue = url.searchParams.get('kind')
  const status = statusValue === 'PENDING' || statusValue === 'DELIVERED' || statusValue === 'PAUSED' ? statusValue as LeadStatus : undefined
  const kind = kindValue === 'TRIAL' || kindValue === 'PARTNER' ? kindValue as LeadKind : undefined
  const items = listLeadSubmissions({ status, kind, overdueOnly: url.searchParams.get('overdue') === '1', limit: 200 })
  return NextResponse.json({ items, stats: getLeadStats() })
}
