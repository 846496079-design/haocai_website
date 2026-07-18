'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowDown,
  ArrowUp,
  FilePlus2,
  GripVertical,
  House,
  Inbox,
  Pin,
  Plus,
  RotateCcw,
  Search,
  Settings,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react'
import type { CmsArticleStatus, CmsArticleSummary } from '@/lib/cms/types'

type DashboardArticle = CmsArticleSummary & { title?: string }

const workspaces: { id: CmsArticleStatus; label: string; hint: string }[] = [
  { id: 'DRAFT', label: '草稿', hint: '尚未对外发布' },
  { id: 'PUBLISHED', label: '已发布', hint: '正在官网展示，可管理置顶与展示顺序' },
  { id: 'OFFLINE', label: '已下架', hint: '保留历史版本，不对外展示' },
  { id: 'TRASH', label: '回收站', hint: '可恢复为草稿或永久删除' },
]

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'

function isStatus(value: string | null): value is CmsArticleStatus {
  return workspaces.some((item) => item.id === value)
}

function formatUpdatedAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value || '—'
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function translationLabel(item: DashboardArticle) {
  if (item.translationStatus === 'CURRENT') return { text: '译文已同步', tone: 'bg-emerald-50 text-emerald-700' }
  if (item.translationStatus === 'STALE') return { text: '源稿有更新', tone: 'bg-amber-50 text-amber-700' }
  return { text: '待翻译', tone: 'bg-slate-100 text-slate-600' }
}

async function responseMessage(response: Response, fallback: string) {
  try {
    const data = await response.json() as { message?: string }
    return data.message || fallback
  } catch {
    return fallback
  }
}

