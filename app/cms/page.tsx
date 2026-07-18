import { redirect } from 'next/navigation'
import WebsiteAdminDashboard from '@/components/cms/website-admin-dashboard'
import { getCmsAdmin } from '@/lib/cms/auth'
import { getLeadStats } from '@/lib/leads/store'

export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false, follow: false }, title: '账大师官网后台' }

export default async function CmsPage() {
  const admin = await getCmsAdmin()
  if (!admin) redirect('/cms/login/')
  return <WebsiteAdminDashboard username={admin.username} leadStats={getLeadStats()} />
}
