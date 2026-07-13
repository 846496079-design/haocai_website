import { NextResponse } from 'next/server'
import { logoutCmsAdmin } from '@/lib/cms/auth'

export async function POST() {
  await logoutCmsAdmin()
  return NextResponse.json({ ok: true })
}
