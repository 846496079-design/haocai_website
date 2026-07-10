import OfficialSite from '@/components/marketing/official-site'
import { getSiteContent } from '@/lib/site-content'

export default function HKJoinPage() {
  return <OfficialSite site={getSiteContent('hk')} page="join" />
}
