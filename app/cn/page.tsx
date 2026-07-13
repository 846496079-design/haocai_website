import OfficialSite from '@/components/marketing/official-site'
import { getPublishedArticles } from '@/lib/cms/store'
import { getSiteContent } from '@/lib/site-content'

export default async function CNPage() {
  return <OfficialSite site={getSiteContent('cn')} initialArticles={getPublishedArticles('cn')} />
}
