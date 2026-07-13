'use client'

import Link from 'next/link'
import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, Pin, SlidersHorizontal } from 'lucide-react'
import type { CmsArticleStatus, CmsArticleSummary } from '@/lib/cms/types'

const workspaces: { id: CmsArticleStatus; label: string; hint: string }[] = [
  { id: 'DRAFT', label: '草稿', hint: '尚未对外发布' },
  { id: 'PUBLISHED', label: '已发布', hint: '正在官网展示' },
  { id: 'OFFLINE', label: '已下架', hint: '保留历史，不对外展示' },
  { id: 'TRASH', label: '回收站', hint: '可恢复或永久删除' },
]

export default function CmsDashboard({ items, username }: { items: CmsArticleSummary[]; username: string }) {
  const router = useRouter()
  const [workspace, setWorkspace] = useState<CmsArticleStatus>('DRAFT')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [tag, setTag] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [pinnedOnly, setPinnedOnly] = useState(false)
  const [slug, setSlug] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const categories = useMemo(() => [...new Set(items.map((item) => item.category).filter(Boolean))].sort(), [items])
  const filtered = useMemo(() => items.filter((item) => {
    if (item.status !== workspace) return false
    if (category && item.category !== category) return false
    if (tag && !item.tags.some((value) => value.includes(tag))) return false
    if (pinnedOnly && !item.isPinned) return false
    if (dateFrom && item.date.replaceAll('.', '-') < dateFrom) return false
    if (dateTo && item.date.replaceAll('.', '-') > dateTo) return false
    const haystack = `${item.slug} ${item.category} ${item.tags.join(' ')}`.toLowerCase()
    return haystack.includes(query.trim().toLowerCase())
  }), [items, workspace, category, tag, pinnedOnly, dateFrom, dateTo, query])

  async function createArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setCreating(true); setError('')
    const response = await fetch('/api/cms/news', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) })
    const data = await response.json() as { id?: number; message?: string }
    setCreating(false)
    if (!response.ok || !data.id) return setError(data.message ?? '创建草稿失败。')
    router.push(`/cms/news/${data.id}/`)
  }

  async function logout() { await fetch('/api/cms/auth/logout', { method: 'POST' }); router.replace('/cms/login/'); router.refresh() }
  const current = workspaces.find((item) => item.id === workspace)!

  return <main className="min-h-screen bg-slate-50 text-slate-950"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5 md:px-8"><div><p className="text-sm font-semibold text-indigo-600">账大师官网 / 内容工作台</p><h1 className="mt-1 text-2xl font-bold tracking-tight">新闻管理</h1></div><div className="flex items-center gap-3 text-sm text-slate-500"><span>管理员：{username}</span><button onClick={logout} className="rounded-lg border border-slate-300 px-3 py-2 font-medium text-slate-700">退出</button></div></div></header>
    <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 md:px-8 lg:grid-cols-[220px_minmax(0,1fr)]"><aside className="rounded-xl border border-slate-200 bg-white p-3"><p className="px-3 pb-2 text-xs font-semibold tracking-wide text-slate-500">稿件工作区</p>{workspaces.map((item) => <button key={item.id} onClick={() => setWorkspace(item.id)} className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold ${workspace === item.id ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}><span>{item.label}</span><span className={`text-xs ${workspace === item.id ? 'text-indigo-100' : 'text-slate-400'}`}>{items.filter((article) => article.status === item.id).length}</span></button>)}<div className="mt-4 border-t border-slate-200 pt-4"><button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"><SlidersHorizontal className="size-4" />分类管理</button></div></aside>
      <section className="min-w-0"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-indigo-600">{current.label}</p><h2 className="mt-1 text-xl font-bold">{current.hint}</h2></div><form onSubmit={createArticle} className="flex gap-2"><input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="文章路径，例如 product-update" className="w-52 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"/><button disabled={creating} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"><Plus className="size-4" />新建稿件</button></form></div>{error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-2 xl:grid-cols-5"><label className="relative xl:col-span-2"><Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索路径、分类或标签" className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500"/></label><select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="">全部分类</option>{categories.map((value) => <option key={value}>{value}</option>)}</select><input value={tag} onChange={(event) => setTag(event.target.value)} placeholder="标签筛选" className="rounded-lg border border-slate-300 px-3 py-2 text-sm"/><label className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm"><input type="checkbox" checked={pinnedOnly} onChange={(event) => setPinnedOnly(event.target.checked)} />仅看置顶</label><input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm"/><input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm"/></div>
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="grid grid-cols-[minmax(0,1fr)_120px_112px] gap-4 border-b border-slate-200 px-5 py-3 text-xs font-semibold text-slate-500"><span>稿件</span><span>发布日期</span><span>状态</span></div>{filtered.map((item) => <Link key={item.id} href={`/cms/news/${item.id}/`} className="grid grid-cols-[minmax(0,1fr)_120px_112px] gap-4 border-b border-slate-100 px-5 py-4 last:border-0 hover:bg-slate-50"><div className="min-w-0"><div className="flex items-center gap-2"><h3 className="truncate font-semibold">{item.slug}</h3>{item.isPinned && <Pin className="size-4 fill-amber-400 text-amber-500"/>}</div><p className="mt-1 truncate text-sm text-slate-500">{item.category || '待填写分类'}{item.tags.length ? ` · ${item.tags.join('、')}` : ''}</p></div><span className="text-sm text-slate-600">{item.date || '未填写'}</span><span className="text-sm text-slate-500">{item.status === 'PUBLISHED' ? '已发布' : item.status === 'OFFLINE' ? '已下架' : item.status === 'TRASH' ? '回收站' : '草稿'}</span></Link>)}{!filtered.length && <div className="px-5 py-14 text-center text-sm text-slate-500">没有符合条件的稿件。</div>}</div></section></div></main>
}
