import { NextResponse } from 'next/server'
import { getCmsAdmin } from '@/lib/cms/auth'
import { getCmsArticle, publishCmsArticle } from '@/lib/cms/store'
import { revalidatePublicNews } from '@/lib/cms/revalidate'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '未登录。' }, { status: 401 })
  try {
    const body = await request.json() as { reviewed?: boolean }
    const id = Number((await params).id)
    await publishCmsArticle(id, admin.id, body.reviewed === true)
    const article = await getCmsArticle(id)
    revalidatePublicNews(article?.slug)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : '发布失败。' }, { status: 400 })
  }
}
