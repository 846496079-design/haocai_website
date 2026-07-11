import OfficialSite from '@/components/marketing/official-site'
import { getSiteContent } from '@/lib/site-content'
import { newsArticles } from '@/lib/news-content'

export function generateStaticParams() {
  return newsArticles.hk.map((article) => ({ slug: article.slug }))
}

export default async function HKNewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <OfficialSite site={getSiteContent('hk')} page="newsDetail" articleSlug={slug} />
}
