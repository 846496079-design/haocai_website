import { NextResponse } from 'next/server'
import { getCmsAdmin } from '@/lib/cms/auth'
import { completeTranslationJob, createTranslationJob, failTranslationJob, getCmsArticle, markCmsTranslated, updateCmsDraft, writeAudit } from '@/lib/cms/store'
import { translateCmsContent, type TranslationMode } from '@/lib/cms/translation'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '登录已失效。' }, { status: 401 })
  const { id: rawId } = await params
  const id = Number(rawId)
  const article = await getCmsArticle(id)
  if (!article) return NextResponse.json({ message: '新闻不存在。' }, { status: 404 })
  const provider = new URL(process.env.CMS_TRANSLATION_API_URL || 'https://unconfigured.invalid').hostname
  const model = process.env.CMS_TRANSLATION_MODEL || 'unconfigured'
  const jobs = await Promise.all([
    createTranslationJob(article.versionId, 'jp', provider, model),
    createTranslationJob(article.versionId, 'hk', provider, model),
  ])
  try {
    const body = await request.json().catch(() => ({})) as { mode?: TranslationMode }
    const mode: TranslationMode = body.mode === 'fill-missing' ? 'fill-missing' : 'overwrite'
    const content = await translateCmsContent(article.content, mode)
    await updateCmsDraft(id, content, admin.id)
    await markCmsTranslated(id, admin.id)
    await Promise.all(jobs.map((jobId) => completeTranslationJob(jobId)))
    return NextResponse.json({ ok: true, mode, message: '日文与繁体中文草稿已生成，请逐项人工审核。' })
  } catch (error) {
    const message = error instanceof Error ? error.message : '翻译失败。'
    await Promise.all(jobs.map((jobId) => failTranslationJob(jobId, message.slice(0, 120))))
    await writeAudit(admin.id, 'TRANSLATE_FAILED', 'news_article', String(id), { message })
    return NextResponse.json({ message }, { status: 422 })
  }
}
