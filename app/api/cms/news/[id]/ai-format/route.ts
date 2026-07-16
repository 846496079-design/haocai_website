import { NextResponse } from 'next/server'
import { getCmsAdmin } from '@/lib/cms/auth'
import { proposeMarkdownStructure } from '@/lib/cms/ai-structure'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '登录已失效。' }, { status: 401 })
  try {
    const id = Number((await params).id)
    if (!Number.isInteger(id) || id < 1) throw new Error('新闻编号无效。')
    const body = await request.json() as { sourceMarkdown?: string }
    return NextResponse.json({ proposal: await proposeMarkdownStructure(body.sourceMarkdown ?? '') })
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'AI 结构排版失败。' }, { status: 400 })
  }
}
