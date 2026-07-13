import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { getCmsAdmin } from '@/lib/cms/auth'
import { writeAudit } from '@/lib/cms/store'

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const maximumSize = 10 * 1024 * 1024

export async function POST(request: Request) {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '未登录。' }, { status: 401 })
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) throw new Error('请选择封面图片。')
    if (!allowedTypes.has(file.type) || file.size > maximumSize) throw new Error('仅支持不超过 10MB 的 JPEG、PNG 或 WebP 图片。')
    const source = Buffer.from(await file.arrayBuffer())
    const metadata = await sharp(source).metadata()
    if (!metadata.width || !metadata.height) throw new Error('图片文件无效。')
    const directory = join(process.cwd(), 'public', 'uploads', 'cms', 'news')
    await mkdir(directory, { recursive: true })
    const key = randomUUID()
    const mainName = `${key}.webp`
    const thumbnailName = `${key}-thumb.webp`
    await Promise.all([
      sharp(source).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(join(directory, mainName)),
      sharp(source).rotate().resize({ width: 960, height: 540, fit: 'cover', position: 'attention' }).webp({ quality: 78 }).toFile(join(directory, thumbnailName)),
    ])
    const url = `/uploads/cms/news/${mainName}`
    writeAudit(admin.id, 'UPLOAD_ASSET', 'cms_asset', key, { sourceType: file.type, width: metadata.width, height: metadata.height, url })
    return NextResponse.json({ url, thumbnailUrl: `/uploads/cms/news/${thumbnailName}`, width: metadata.width, height: metadata.height })
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : '上传失败。' }, { status: 400 })
  }
}
