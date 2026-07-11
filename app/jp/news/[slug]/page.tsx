import OfficialSite from '@/components/marketing/official-site'
import { getSiteContent } from '@/lib/site-content'
import { newsArticles } from '@/lib/news-content'

export function generateStaticParams() {
  return newsArticles.jp.map((article) => ({ slug: article.slug }))
}

export default async function JPNewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <OfficialSite site={getSiteContent('jp')} page="newsDetail" articleSlug={slug} />
}
