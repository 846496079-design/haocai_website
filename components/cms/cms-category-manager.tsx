'use client'

import Link from 'next/link'
import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FolderPlus, Merge, Pencil, Search, Trash2, X } from 'lucide-react'
import type { CmsCategory } from '@/lib/cms/types'

type EditorState =
  | { mode: 'rename'; id: number; value: string }
  | { mode: 'merge'; id: number; targetId: string }
  | null

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'

async function responseMessage(response: Response, fallback: string) {
  try {
    const data = await response.json() as { message?: string }
    return data.message || fallback
  } catch {
    return fallback
  }
}

export default function CmsCategoryManager({ initial }: { initial: CmsCategory[] }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [pendingId, setPendingId] = useState<number | 'create' | null>(null)
  const [editor, setEditor] = useState<EditorState>(null)

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase()
    if (!needle) return initial
    return initial.filter((category) => `${category.name} ${category.slug} ${category.source}`.toLocaleLowerCase().includes(needle))
  }, [initial, query])

  function resetFeedback() {
    setNotice('')
    setError('')
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) return setError('请填写分类名称。')
    resetFeedback()
    setPendingId('create')
    try {
      const response = await fetch('/api/cms/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (!response.ok) return setError(await responseMessage(response, '创建分类失败，请稍后重试。'))
      setName('')
      setNotice('分类已创建并启用。')
      router.refresh()
    } catch {
      setError('网络连接异常，分类尚未创建。请稍后重试。')
    } finally {
      setPendingId(null)
    }
  }

  async function patchCategory(id: number, body: Record<string, unknown>, success: string) {
    resetFeedback()
    setPendingId(id)
    try {
      const response = await fetch(`/api/cms/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        setError(await responseMessage(response, '分类更新失败，请稍后重试。'))
        return false
      }
      setNotice(success)
      setEditor(null)
      router.refresh()
      return true
    } catch {
      setError('网络连接异常，本次修改未保存。请稍后重试。')
      return false
    } finally {
      setPendingId(null)
    }
  }

  async function changeStatus(category: CmsCategory) {
    const status: CmsCategory['status'] = category.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
    await patchCategory(
      category.id,
      { status },
      status === 'ACTIVE' ? '分类已恢复启用。' : '分类已停用；历史稿件不会被删除。',
    )
  }

  async function renameCategory(event: FormEvent<HTMLFormElement>, category: CmsCategory) {
    event.preventDefault()
    if (editor?.mode !== 'rename' || !editor.value.trim()) return setError('分类名称不能为空。')
    await patchCategory(category.id, { action: 'rename', name: editor.value.trim() }, '分类名称已更新。')
  }

  async function mergeCategory(event: FormEvent<HTMLFormElement>, category: CmsCategory) {
    event.preventDefault()
    if (editor?.mode !== 'merge' || !editor.targetId) return setError('请选择目标分类。')
    const target = initial.find((item) => String(item.id) === editor.targetId)
    if (!target || !window.confirm(`确认将“${category.name}”合并到“${target.name}”吗？相关稿件会统一改用目标分类。`)) return
    await patchCategory(category.id, { action: 'merge', targetId: Number(editor.targetId) }, `“${category.name}”已合并到“${target.name}”。`)
  }

  async function deleteCategory(category: CmsCategory) {
    if (!window.confirm(`确认永久删除分类“${category.name}”吗？只有未被稿件引用的分类可以删除。`)) return
    resetFeedback()
    setPendingId(category.id)
    try {
      const response = await fetch(`/api/cms/categories/${category.id}`, { method: 'DELETE' })
      if (!response.ok) return setError(await responseMessage(response, '分类无法删除；它可能仍被稿件引用。'))
      setNotice(`分类“${category.name}”已删除。`)
      if (editor?.id === category.id) setEditor(null)
      router.refresh()
    } catch {
      setError('网络连接异常，分类尚未删除。请稍后重试。')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-7 text-slate-950 sm:px-6 md:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/cms/" className={`inline-flex items-center gap-2 rounded-md text-sm font-semibold text-indigo-600 hover:text-indigo-700 ${focusRing}`}><ArrowLeft className="size-4" aria-hidden="true" />返回新闻管理</Link>
        <div className="mt-4"><p className="text-sm font-semibold text-indigo-600">内容基础设置</p><h1 className="mt-1 text-2xl font-bold tracking-tight">分类管理</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">分类用于稿件编辑和筛选。被稿件引用的分类请停用或合并到其他分类；只有未被引用的分类可以永久删除。</p></div>

        <div aria-live="polite" className="mt-5 space-y-2">
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
        </div>

        <section aria-labelledby="new-category-title" className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><FolderPlus className="size-5" aria-hidden="true" /></span><div><h2 id="new-category-title" className="font-semibold">新建分类</h2><p className="mt-0.5 text-xs text-slate-500">创建后会立即出现在稿件编辑器的分类选择中。</p></div></div>
          <form onSubmit={create} className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <label><span className="sr-only">分类名称</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：客户案例" autoComplete="off" className={`w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm ${focusRing}`} /></label>
            <button type="submit" disabled={pendingId !== null} className={`rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 ${focusRing}`}>{pendingId === 'create' ? '创建中…' : '创建分类'}</button>
          </form>
        </section>

        <section aria-labelledby="category-list-title" className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div><h2 id="category-list-title" className="font-semibold">全部分类</h2><p className="mt-1 text-xs text-slate-500">共 {initial.length} 个分类，{initial.filter((item) => item.status === 'ACTIVE').length} 个已启用</p></div>
            <label className="relative w-full sm:w-72"><span className="sr-only">搜索分类</span><Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" aria-hidden="true"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索名称、路径或来源" className={`w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm ${focusRing}`} /></label>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <div role="table" aria-label="分类列表" className="min-w-[760px]">
              <div role="row" className="grid grid-cols-[minmax(220px,1fr)_120px_120px_280px] gap-4 border-b border-slate-200 bg-slate-50/70 px-5 py-3 text-xs font-semibold text-slate-500"><span role="columnheader">分类</span><span role="columnheader">来源</span><span role="columnheader">状态</span><span role="columnheader">操作</span></div>
              {filtered.map((category) => <CategoryRow key={category.id} category={category} pending={pendingId === category.id} editor={editor} categories={initial} onEditor={setEditor} onStatus={changeStatus} onRename={renameCategory} onMerge={mergeCategory} onDelete={deleteCategory} />)}
            </div>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">
            {filtered.map((category) => <CategoryCard key={category.id} category={category} pending={pendingId === category.id} editor={editor} categories={initial} onEditor={setEditor} onStatus={changeStatus} onRename={renameCategory} onMerge={mergeCategory} onDelete={deleteCategory} />)}
          </div>

          {!filtered.length && <div className="px-5 py-14 text-center"><div className="mx-auto flex size-11 items-center justify-center rounded-full bg-slate-100 text-slate-500"><Search className="size-5" aria-hidden="true"/></div><h3 className="mt-4 font-semibold text-slate-800">{query ? '没有找到匹配分类' : '尚未创建分类'}</h3><p className="mt-2 text-sm text-slate-500">{query ? '尝试更换搜索关键词。' : '使用上方表单创建第一个分类。'}</p>{query && <button type="button" onClick={() => setQuery('')} className={`mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 ${focusRing}`}>清除搜索</button>}</div>}
        </section>
      </div>
    </main>
  )
}

type CategoryItemProps = {
  category: CmsCategory
  pending: boolean
  editor: EditorState
  categories: CmsCategory[]
  onEditor: (value: EditorState) => void
  onStatus: (category: CmsCategory) => Promise<void>
  onRename: (event: FormEvent<HTMLFormElement>, category: CmsCategory) => Promise<void>
  onMerge: (event: FormEvent<HTMLFormElement>, category: CmsCategory) => Promise<void>
  onDelete: (category: CmsCategory) => Promise<void>
}

function CategoryRow(props: CategoryItemProps) {
  const { category } = props
  return <div role="row" className="border-b border-slate-100 px-5 py-4 last:border-0"><div className="grid grid-cols-[minmax(220px,1fr)_120px_120px_280px] items-center gap-4"><CategoryIdentity category={category}/><span role="cell" className="text-sm text-slate-600">{category.source === 'IMPORT' ? '外部导入' : '后台创建'}</span><span role="cell"><StatusBadge status={category.status}/></span><div role="cell"><CategoryActions {...props}/></div></div>{props.editor?.id === category.id && <InlineEditor {...props}/>}</div>
}

function CategoryCard(props: CategoryItemProps) {
  const { category } = props
  return <article className="p-4"><div className="flex items-start justify-between gap-3"><CategoryIdentity category={category}/><StatusBadge status={category.status}/></div><p className="mt-3 text-xs text-slate-500">来源：{category.source === 'IMPORT' ? '外部导入' : '后台创建'}</p><div className="mt-4 border-t border-slate-100 pt-3"><CategoryActions {...props}/></div>{props.editor?.id === category.id && <InlineEditor {...props}/>}</article>
}

function CategoryIdentity({ category }: { category: CmsCategory }) {
  return <div role="cell" className="min-w-0"><p className="truncate font-semibold text-slate-900">{category.name}</p><p className="mt-1 truncate font-mono text-xs text-slate-500">{category.slug}</p></div>
}

function StatusBadge({ status }: { status: CmsCategory['status'] }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{status === 'ACTIVE' ? '已启用' : '已停用'}</span>
}

function CategoryActions({ category, pending, editor, onEditor, onStatus, onDelete }: CategoryItemProps) {
  const editing = editor?.id === category.id
  return <div className="flex flex-wrap items-center gap-1"><button type="button" disabled={pending} onClick={() => onEditor(editing && editor?.mode === 'rename' ? null : { mode: 'rename', id: category.id, value: category.name })} className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50 ${focusRing}`}><Pencil className="size-3.5" aria-hidden="true"/>改名</button><button type="button" disabled={pending} onClick={() => onEditor(editing && editor?.mode === 'merge' ? null : { mode: 'merge', id: category.id, targetId: '' })} className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50 ${focusRing}`}><Merge className="size-3.5" aria-hidden="true"/>合并</button><button type="button" disabled={pending} onClick={() => void onStatus(category)} className={`rounded-md px-2 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 ${focusRing}`}>{category.status === 'ACTIVE' ? '停用' : '启用'}</button><button type="button" disabled={pending} onClick={() => void onDelete(category)} aria-label={`删除分类 ${category.name}`} className={`rounded-md p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50 ${focusRing}`}><Trash2 className="size-4" aria-hidden="true"/></button></div>
}

function InlineEditor({ category, pending, editor, categories, onEditor, onRename, onMerge }: CategoryItemProps) {
  if (!editor || editor.id !== category.id) return null
  if (editor.mode === 'rename') return <form onSubmit={(event) => void onRename(event, category)} className="mt-4 grid gap-2 rounded-lg border border-indigo-100 bg-indigo-50/60 p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]"><label><span className="sr-only">新的分类名称</span><input autoFocus value={editor.value} onChange={(event) => onEditor({ ...editor, value: event.target.value })} className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm ${focusRing}`} /></label><button type="submit" disabled={pending} className={`rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 ${focusRing}`}>{pending ? '保存中…' : '保存名称'}</button><button type="button" onClick={() => onEditor(null)} aria-label="取消改名" className={`rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50 ${focusRing}`}><X className="size-4" aria-hidden="true"/></button></form>
  return <form onSubmit={(event) => void onMerge(event, category)} className="mt-4 grid gap-2 rounded-lg border border-indigo-100 bg-indigo-50/60 p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]"><label><span className="sr-only">合并到目标分类</span><select autoFocus value={editor.targetId} onChange={(event) => onEditor({ ...editor, targetId: event.target.value })} className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm ${focusRing}`}><option value="">请选择目标分类</option>{categories.filter((item) => item.id !== category.id && item.status === 'ACTIVE').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><button type="submit" disabled={pending || !editor.targetId} className={`rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 ${focusRing}`}>{pending ? '合并中…' : '确认合并'}</button><button type="button" onClick={() => onEditor(null)} aria-label="取消合并" className={`rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50 ${focusRing}`}><X className="size-4" aria-hidden="true"/></button></form>
}
