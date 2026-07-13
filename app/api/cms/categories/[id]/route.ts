import { NextResponse } from 'next/server'
import { getCmsAdmin } from '@/lib/cms/auth'
import { deleteCmsCategory, mergeCmsCategory, renameCmsCategory, setCmsCategoryStatus } from '@/lib/cms/store'
import type { CmsCategory } from '@/lib/cms/types'
import { revalidatePublicNews } from '@/lib/cms/revalidate'

function parseId(value: string) {
  const id = Number(value)
  if (!Number.isInteger(id) || id < 1) throw new Error('分类编号无效。')
  return id
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '登录已失效。' }, { status: 401 })
  try {
    const id = parseId((await params).id)
    const body = await request.json() as {
      action?: 'rename' | 'status' | 'merge'
      name?: string
      status?: CmsCategory['status']
      targetId?: number
    }
    const action = body.action ?? (body.status ? 'status' : body.name ? 'rename' : undefined)
    if (action === 'rename') {
      const result = await renameCmsCategory(id, body.name ?? '', admin.id)
      revalidatePublicNews()
      return NextResponse.json(result)
    }
    if (action === 'status') {
      if (body.status !== 'ACTIVE' && body.status !== 'DISABLED') throw new Error('分类状态不正确。')
      await setCmsCategoryStatus(id, body.status, admin.id)
      revalidatePublicNews()
      return NextResponse.json({ ok: true })
    }
    if (action === 'merge') {
      if (!Number.isInteger(body.targetId) || Number(body.targetId) < 1) throw new Error('目标分类编号无效。')
      const result = await mergeCmsCategory(id, Number(body.targetId), admin.id)
      revalidatePublicNews()
      return NextResponse.json(result)
    }
    throw new Error('不支持的分类操作。')
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : '分类更新失败。' }, { status: 422 })
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '登录已失效。' }, { status: 401 })
  try {
    await deleteCmsCategory(parseId((await params).id), admin.id)
    revalidatePublicNews()
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : '分类删除失败。' }, { status: 422 })
  }
}
