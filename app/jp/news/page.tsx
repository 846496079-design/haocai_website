import OfficialSite from '@/components/marketing/official-site'
import { getPublishedArticles } from '@/lib/cms/store'
import { getSiteContent } from '@/lib/site-content'

export const dynamic = 'force-dynamic'

export default async function JPNewsPage() {
  return <OfficialSite site={getSiteContent('jp')} page="news" initialArticles={await getPublishedArticles('jp')} />
}
