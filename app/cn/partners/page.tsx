import OfficialSite from '@/components/marketing/official-site'
import { getSiteContent } from '@/lib/site-content'

export default function CNPartnersPage() {
  return <OfficialSite site={getSiteContent('cn')} page="partners" />
}
