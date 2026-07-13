import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { getCmsAdmin } from '@/lib/cms/auth'
import { publishCmsArticle } from '@/lib/cms/store'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '未登录。' }, { status: 401 })
  try {
    const body = await request.json() as { reviewed?: boolean }
    publishCmsArticle(Number((await params).id), admin.id, body.reviewed === true)
    ;['/cn/', '/jp/', '/hk/', '/cn/news/', '/jp/news/', '/hk/news/'].forEach((path) => revalidatePath(path))
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : '发布失败。' }, { status: 400 })
  }
}
