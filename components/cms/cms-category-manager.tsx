'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CmsCategory } from '@/lib/cms/types'

export default function CmsCategoryManager({ initial }: { initial: CmsCategory[] }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [notice, setNotice] = useState('')
  const [pending, setPending] = useState(false)

  async function create() {
    if (!name.trim()) return setNotice('请填写分类名称。')
    setPending(true)
    const response = await fetch('/api/cms/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
    const data = await response.json() as { message?: string }
    setPending(false)
    if (!response.ok) return setNotice(data.message ?? '创建失败。')
    setName(''); setNotice('分类已创建。'); router.refresh()
  }

  async function changeStatus(id: number, status: CmsCategory['status']) {
    setPending(true)
    const response = await fetch(`/api/cms/categories/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    const data = await response.json() as { message?: string }
    setPending(false)
    if (!response.ok) return setNotice(data.message ?? '更新失败。')
    setNotice(status === 'ACTIVE' ? '分类已启用。' : '分类已停用；历史稿件不会被删除。')
    router.refresh()
  }

  return <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950 md:px-8"><div className="mx-auto max-w-4xl"><Link href="/cms/" className="text-sm font-semibold text-indigo-600">返回新闻管理</Link><h1 className="mt-3 text-2xl font-bold">分类管理</h1><p className="mt-2 text-sm text-slate-500">分类供稿件筛选与发布使用。被已有稿件引用的分类只能停用，不能直接删除。</p><section className="mt-6 rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold">新建分类</h2><div className="mt-4 flex flex-wrap gap-3"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：客户案例" className="min-w-56 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"/><button disabled={pending} onClick={create} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">创建分类</button></div></section><section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="grid grid-cols-[minmax(0,1fr)_120px_130px] gap-4 border-b border-slate-200 px-5 py-3 text-xs font-semibold text-slate-500"><span>分类</span><span>来源</span><span>操作</span></div>{initial.map((category) => <div key={category.id} className="grid grid-cols-[minmax(0,1fr)_120px_130px] items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0"><div><p className="font-semibold">{category.name}</p><p className="mt-1 text-xs text-slate-500">{category.status === 'ACTIVE' ? '已启用' : '已停用'}</p></div><span className="text-sm text-slate-600">{category.source === 'IMPORT' ? '外部导入' : '后台创建'}</span><button disabled={pending} onClick={() => void changeStatus(category.id, category.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE')} className="text-left text-sm font-semibold text-indigo-700 disabled:opacity-50">{category.status === 'ACTIVE' ? '停用' : '启用'}</button></div>)}{!initial.length && <p className="px-5 py-12 text-center text-sm text-slate-500">尚未创建分类。</p>}</section>{notice && <p className="mt-4 rounded-lg bg-white p-3 text-sm text-slate-700">{notice}</p>}</div></main>
}
