import OfficialSite from '@/components/marketing/official-site'
import { getPublishedArticle, getPublishedArticles } from '@/lib/cms/store'
import { getSiteContent } from '@/lib/site-content'
import { notFound } from 'next/navigation'

export default async function CNNewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await getPublishedArticle('cn', slug)
  if (!article) notFound()
  return <OfficialSite site={getSiteContent('cn')} page="newsDetail" articleSlug={slug} initialArticles={await getPublishedArticles('cn')} initialArticle={article} />
}