export default function CmsDashboard({ items, username }: { items: DashboardArticle[]; username: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [workspace, setWorkspace] = useState<CmsArticleStatus>(() => {
    const value = searchParams.get('status')
    return isStatus(value) ? value : 'DRAFT'
  })
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '')
  const [category, setCategory] = useState(() => searchParams.get('category') ?? '')
  const [tag, setTag] = useState(() => searchParams.get('tag') ?? '')
  const [dateFrom, setDateFrom] = useState(() => searchParams.get('from') ?? '')
  const [dateTo, setDateTo] = useState(() => searchParams.get('to') ?? '')
  const [pinnedOnly, setPinnedOnly] = useState(() => searchParams.get('pinned') === '1')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [creating, setCreating] = useState(false)
  const [pending, setPending] = useState(false)
  const [draggingId, setDraggingId] = useState<number | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams()
      params.set('status', workspace)
      if (query.trim()) params.set('q', query.trim())
      if (category) params.set('category', category)
      if (tag.trim()) params.set('tag', tag.trim())
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      if (workspace === 'PUBLISHED' && pinnedOnly) params.set('pinned', '1')
      const next = `${pathname}?${params.toString()}`
      const current = `${pathname}?${searchParams.toString()}`
      if (next !== current) router.replace(next, { scroll: false })
    }, 220)
    return () => window.clearTimeout(timer)
  }, [workspace, query, category, tag, dateFrom, dateTo, pinnedOnly, pathname, router, searchParams])

  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-CN')),
    [items],
  )
  const filtered = useMemo(() => items.filter((item) => {
    if (item.status !== workspace) return false
    if (category && item.category !== category) return false
    if (tag && !item.tags.some((value) => value.toLocaleLowerCase().includes(tag.trim().toLocaleLowerCase()))) return false
    if (workspace === 'PUBLISHED' && pinnedOnly && !item.isPinned) return false
    if (dateFrom && item.date.replaceAll('.', '-') < dateFrom) return false
    if (dateTo && item.date.replaceAll('.', '-') > dateTo) return false
    const haystack = `${item.slug} ${item.title ?? ''} ${item.category} ${item.tags.join(' ')}`.toLocaleLowerCase()
    return haystack.includes(query.trim().toLocaleLowerCase())
  }), [items, workspace, category, tag, pinnedOnly, dateFrom, dateTo, query])
  const current = workspaces.find((item) => item.id === workspace)!
  const hasFilters = Boolean(query || category || tag || dateFrom || dateTo || (workspace === 'PUBLISHED' && pinnedOnly))
  const canReorder = workspace === 'PUBLISHED' && !hasFilters && !pending

  function clearFilters() {
    setQuery('')
    setCategory('')
    setTag('')
    setDateFrom('')
    setDateTo('')
    setPinnedOnly(false)
    setError('')
  }

  async function createArticle() {
    setCreating(true)
    setError('')
    setNotice('正在创建草稿…')
    try {
      const response = await fetch('/api/cms/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      if (!response.ok) return setError(await responseMessage(response, '创建草稿失败，请稍后重试。'))
      const data = await response.json() as { id?: number }
      if (!data.id) return setError('草稿已创建，但未返回稿件编号。')
      router.push(`/cms/news/${data.id}/`)
    } catch {
      setError('网络连接异常，草稿尚未创建。请检查连接后重试。')
    } finally {
      setCreating(false)
    }
  }

  async function lifecycle(id: number, action: 'trash' | 'restore' | 'delete' | 'pin' | 'unpin' | 'reorder', ids?: number[]) {
    if ((action === 'trash' || action === 'delete') && !window.confirm(action === 'delete' ? '确认永久删除吗？此操作无法撤销。' : '确认移入回收站吗？')) return false
    setPending(true)
    setError('')
    const actionLabel = action === 'pin' ? '正在置顶…' : action === 'unpin' ? '正在取消置顶…' : action === 'reorder' ? '正在更新展示顺序…' : '正在处理…'
    setNotice(actionLabel)
    try {
      const response = await fetch(`/api/cms/news/${id}/lifecycle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids }),
      })
      if (!response.ok) {
        setError(await responseMessage(response, '操作失败，请稍后重试。'))
        return false
      }
      setNotice(action === 'pin' ? '已置顶，官网会优先展示。' : action === 'unpin' ? '已取消置顶。' : action === 'reorder' ? '展示顺序已更新。' : '操作已完成。')
      router.refresh()
      return true
    } catch {
      setError('网络连接异常，本次操作未完成。请稍后重试。')
      return false
    } finally {
      setPending(false)
    }
  }

  async function reorder(fromId: number, toId: number) {
    if (!canReorder) return setError('请先清除筛选条件，再调整全部已发布稿件的展示顺序。')
    if (fromId === toId) return
    const source = filtered.find((item) => item.id === fromId)
    const target = filtered.find((item) => item.id === toId)
    if (!source || !target || source.isPinned !== target.isPinned) {
      return setError('置顶稿件只能在置顶组内排序；请先调整置顶状态。')
    }
    const ids = filtered.map((item) => item.id)
    const from = ids.indexOf(fromId)
    const to = ids.indexOf(toId)
    ids.splice(from, 1)
    ids.splice(to, 0, fromId)
    await lifecycle(fromId, 'reorder', ids)
  }

  async function moveByKeyboard(item: DashboardArticle, direction: -1 | 1) {
    const index = filtered.findIndex((candidate) => candidate.id === item.id)
    let targetIndex = index + direction
    while (targetIndex >= 0 && targetIndex < filtered.length && filtered[targetIndex].isPinned !== item.isPinned) targetIndex += direction
    const target = filtered[targetIndex]
    if (target) await reorder(item.id, target.id)
  }

  async function logout() {
    try { await fetch('/api/cms/auth/logout', { method: 'POST' }) } finally {
      router.replace('/cms/login/')
      router.refresh()
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 md:px-8">
          <div><p className="text-sm font-semibold text-indigo-600">账大师官网后台 / 内容工作台</p><h1 className="mt-1 text-2xl font-bold tracking-tight">新闻内容管理</h1></div>
          <div className="flex flex-wrap items-center justify-end gap-3 text-sm text-slate-500"><span>管理员：{username}</span><button type="button" onClick={logout} className={`rounded-lg border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50 ${focusRing}`}>退出</button></div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 md:px-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-3">
          <nav aria-label="稿件工作区">
            <div className="mb-3 space-y-1 border-b border-slate-200 pb-3"><Link href="/cms/" className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 ${focusRing}`}><House className="size-4" aria-hidden="true" />后台首页</Link><Link href="/cms/leads/" className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 ${focusRing}`}><Inbox className="size-4" aria-hidden="true" />线索管理</Link></div>
            <p className="px-3 pb-2 text-xs font-semibold tracking-wide text-slate-500">稿件工作区</p>
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-1">
              {workspaces.map((item) => <button key={item.id} type="button" aria-current={workspace === item.id ? 'page' : undefined} onClick={() => { setWorkspace(item.id); if (item.id !== 'PUBLISHED') setPinnedOnly(false) }} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold ${focusRing} ${workspace === item.id ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'}`}><span>{item.label}</span><span className={`text-xs ${workspace === item.id ? 'text-indigo-100' : 'text-slate-400'}`}>{items.filter((article) => article.status === item.id).length}</span></button>)}
            </div>
            <div className="mt-3 space-y-1 border-t border-slate-200 pt-3"><Link href="/cms/categories/" className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 ${focusRing}`}><SlidersHorizontal className="size-4" aria-hidden="true" />分类管理</Link><Link href="/cms/settings/" className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 ${focusRing}`}><Settings className="size-4" aria-hidden="true" />账号设置</Link></div>
          </nav>
        </aside>

        <section className="min-w-0" aria-labelledby="workspace-title">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div><p className="text-sm font-semibold text-indigo-600">{current.label}</p><h2 id="workspace-title" className="mt-1 text-xl font-bold">{current.hint}</h2></div>
            <button type="button" onClick={() => void createArticle()} disabled={creating} className={`inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 ${focusRing}`}><Plus className="size-4" aria-hidden="true" />{creating ? '正在创建…' : '新建稿件'}</button>
          </div>

          <div aria-live="polite" className="mt-3 space-y-2">
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
            <div className="grid items-end gap-3 md:grid-cols-2 xl:grid-cols-6">
              <label className="relative flex flex-col gap-1 md:col-span-2 xl:col-span-2"><span className="text-xs font-medium text-slate-500">搜索</span><Search className="pointer-events-none absolute bottom-3 left-3 size-4 text-slate-400" aria-hidden="true"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题、路径、分类或标签" className={`w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 ${focusRing}`}/></label>
              <label className="flex flex-col gap-1"><span className="text-xs font-medium text-slate-500">分类</span><select value={category} onChange={(event) => setCategory(event.target.value)} className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm ${focusRing}`}><option value="">全部分类</option>{categories.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label className="flex flex-col gap-1"><span className="text-xs font-medium text-slate-500">标签</span><input value={tag} onChange={(event) => setTag(event.target.value)} placeholder="输入标签关键词" className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm ${focusRing}`}/></label>
              <label className="flex flex-col gap-1"><span className="text-xs font-medium text-slate-500">开始日期</span><input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm ${focusRing}`}/></label>
              <label className="flex flex-col gap-1"><span className="text-xs font-medium text-slate-500">结束日期</span><input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm ${focusRing}`}/></label>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <div>{workspace === 'PUBLISHED' && <label className="inline-flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={pinnedOnly} onChange={(event) => setPinnedOnly(event.target.checked)} className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />仅看置顶</label>}</div>
              {hasFilters && <button type="button" onClick={clearFilters} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 ${focusRing}`}><RotateCcw className="size-4" aria-hidden="true" />清除筛选</button>}
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="hidden overflow-x-auto md:block">
              <div role="table" aria-label={`${current.label}稿件列表`} className="min-w-[940px]">
                <div role="row" className="grid grid-cols-[minmax(260px,1fr)_110px_120px_125px_150px] gap-4 border-b border-slate-200 bg-slate-50/70 px-5 py-3 text-xs font-semibold text-slate-500"><span role="columnheader">稿件</span><span role="columnheader">发布日期</span><span role="columnheader">译文</span><span role="columnheader">更新时间 / 排序</span><span role="columnheader">操作</span></div>
                {filtered.map((item, index) => <ArticleRow key={item.id} item={item} index={index} workspace={workspace} draggingId={draggingId} canReorder={canReorder} pending={pending} onDragStart={setDraggingId} onDrop={reorder} onMove={moveByKeyboard} onLifecycle={lifecycle} />)}
              </div>
            </div>
            <div className="divide-y divide-slate-100 md:hidden">
              {filtered.map((item, index) => <ArticleCard key={item.id} item={item} index={index} workspace={workspace} canReorder={canReorder} pending={pending} onMove={moveByKeyboard} onLifecycle={lifecycle} />)}
            </div>
            {!filtered.length && <EmptyState hasFilters={hasFilters} workspace={workspace} onClear={clearFilters} />}
          </div>
        </section>
      </div>
    </main>
  )
}

type ArticleActionProps = {
  item: DashboardArticle
  index: number
  workspace: CmsArticleStatus
  canReorder: boolean
  pending: boolean
  onMove: (item: DashboardArticle, direction: -1 | 1) => Promise<void>
  onLifecycle: (id: number, action: 'trash' | 'restore' | 'delete' | 'pin' | 'unpin' | 'reorder', ids?: number[]) => Promise<boolean>
}

function ArticleRow({ item, index, workspace, draggingId, canReorder, pending, onDragStart, onDrop, onMove, onLifecycle }: ArticleActionProps & { draggingId: number | null; onDragStart: (id: number | null) => void; onDrop: (from: number, to: number) => Promise<void> }) {
  const translation = translationLabel(item)
  return <div role="row" draggable={canReorder} onDragStart={() => onDragStart(item.id)} onDragEnd={() => onDragStart(null)} onDragOver={(event) => { if (canReorder) event.preventDefault() }} onDrop={() => { if (canReorder && draggingId !== null) void onDrop(draggingId, item.id); onDragStart(null) }} className={`grid grid-cols-[minmax(260px,1fr)_110px_120px_125px_150px] items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0 hover:bg-slate-50 ${draggingId === item.id ? 'bg-indigo-50 opacity-70' : ''}`}>
    <div role="cell" className="flex min-w-0 items-center gap-2">{canReorder && <GripVertical className="size-4 shrink-0 cursor-grab text-slate-400" aria-hidden="true"/>}<ArticleIdentity item={item}/></div>
    <span role="cell" className="text-sm text-slate-600">{item.date || '未填写'}</span>
    <span role="cell"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${translation.tone}`}>{translation.text}</span></span>
    <div role="cell" className="text-xs text-slate-500"><p>{formatUpdatedAt(item.updatedAt)}</p>{workspace === 'PUBLISHED' && <p className="mt-1 font-medium text-slate-700">{item.isPinned ? `置顶 · 第 ${index + 1} 位` : `展示第 ${index + 1} 位`}</p>}</div>
    <div role="cell"><ArticleActions item={item} index={index} workspace={workspace} canReorder={canReorder} pending={pending} onMove={onMove} onLifecycle={onLifecycle}/></div>
  </div>
}

