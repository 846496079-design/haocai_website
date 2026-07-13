import { notFound, redirect } from 'next/navigation'
import OfficialSite from '@/components/marketing/official-site'
import { getCmsAdmin } from '@/lib/cms/auth'
import { getCmsArticle } from '@/lib/cms/store'
import { getSiteContent, type SiteCode } from '@/lib/site-content'

export const metadata = { robots: { index: false, follow: false }, title: '新闻草稿预览' }

export default async function CmsNewsPreviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ site?: string }> }) {
  if (!await getCmsAdmin()) redirect('/cms/login/')
  const locale = (await searchParams).site
  const siteCode: SiteCode = locale === 'jp' || locale === 'hk' ? locale : 'cn'
  const article = await getCmsArticle(Number((await params).id))
  if (!article) notFound()
  return <OfficialSite site={getSiteContent(siteCode)} page="newsDetail" articleSlug={article.slug} initialArticles={[article.content[siteCode]]} initialArticle={article.content[siteCode]} />
}
