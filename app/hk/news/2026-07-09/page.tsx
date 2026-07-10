import OfficialSite from '@/components/marketing/official-site'
import { getSiteContent } from '@/lib/site-content'

export default function HKNewsArticlePage() {
  return <OfficialSite site={getSiteContent('hk')} page="newsDetail" articleSlug="2026-07-09" />
}
