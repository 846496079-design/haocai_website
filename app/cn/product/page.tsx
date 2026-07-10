import OfficialSite from '@/components/marketing/official-site'
import { getSiteContent } from '@/lib/site-content'

export default function CNProductPage() {
  return <OfficialSite site={getSiteContent('cn')} page="product" />
}