function ArticleCard(props: ArticleActionProps) {
  const { item, index, workspace } = props
  const translation = translationLabel(item)
  return <article className="p-4"><ArticleIdentity item={item}/><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-slate-500">发布日期</dt><dd className="mt-1 text-slate-700">{item.date || '未填写'}</dd></div><div><dt className="text-xs text-slate-500">译文状态</dt><dd className="mt-1"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${translation.tone}`}>{translation.text}</span></dd></div><div><dt className="text-xs text-slate-500">最近更新</dt><dd className="mt-1 text-slate-700">{formatUpdatedAt(item.updatedAt)}</dd></div>{workspace === 'PUBLISHED' && <div><dt className="text-xs text-slate-500">展示顺序</dt><dd className="mt-1 font-medium text-slate-700">{item.isPinned ? `置顶 · 第 ${index + 1} 位` : `第 ${index + 1} 位`}</dd></div>}</dl><div className="mt-4 border-t border-slate-100 pt-3"><ArticleActions {...props}/></div></article>
}

function ArticleIdentity({ item }: { item: DashboardArticle }) {
  return <Link href={`/cms/news/${item.id}/`} className={`min-w-0 flex-1 rounded-sm ${focusRing}`}><div className="flex items-center gap-2"><h3 className="truncate font-semibold">{item.title || item.slug}</h3>{item.isPinned && <Pin className="size-4 shrink-0 fill-amber-400 text-amber-500" aria-label="已置顶"/>}</div><p className="mt-1 truncate text-sm text-slate-500">{item.slug}{item.category ? ` · ${item.category}` : ' · 待填写分类'}{item.tags.length ? ` · ${item.tags.join('、')}` : ''}</p></Link>
}

