import OfficialSite from '@/components/marketing/official-site'
import { getSiteContent } from '@/lib/site-content'

export default function CNNewsArticlePage() {
  return <OfficialSite site={getSiteContent('cn')} page="newsDetail" articleSlug="2026-07-09" />
}
