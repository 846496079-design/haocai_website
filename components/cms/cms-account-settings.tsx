'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react'

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'

async function responseMessage(response: Response, fallback: string) {
  try {
    const data = await response.json() as { message?: string }
    return data.message || fallback
  } catch {
    return fallback
  }
}

export default function CmsAccountSettings({ username }: { username: string }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!currentPassword || !newPassword || !confirmPassword) return setError('请完整填写三个密码字段。')
    if (newPassword.length < 12) return setError('新密码至少需要 12 个字符。')
    if (newPassword !== confirmPassword) return setError('两次输入的新密码不一致。')
    if (newPassword === currentPassword) return setError('新密码不能与当前密码相同。')
    setSubmitting(true)
    try {
      const response = await fetch('/api/cms/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })
      if (!response.ok) return setError(await responseMessage(response, '密码修改失败，请稍后重试。'))
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess(await responseMessage(response, '密码已更新，其他设备上的登录会话已退出。'))
    } catch {
      setError('网络连接异常，密码尚未修改。请检查连接后重试。')
    } finally {
      setSubmitting(false)
    }
  }

  const passwordType = showPasswords ? 'text' : 'password'
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-7 text-slate-950 sm:px-6 md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/cms/" className={`inline-flex items-center gap-2 rounded-md text-sm font-semibold text-indigo-600 hover:text-indigo-700 ${focusRing}`}><ArrowLeft className="size-4" aria-hidden="true" />返回官网后台</Link>
        <header className="mt-5"><p className="text-sm font-semibold text-indigo-600">账号与安全</p><h1 className="mt-1 text-2xl font-bold tracking-tight">管理员账号设置</h1><p className="mt-2 text-sm leading-6 text-slate-600">当前账号：<strong className="font-semibold text-slate-900">{username}</strong></p></header>

        <section aria-labelledby="password-title" className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><KeyRound className="size-5" aria-hidden="true" /></span><div><h2 id="password-title" className="font-semibold">修改登录密码</h2><p className="mt-1 text-sm leading-6 text-slate-500">修改成功后，当前设备会保持登录，其他设备上的会话将立即退出。</p></div></div></div>
          <form onSubmit={submit} className="space-y-5 p-5 sm:p-6" noValidate>
            <div aria-live="polite" className="space-y-3">
              {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              {success && <p role="status" className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"><CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{success}</p>}
            </div>

            <PasswordField id="current-password" label="当前密码" value={currentPassword} onChange={setCurrentPassword} type={passwordType} autoComplete="current-password" />
            <PasswordField id="new-password" label="新密码" hint="至少 12 个字符；建议使用大小写字母、数字和符号。" value={newPassword} onChange={setNewPassword} type={passwordType} autoComplete="new-password" minLength={12} />
            <PasswordField id="confirm-password" label="确认新密码" value={confirmPassword} onChange={setConfirmPassword} type={passwordType} autoComplete="new-password" minLength={12} />

            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={showPasswords} onChange={(event) => setShowPasswords(event.target.checked)} className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />{showPasswords ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}显示密码</label>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="flex items-start gap-2 text-xs leading-5 text-slate-500"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />密码会以安全哈希保存，不会以明文记录。</p><button type="submit" disabled={submitting} className={`rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60 ${focusRing}`}>{submitting ? '正在更新…' : '确认修改密码'}</button></div>
          </form>
        </section>
      </div>
    </main>
  )
}

function PasswordField({ id, label, hint, value, onChange, type, autoComplete, minLength }: { id: string; label: string; hint?: string; value: string; onChange: (value: string) => void; type: 'text' | 'password'; autoComplete: string; minLength?: number }) {
  const hintId = hint ? `${id}-hint` : undefined
  return <label htmlFor={id} className="block"><span className="text-sm font-semibold text-slate-800">{label}</span>{hint && <span id={hintId} className="mt-1 block text-xs leading-5 text-slate-500">{hint}</span>}<input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} minLength={minLength} required aria-describedby={hintId} className={`mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm ${focusRing}`} /></label>
}
