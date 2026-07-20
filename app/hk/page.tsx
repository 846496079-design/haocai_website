import OfficialSite from '@/components/marketing/official-site'
import { getPublishedArticles } from '@/lib/cms/store'
import { getSiteContent } from '@/lib/site-content'

export const dynamic = 'force-dynamic'

export default async function HKPage() {
  return <OfficialSite site={getSiteContent('hk')} initialArticles={await getPublishedArticles('hk')} />
}