function ArticleActions({ item, workspace, canReorder, pending, onMove, onLifecycle }: ArticleActionProps) {
  return <div className="flex flex-wrap items-center gap-1 text-sm font-semibold">
    {workspace === 'PUBLISHED' && <button type="button" disabled={pending} onClick={() => void onLifecycle(item.id, item.isPinned ? 'unpin' : 'pin')} className={`rounded-md px-2 py-1.5 text-indigo-700 hover:bg-indigo-50 disabled:opacity-50 ${focusRing}`}>{item.isPinned ? '取消置顶' : '一键置顶'}</button>}
    {canReorder && <><button type="button" disabled={pending} onClick={() => void onMove(item, -1)} aria-label={`上移 ${item.title || item.slug}`} className={`rounded-md p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-50 ${focusRing}`}><ArrowUp className="size-4" aria-hidden="true"/></button><button type="button" disabled={pending} onClick={() => void onMove(item, 1)} aria-label={`下移 ${item.title || item.slug}`} className={`rounded-md p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-50 ${focusRing}`}><ArrowDown className="size-4" aria-hidden="true"/></button></>}
    {workspace === 'TRASH' ? <><button type="button" disabled={pending} onClick={() => void onLifecycle(item.id, 'restore')} className={`rounded-md px-2 py-1.5 text-indigo-700 hover:bg-indigo-50 disabled:opacity-50 ${focusRing}`}>恢复</button><button type="button" disabled={pending} onClick={() => void onLifecycle(item.id, 'delete')} className={`rounded-md px-2 py-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50 ${focusRing}`}>永久删除</button></> : <button type="button" disabled={pending} onClick={() => void onLifecycle(item.id, 'trash')} aria-label={`删除 ${item.title || item.slug}`} className={`rounded-md p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50 ${focusRing}`}><Trash2 className="size-4" aria-hidden="true"/></button>}
  </div>
}

function EmptyState({ hasFilters, workspace, onClear }: { hasFilters: boolean; workspace: CmsArticleStatus; onClear: () => void }) {
  return <div className="px-5 py-14 text-center"><div className="mx-auto flex size-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">{hasFilters ? <Search className="size-5" aria-hidden="true"/> : <FilePlus2 className="size-5" aria-hidden="true"/>}</div><h3 className="mt-4 font-semibold text-slate-800">{hasFilters ? '没有找到匹配稿件' : `${workspaces.find((item) => item.id === workspace)?.label ?? ''}中暂无稿件`}</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{hasFilters ? '尝试更换关键词、日期或分类，也可以清除全部筛选条件。' : workspace === 'DRAFT' ? '点击上方“新建稿件”即可创建第一篇草稿，系统会自动分配内部路径。' : '符合此状态的稿件会显示在这里。'}</p>{hasFilters && <button type="button" onClick={onClear} className={`mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 ${focusRing}`}><RotateCcw className="size-4" aria-hidden="true"/>清除筛选</button>}</div>
}
