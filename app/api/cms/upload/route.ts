import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getCmsAdmin } from '@/lib/cms/auth'
import { inspectCmsImageSource, processCmsImage } from '@/lib/cms/image-upload'
import { recordCmsAsset } from '@/lib/cms/store'

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const maximumSize = 10 * 1024 * 1024

async function saveAsset(key: string, name: string, content: Buffer, contentType: string) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const result = await put(`cms/news/${key}/${name}`, content, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
    })
    return result.url
  }
  if (process.env.NODE_ENV === 'production') throw new Error('生产环境未配置 BLOB_READ_WRITE_TOKEN，禁止写入临时文件系统。')
  const directory = join(process.cwd(), 'public', 'uploads', 'cms', 'news')
  await mkdir(directory, { recursive: true })
  await writeFile(join(directory, name), content)
  return `/uploads/cms/news/${name}`
}

export async function POST(request: Request) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '未登录。' }, { status: 401 })
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const articleIdValue = Number(formData.get('articleId'))
    const articleId = Number.isInteger(articleIdValue) && articleIdValue > 0 ? articleIdValue : null
    const usage = formData.get('usage') === 'CONTENT' ? 'CONTENT' : 'COVER'
    const altText = String(formData.get('altText') ?? '').trim()
    if (!(file instanceof File)) throw new Error('请选择封面图片。')
    if (!allowedTypes.has(file.type) || file.size > maximumSize) throw new Error('仅支持不超过 10MB 的 JPEG、PNG 或 WebP 图片。')
    const source = Buffer.from(await file.arrayBuffer())
    const sourceFormat = inspectCmsImageSource(source)
    if (sourceFormat.mimeType !== file.type) throw new Error('图片文件格式与声明类型不一致，请重新选择图片。')
    const processed = await processCmsImage(source, sourceFormat)
    const key = randomUUID()
    const mainName = `${key}.${processed.extension}`
    const url = await saveAsset(key, mainName, processed.main, processed.mimeType)
    let thumbnailUrl = url
    if (processed.thumbnail) {
      thumbnailUrl = await saveAsset(key, `${key}-thumb.${processed.extension}`, processed.thumbnail, processed.mimeType)
    } else {
      console.error('CMS 图片优化不可用，已降级保存原图。', processed.optimizationError)
    }
    await recordCmsAsset({ id: key, articleId, blobUrl: url, thumbnailUrl, mimeType: processed.mimeType, width: processed.width, height: processed.height, altText, usage }, admin.id)
    return NextResponse.json({
      assetId: key,
      url,
      thumbnailUrl,
      mimeType: processed.mimeType,
      width: processed.width,
      height: processed.height,
      usage,
      processingMode: processed.processingMode,
      message: processed.processingMode === 'original' ? '图片优化服务暂时不可用，已保存原图，可以继续编辑和发布。' : undefined,
    })
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : '上传失败。' }, { status: 400 })
  }
}
