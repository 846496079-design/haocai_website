import { NextResponse } from 'next/server'
import { getCmsAdmin } from '@/lib/cms/auth'
import { getCmsArticle, updateCmsDraft } from '@/lib/cms/store'
import { translateCmsContent } from '@/lib/cms/translation'

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '登录已失效。' }, { status: 401 })
  const { id: rawId } = await params
  const id = Number(rawId)
  const article = await getCmsArticle(id)
  if (!article) return NextResponse.json({ message: '新闻不存在。' }, { status: 404 })
  try {
    const content = await translateCmsContent(article.content)
    await updateCmsDraft(id, content, admin.id)
    return NextResponse.json({ ok: true, message: '日文与繁体中文草稿已生成，请逐项人工审核。' })
  } catch (error) {
    const message = error instanceof Error ? error.message : '翻译失败。'
    return NextResponse.json({ message }, { status: 422 })
  }
}
