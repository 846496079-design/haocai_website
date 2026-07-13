import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import { CMS_LOCALES, createEmptyContent, type CmsArticleContent } from '@/lib/cms/types'
import { importCmsArticleIdempotent } from '@/lib/cms/store'
import { verifyCmsImportRequest } from '@/lib/cms/import-auth'

type ImportPayload = {
  sourceId: string
  content: Partial<CmsArticleContent>
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    if (Buffer.byteLength(rawBody, 'utf8') > 2 * 1024 * 1024) return NextResponse.json({ message: '导入请求体不能超过 2MB。' }, { status: 413 })
    const { idempotencyKey } = verifyCmsImportRequest(request, rawBody)
    const body = JSON.parse(rawBody) as Partial<ImportPayload>
    if (!body.sourceId?.trim() || !body.content?.cn) throw new Error('sourceId 与中文 content 为必填字段。')
    const sourceId = body.sourceId.trim()
    const slug = `workspace-${createHash('sha256').update(sourceId).digest('hex').slice(0, 20)}`
    const defaults = createEmptyContent(slug)
    const content = Object.fromEntries(CMS_LOCALES.map((locale) => [locale, { ...defaults[locale], ...(body.content?.[locale] ?? {}), slug }])) as CmsArticleContent
    if (!content.cn.title?.trim()) throw new Error('content.cn.title 为必填字段。')
    const payloadHash = createHash('sha256').update(rawBody).digest('hex')
    const result = await importCmsArticleIdempotent(content, sourceId, idempotencyKey, payloadHash)
    const category = content.cn.category.trim()
    return NextResponse.json({
      articleId: result.articleId,
      slug,
      duplicate: result.duplicate,
      category: category || null,
      categoryCreated: result.categoryCreated,
      categoryNotice: category ? (result.categoryCreated ? '已自动创建新分类，来源标记为外部导入。' : '已匹配现有分类。') : '未接收到分类；稿件已保存为草稿，请管理员补充分类。',
      validation: { valid: true, missingFields: category ? [] : ['content.cn.category'] },
      editUrl: `/cms/news/${result.articleId}/`,
    }, { status: result.duplicate ? 200 : 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : '导入失败。'
    const unauthorized = /签名|时间戳|幂等键|未配置/.test(message)
    return NextResponse.json({ message }, { status: unauthorized ? 401 : 422 })
  }
}
