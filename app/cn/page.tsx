import OfficialSite from '@/components/marketing/official-site'
import { getPublishedArticles } from '@/lib/cms/store'
import { getSiteContent } from '@/lib/site-content'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

type CNPageProps = {
  searchParams: Promise<{ c?: string | string[]; C?: string | string[] }>
}

function firstParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function CNPage({ searchParams }: CNPageProps) {
  const query = await searchParams
  const inviteCode = (firstParamValue(query.c) || firstParamValue(query.C) || '').trim().slice(0, 50)

  if (inviteCode) {
    redirect(`/cn/partners/?c=${encodeURIComponent(inviteCode)}#partner-form`)
  }

  return <OfficialSite site={getSiteContent('cn')} initialArticles={await getPublishedArticles('cn')} />
}
