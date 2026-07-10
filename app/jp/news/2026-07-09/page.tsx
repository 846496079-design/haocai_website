import OfficialSite from '@/components/marketing/official-site'
import { getSiteContent } from '@/lib/site-content'

export default function JPNewsArticlePage() {
  return <OfficialSite site={getSiteContent('jp')} page="newsDetail" articleSlug="2026-07-09" />
}
