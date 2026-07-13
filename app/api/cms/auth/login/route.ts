import { NextResponse } from 'next/server'
import { loginCmsAdmin, setCmsSession } from '@/lib/cms/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json() as { username?: string; password?: string }
    const username = body.username?.trim() ?? ''
    const password = body.password ?? ''
    if (!username || !password) return NextResponse.json({ message: '请输入账号和密码。' }, { status: 400 })
    const session = await loginCmsAdmin(username, password)
    await setCmsSession(session.token, session.expiresAt)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : '登录失败。' }, { status: 401 })
  }
}
