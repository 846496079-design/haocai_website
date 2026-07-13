import OfficialSite from '@/components/marketing/official-site'
import { getPublishedArticle, getPublishedArticles } from '@/lib/cms/store'
import { getSiteContent } from '@/lib/site-content'
import { notFound } from 'next/navigation'

export default async function JPNewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getPublishedArticle('jp', slug)
  if (!article) notFound()
  return <OfficialSite site={getSiteContent('jp')} page="newsDetail" articleSlug={slug} initialArticles={await getPublishedArticles('jp')} initialArticle={article} />
}
