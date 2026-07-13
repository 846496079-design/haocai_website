import { NextResponse } from 'next/server'
import { getCmsAdmin } from '@/lib/cms/auth'
import { createCmsCategory, listCmsCategories } from '@/lib/cms/store'

export async function GET() {
  if (!await getCmsAdmin()) return NextResponse.json({ message: '未登录。' }, { status: 401 })
  return NextResponse.json({ items: await listCmsCategories() })
}

export async function POST(request: Request) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '未登录。' }, { status: 401 })
  try {
    const body = await request.json() as { name?: string }
    return NextResponse.json(await createCmsCategory(body.name ?? '', admin.id), { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : '创建分类失败。' }, { status: 400 })
  }
}
