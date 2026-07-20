import OfficialSite from '@/components/marketing/official-site'
import { getPublishedArticle, getPublishedArticles } from '@/lib/cms/store'
import { getSiteContent } from '@/lib/site-content'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function HKNewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getPublishedArticle('hk', slug)
  if (!article) notFound()
  return <OfficialSite site={getSiteContent('hk')} page="newsDetail" articleSlug={slug} initialArticles={await getPublishedArticles('hk')} initialArticle={article} />
}
