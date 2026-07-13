'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import type { CmsArticleSummary } from '@/lib/cms/types'

const statusLabel = { DRAFT: '草稿', PUBLISHED: '已发布', OFFLINE: '已下线' } as const

export default function CmsDashboard({ items, username }: { items: CmsArticleSummary[]; username: string }) {
  const router = useRouter()
  const [slug, setSlug] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)

  async function createArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreating(true)
    setError('')
    const response = await fetch('/api/cms/news', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) })
    const data = await response.json() as { id?: number; message?: string }
    setCreating(false)
    if (!response.ok || !data.id) return setError(data.message ?? '创建草稿失败。')
    router.push(`/cms/news/${data.id}/`)
  }

  async function logout() {
    await fetch('/api/cms/auth/logout', { method: 'POST' })
    router.replace('/cms/login/')
    router.refresh()
  }

  return <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900 md:px-10">
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center"><div><p className="text-sm font-semibold text-indigo-600">账大师官网</p><h1 className="mt-1 text-3xl font-bold tracking-tight">新闻内容管理</h1><p className="mt-2 text-sm text-slate-500">当前管理员：{username}。草稿不会出现在公开官网。</p></div><button onClick={logout} className="self-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium">退出登录</button></header>
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold">新建新闻草稿</h2><form onSubmit={createArticle} className="mt-4 flex flex-col gap-3 sm:flex-row"><input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="文章路径，例如 ai-bookkeeping-update" className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2.5 outline-none ring-indigo-500 focus:ring-2" /><button disabled={creating} className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white disabled:opacity-60">{creating ? '创建中…' : '创建草稿'}</button></form>{error && <p className="mt-3 text-sm text-red-600">{error}</p>}</section>
      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold">全部新闻</h2></div><div className="divide-y divide-slate-100">{items.map((item) => <Link key={item.id} href={`/cms/news/${item.id}/`} className="flex gap-4 px-5 py-4 transition hover:bg-slate-50"><div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">{item.cover && <img src={item.cover} alt="" className="h-full w-full object-cover" />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-semibold">{item.slug}</h3><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{statusLabel[item.status]}</span>{!item.localesComplete && <span className="text-xs text-amber-700">三语未完整</span>}</div><p className="mt-1 text-sm text-slate-500">{item.date || '未填写日期'} · 最后修改 {new Date(item.updatedAt).toLocaleString('zh-CN')}</p></div></Link>)}{items.length === 0 && <p className="px-5 py-10 text-center text-sm text-slate-500">暂无新闻，请先创建草稿。</p>}</div></section>
    </div>
  </main>
}
