import OfficialSite from '@/components/marketing/official-site'
import { getSiteContent } from '@/lib/site-content'

export default function CNJoinPage() {
  return <OfficialSite site={getSiteContent('cn')} page="join" />
}
