import { NextResponse } from 'next/server'
import { getCmsAdmin } from '@/lib/cms/auth'
import { deleteCmsArticlePermanently, moveCmsArticleToTrash, reorderCmsPublishedArticles, restoreCmsArticle, setCmsArticlePinned } from '@/lib/cms/store'

const parseId = (value: string) => { const id = Number(value); if (!Number.isInteger(id) || id < 1) throw new Error('新闻编号无效。'); return id }

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '未登录。' }, { status: 401 })
  try {
    const { action, ids } = await request.json() as { action?: 'trash' | 'restore' | 'delete' | 'pin' | 'unpin' | 'reorder'; ids?: number[] }
    const id = parseId((await params).id)
    if (action === 'trash') await moveCmsArticleToTrash(id, admin.id)
    else if (action === 'restore') await restoreCmsArticle(id, admin.id)
    else if (action === 'delete') await deleteCmsArticlePermanently(id, admin.id)
    else if (action === 'pin') await setCmsArticlePinned(id, true, admin.id)
    else if (action === 'unpin') await setCmsArticlePinned(id, false, admin.id)
    else if (action === 'reorder') await reorderCmsPublishedArticles(ids ?? [], admin.id)
    else throw new Error('不支持的操作。')
    return NextResponse.json({ ok: true })
  } catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : '操作失败。' }, { status: 400 }) }
}
