import { redirect } from 'next/navigation'
import CmsDashboard from '@/components/cms/cms-dashboard'
import { getCmsAdmin } from '@/lib/cms/auth'
import { listCmsArticles } from '@/lib/cms/store'

export const metadata = { robots: { index: false, follow: false }, title: '新闻内容管理' }

export default async function CmsPage() {
  const admin = await getCmsAdmin()
  if (!admin) redirect('/cms/login/')
  return <CmsDashboard items={listCmsArticles()} username={admin.username} />
}
