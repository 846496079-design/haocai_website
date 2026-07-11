import OfficialSite from '@/components/marketing/official-site'
import { getSiteContent } from '@/lib/site-content'

export default function CNCasesPage() {
  return <OfficialSite site={getSiteContent('cn')} page="cases" />
}
