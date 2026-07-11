import OfficialSite from '@/components/marketing/official-site'
import { getSiteContent } from '@/lib/site-content'
import { newsArticles } from '@/lib/news-content'

export function generateStaticParams() {
  return newsArticles.cn.map((article) => ({ slug: article.slug }))
}

export default async function CNNewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <OfficialSite site={getSiteContent('cn')} page="newsDetail" articleSlug={slug} />
}
