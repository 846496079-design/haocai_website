import { redirect } from 'next/navigation'
import LeadDashboard from '@/components/cms/lead-dashboard'
import { getCmsAdmin } from '@/lib/cms/auth'
import { getLeadStats, listLeadSubmissions } from '@/lib/leads/store'
import type { LeadFilters, LeadKind, LeadStatus } from '@/lib/leads/types'

export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false, follow: false }, title: '线索管理｜账大师官网后台' }

export default async function LeadPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const admin = await getCmsAdmin()
  if (!admin) redirect('/cms/login/')
  const query = await searchParams
  const statusValue = typeof query.status === 'string' ? query.status : ''
  const kindValue = typeof query.kind === 'string' ? query.kind : ''
  const filters: LeadFilters = {
    status: statusValue === 'PENDING' || statusValue === 'DELIVERED' || statusValue === 'PAUSED' ? statusValue as LeadStatus : undefined,
    kind: kindValue === 'TRIAL' || kindValue === 'PARTNER' ? kindValue as LeadKind : undefined,
    overdueOnly: query.overdue === '1',
    limit: 200,
  }
  return <LeadDashboard items={listLeadSubmissions(filters)} stats={getLeadStats()} filters={filters} username={admin.username}/>
}
