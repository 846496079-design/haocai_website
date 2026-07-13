import { NextResponse } from 'next/server'
import { getCmsAdmin } from '@/lib/cms/auth'
import { getCmsArticle, moveCmsArticleToTrash, updateCmsDraft } from '@/lib/cms/store'
import type { CmsArticleContent } from '@/lib/cms/types'
import { revalidatePublicNews } from '@/lib/cms/revalidate'

function parseId(value: string) {
  const id = Number(value)
  if (!Number.isInteger(id) || id < 1) throw new Error('新闻编号无效。')
  return id
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '未登录。' }, { status: 401 })
  try {
    const article = await getCmsArticle(parseId((await params).id))
    return article ? NextResponse.json(article) : NextResponse.json({ message: '新闻不存在。' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : '读取失败。' }, { status: 400 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '未登录。' }, { status: 401 })
  try {
    const body = await request.json() as { content?: CmsArticleContent }
    if (!body.content) throw new Error('缺少新闻内容。')
    return NextResponse.json(await updateCmsDraft(parseId((await params).id), body.content, admin.id))
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : '保存失败。' }, { status: 400 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '未登录。' }, { status: 401 })
  try {
    const id = parseId((await params).id)
    const article = await getCmsArticle(id)
    await moveCmsArticleToTrash(id, admin.id)
    revalidatePublicNews(article?.slug)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : '删除失败。' }, { status: 400 })
  }
}
