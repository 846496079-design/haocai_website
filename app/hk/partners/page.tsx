import OfficialSite from '@/components/marketing/official-site'
import { getSiteContent } from '@/lib/site-content'

export default function HKPartnersPage() {
  return <OfficialSite site={getSiteContent('hk')} page="partners" />
}
