import OfficialSite from '@/components/marketing/official-site'
import { getSiteContent } from '@/lib/site-content'

export default function CNCompanyPage() {
  return <OfficialSite site={getSiteContent('cn')} page="company" />
}
