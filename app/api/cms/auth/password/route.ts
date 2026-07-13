import { NextResponse } from 'next/server'
import { changeCmsAdminPassword, getCmsAdmin } from '@/lib/cms/auth'

export async function POST(request: Request) {
  if (!await getCmsAdmin()) return NextResponse.json({ message: '登录已失效，请重新登录。' }, { status: 401 })
  try {
    const body = await request.json() as {
      currentPassword?: string
      newPassword?: string
      confirmPassword?: string
    }
    const currentPassword = body.currentPassword ?? ''
    const newPassword = body.newPassword ?? ''
    const confirmPassword = body.confirmPassword ?? ''
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ message: '请完整填写当前密码、新密码和确认密码。' }, { status: 400 })
    }
    if (newPassword.length < 12) {
      return NextResponse.json({ message: '新密码至少需要 12 个字符。' }, { status: 400 })
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ message: '两次输入的新密码不一致。' }, { status: 400 })
    }
    if (currentPassword === newPassword) {
      return NextResponse.json({ message: '新密码不能与当前密码相同。' }, { status: 400 })
    }
    const changed = await changeCmsAdminPassword(currentPassword, newPassword)
    if (!changed) return NextResponse.json({ message: '当前密码不正确，密码未修改。' }, { status: 400 })
    return NextResponse.json({ ok: true, message: '密码已更新，其他设备上的登录会话已退出。' })
  } catch {
    return NextResponse.json({ message: '暂时无法修改密码，请稍后重试。' }, { status: 500 })
  }
}
