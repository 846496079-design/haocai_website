import { redirect } from 'next/navigation'
import CmsAccountSettings from '@/components/cms/cms-account-settings'
import { getCmsAdmin } from '@/lib/cms/auth'

export const metadata = { robots: { index: false, follow: false }, title: '账号设置' }

export default async function CmsSettingsPage() {
  const admin = await getCmsAdmin()
  if (!admin) redirect('/cms/login/')
  return <CmsAccountSettings username={admin.username} />
}
