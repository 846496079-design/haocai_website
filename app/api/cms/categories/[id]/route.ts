import { NextResponse } from 'next/server'
import { getCmsAdmin } from '@/lib/cms/auth'
import { setCmsCategoryStatus } from '@/lib/cms/store'
import type { CmsCategory } from '@/lib/cms/types'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '登录已失效。' }, { status: 401 })
  const { id: rawId } = await params
  const id = Number(rawId)
  const body = await request.json() as { status?: CmsCategory['status'] }
  if (!Number.isInteger(id) || (body.status !== 'ACTIVE' && body.status !== 'DISABLED')) return NextResponse.json({ message: '分类参数不正确。' }, { status: 400 })
  try {
    await setCmsCategoryStatus(id, body.status, admin.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : '分类更新失败。' }, { status: 422 })
  }
}
