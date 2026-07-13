import { NextResponse } from 'next/server'
import { createEmptyContent, type CmsArticleContent } from '@/lib/cms/types'
import { importCmsArticle } from '@/lib/cms/store'

type ImportPayload = {
  sourceId: string
  content: CmsArticleContent
}

function authorized(request: Request) {
  const secret = process.env.CMS_IMPORT_SHARED_SECRET
  return Boolean(secret && request.headers.get('authorization') === `Bearer ${secret}`)
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ message: '未授权的导入请求。' }, { status: 401 })
  try {
    const body = await request.json() as Partial<ImportPayload>
    if (!body.sourceId?.trim() || !body.content?.cn) throw new Error('sourceId 与中文 content 为必填字段。')
    const content = { ...createEmptyContent(body.content.cn.slug), ...body.content } as CmsArticleContent
    const articleId = await importCmsArticle(content, body.sourceId)
    const category = content.cn.category.trim()
    return NextResponse.json({ articleId, category: category || null, categoryNotice: category ? '已接收分类；若为新分类，系统已自动建立并标记为外部导入。' : '未接收到分类；稿件已保存为草稿，请管理员补充分类。' })
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : '导入失败。' }, { status: 422 })
  }
}
