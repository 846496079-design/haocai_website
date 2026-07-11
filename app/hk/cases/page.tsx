import OfficialSite from '@/components/marketing/official-site'
import { getSiteContent } from '@/lib/site-content'

export default function HKCasesPage() {
  return <OfficialSite site={getSiteContent('hk')} page="cases" />
}
