import OfficialSite from '@/components/marketing/official-site'
import { getSiteContent } from '@/lib/site-content'

export default function JPProductPage() {
  return <OfficialSite site={getSiteContent('jp')} page="product" />
}
