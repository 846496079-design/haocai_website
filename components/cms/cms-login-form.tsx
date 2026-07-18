'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function CmsLoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    const response = await fetch('/api/cms/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) })
    const data = await response.json() as { message?: string }
    setSubmitting(false)
    if (!response.ok) return setError(data.message ?? '登录失败。')
    router.replace('/cms/')
    router.refresh()
  }

  return <form onSubmit={submit} className="mt-8 space-y-5">
    <label className="block text-sm font-medium text-slate-700">管理员账号<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none ring-indigo-500 focus:ring-2" /></label>
    <label className="block text-sm font-medium text-slate-700">密码<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none ring-indigo-500 focus:ring-2" /></label>
    {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    <button disabled={submitting} className="w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white disabled:opacity-60">{submitting ? '正在登录…' : '登录官网后台'}</button>
  </form>
}
