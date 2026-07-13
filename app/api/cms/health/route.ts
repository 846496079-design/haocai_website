import { NextResponse } from 'next/server'
import { getCmsAdmin } from '@/lib/cms/auth'

export async function GET() {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '未登录。' }, { status: 401 })
  return NextResponse.json({
    database: process.env.CMS_DATABASE_URL ? 'postgresql-active' : 'sqlite-local',
    assetStorage: process.env.BLOB_READ_WRITE_TOKEN ? 'vercel-blob-configured' : 'local-filesystem',
    translation: process.env.CMS_TRANSLATION_API_URL && process.env.CMS_TRANSLATION_API_KEY && process.env.CMS_TRANSLATION_MODEL ? 'configured' : 'not-configured',
  })
}
