import { NextResponse } from 'next/server'
import { getCmsAdmin } from '@/lib/cms/auth'
import { getCmsDatabaseUrl } from '@/lib/cms/config'

export async function GET() {
  const admin = await getCmsAdmin()
  if (!admin) return NextResponse.json({ message: '未登录。' }, { status: 401 })
  const production = process.env.NODE_ENV === 'production'
  const databaseConfigured = Boolean(getCmsDatabaseUrl())
  const blobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN)
  const ready = !production || (databaseConfigured && blobConfigured)
  return NextResponse.json({
    ready,
    database: databaseConfigured ? 'postgresql-active' : production ? 'missing' : 'sqlite-local',
    assetStorage: blobConfigured ? 'vercel-blob-configured' : production ? 'missing' : 'local-filesystem',
    translation: process.env.CMS_TRANSLATION_API_URL && process.env.CMS_TRANSLATION_API_KEY && process.env.CMS_TRANSLATION_MODEL ? 'configured' : 'not-configured',
  }, { status: ready ? 200 : 503 })
}
