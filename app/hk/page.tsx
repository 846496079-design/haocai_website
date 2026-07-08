import OfficialSite from '@/components/marketing/official-site'
import { getSiteContent } from '@/lib/site-content'

export default function HKPage() {
  return <OfficialSite site={getSiteContent('hk')} />
}
