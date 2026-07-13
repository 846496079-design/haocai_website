import OfficialSite from '@/components/marketing/official-site'
import { getPublishedArticles } from '@/lib/cms/store'
import { getSiteContent } from '@/lib/site-content'

export default async function JPPage() {
  return <OfficialSite site={getSiteContent('jp')} initialArticles={await getPublishedArticles('jp')} />
}
