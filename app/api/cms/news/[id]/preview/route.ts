import { NextResponse } from 'next/server'
import { getCmsAdmin } from '@/lib/cms/auth'
import { markCmsPreviewed } from '@/lib/cms/store'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '未登录。' }, { status: 401 })
  try {
    markCmsPreviewed(Number((await params).id), admin.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : '预览记录失败。' }, { status: 400 })
  }
}
