import { NextResponse } from 'next/server'
import { getCmsAdmin } from '@/lib/cms/auth'
import { createCmsArticle, listCmsArticles } from '@/lib/cms/store'

export async function GET() {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '未登录。' }, { status: 401 })
  return NextResponse.json({ items: await listCmsArticles() })
}

export async function POST(request: Request) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '未登录。' }, { status: 401 })
  try {
    const body = await request.json() as { slug?: string }
    const id = await createCmsArticle(body.slug?.trim() ?? '', admin.id)
    return NextResponse.json({ id }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : '创建草稿失败。' }, { status: 400 })
  }
}
