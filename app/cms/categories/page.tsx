import { redirect } from 'next/navigation'
import CmsCategoryManager from '@/components/cms/cms-category-manager'
import { getCmsAdmin } from '@/lib/cms/auth'
import { listCmsCategories } from '@/lib/cms/store'

export const metadata = { robots: { index: false, follow: false }, title: '分类管理' }

export default async function CmsCategoriesPage() {
  if (!await getCmsAdmin()) redirect('/cms/login/')
  return <CmsCategoryManager initial={listCmsCategories()} />
}
