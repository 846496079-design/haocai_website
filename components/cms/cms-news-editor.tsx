'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { NewsArticle } from '@/lib/news-content'
import type { SiteCode } from '@/lib/site-content'
import { CMS_LOCALES, type CmsArticleContent, type CmsArticleRecord } from '@/lib/cms/types'

const localeNames: Record<SiteCode, string> = { cn: '简体中文', jp: '日本语', hk: '繁體中文' }

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T }

export default function CmsNewsEditor({ initial }: { initial: CmsArticleRecord }) {
  const [content, setContent] = useState<CmsArticleContent>(() => clone(initial.content))
  const [locale, setLocale] = useState<SiteCode>('cn')
  const [reviewed, setReviewed] = useState(false)
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const article = content[locale]
  const complete = useMemo(() => CMS_LOCALES.every((code) => {
    const item = content[code]
    return item.title && item.summary && item.lead && item.category && item.cover && item.sections.length && item.closing.length
  }), [content])

  function updateArticle(update: Partial<NewsArticle>) {
    setContent((current) => ({ ...current, [locale]: { ...current[locale], ...update } }))
  }

  function updateSection(index: number, update: Partial<NewsArticle['sections'][number]>) {
    const sections = article.sections.map((section, sectionIndex) => sectionIndex === index ? { ...section, ...update } : section)
    updateArticle({ sections })
  }

  async function saveDraft() {
    setSaving(true)
    setNotice('')
    const response = await fetch(`/api/cms/news/${initial.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) })
    const data = await response.json() as { message?: string }
    setSaving(false)
    if (!response.ok) { setNotice(data.message ?? '保存失败。'); return false }
    setNotice('草稿已保存。')
    return true
  }

  async function uploadCover(file: File) {
    const formData = new FormData()
    formData.set('file', file)
    setSaving(true)
    const response = await fetch('/api/cms/upload', { method: 'POST', body: formData })
    const data = await response.json() as { url?: string; message?: string }
    setSaving(false)
    if (!response.ok || !data.url) return setNotice(data.message ?? '封面上传失败。')
    setContent((current) => Object.fromEntries(CMS_LOCALES.map((code) => [code, { ...current[code], cover: data.url as string }])) as CmsArticleContent)
    setNotice('封面已优化上传，请保存草稿。')
  }

  async function preview() {
    if (!await saveDraft()) return
    const response = await fetch(`/api/cms/news/${initial.id}/preview`, { method: 'POST' })
    if (!response.ok) return setNotice('无法记录预览状态，请稍后重试。')
    window.open(`/cms/preview/${initial.id}/?site=${locale}`, '_blank', 'noopener,noreferrer')
    setNotice('已打开官网样式预览。')
  }

  async function publish() {
    if (!reviewed) return setNotice('请先勾选人工审核确认。')
    if (!await saveDraft()) return
    const response = await fetch(`/api/cms/news/${initial.id}/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reviewed: true }) })
    const data = await response.json() as { message?: string }
    setNotice(response.ok ? '正式发布成功，公开新闻页已更新。' : (data.message ?? '发布失败。'))
  }

  async function offline() {
    if (!window.confirm('确认下线这篇新闻吗？下线后公众将无法访问。')) return
    const response = await fetch(`/api/cms/news/${initial.id}`, { method: 'DELETE' })
    const data = await response.json() as { message?: string }
    setNotice(response.ok ? '新闻已下线。' : (data.message ?? '下线失败。'))
  }

  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 md:px-8"><div className="mx-auto max-w-6xl"><header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5"><div><Link href="/cms/" className="text-sm font-semibold text-indigo-600">返回新闻管理</Link><h1 className="mt-2 text-2xl font-bold">编辑草稿：{initial.slug}</h1><p className="mt-1 text-sm text-slate-500">状态：{initial.status === 'PUBLISHED' ? '已发布，当前编辑将作为新草稿保存' : '草稿'}。发布前必须完成三语预览与人工确认。</p></div><div className="flex flex-wrap gap-2"><button onClick={saveDraft} disabled={saving} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-60">{saving ? '处理中…' : '保存草稿'}</button><button onClick={preview} disabled={saving} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">预览官网效果</button></div></header>
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">{CMS_LOCALES.map((code) => <button key={code} onClick={() => setLocale(code)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${locale === code ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{localeNames[code]}</button>)}</div>
      <div className="mt-6 space-y-5"><div className="grid gap-4 sm:grid-cols-2"><Field label="发布日期"><input value={article.date} onChange={(event) => updateArticle({ date: event.target.value })} placeholder="2026.07.13" /></Field><Field label="分类"><input value={article.category} onChange={(event) => updateArticle({ category: event.target.value })} placeholder="公司动态" /></Field></div><Field label="新闻标题"><input value={article.title} onChange={(event) => updateArticle({ title: event.target.value })} /></Field><Field label="摘要"><textarea value={article.summary} onChange={(event) => updateArticle({ summary: event.target.value })} rows={3} /></Field><Field label="导语"><textarea value={article.lead} onChange={(event) => updateArticle({ lead: event.target.value })} rows={4} /></Field><Field label="标签（用英文逗号分隔）"><input value={(article.tags ?? []).join(', ')} onChange={(event) => updateArticle({ tags: event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) })} /></Field>
        <Field label="新闻封面"><div className="flex flex-col gap-3 sm:flex-row sm:items-center">{article.cover && <img src={article.cover} alt="封面预览" className="h-24 w-40 rounded-lg border border-slate-200 object-cover" />}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadCover(file) }} /></div></Field>
        <div className="border-t border-slate-200 pt-5"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">正文分节</h2><button onClick={() => updateArticle({ sections: [...article.sections, { title: '', paragraphs: [''] }] })} className="rounded-lg border border-indigo-200 px-3 py-2 text-sm font-semibold text-indigo-700">新增分节</button></div><div className="mt-4 space-y-5">{article.sections.map((section, index) => <div key={index} className="rounded-xl border border-slate-200 p-4"><div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-slate-500">分节 {index + 1}</span><button onClick={() => updateArticle({ sections: article.sections.filter((_, sectionIndex) => sectionIndex !== index) })} className="text-sm text-red-600">删除</button></div><Field label="分节标题"><input value={section.title} onChange={(event) => updateSection(index, { title: event.target.value })} /></Field><Field label="正文段落（段落之间空一行）"><textarea value={section.paragraphs.join('\n\n')} onChange={(event) => updateSection(index, { paragraphs: event.target.value.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean) })} rows={8} /></Field></div>)}</div></div>
        <Field label="结语（每行一段）"><textarea value={article.closing.join('\n')} onChange={(event) => updateArticle({ closing: event.target.value.split('\n').map((line) => line.trim()).filter(Boolean) })} rows={4} /></Field>
      </div></section><aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold">发布检查</h2><ul className="mt-4 space-y-3 text-sm text-slate-600"><li>三语内容：{complete ? <b className="text-emerald-700">完整</b> : <b className="text-amber-700">待补全</b>}</li><li>草稿预览：{initial.previewedAt ? '已预览过当前版本' : '保存后点击预览'}</li><li>正式发布后，草稿将替换当前线上版本。</li></ul><label className="mt-5 flex cursor-pointer gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900"><input type="checkbox" checked={reviewed} onChange={(event) => setReviewed(event.target.checked)} className="mt-1" />我已人工审核三语内容、封面和预览效果，确认正式发布。</label><button onClick={publish} disabled={saving || !complete} className="mt-3 w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">确认发布</button>{initial.status === 'PUBLISHED' && <button onClick={offline} className="mt-3 w-full rounded-lg border border-red-200 px-4 py-3 text-sm font-semibold text-red-700">下线新闻</button>}{notice && <p className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">{notice}</p>}</aside></div></div></main>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="mt-4 block text-sm font-medium text-slate-700"><span>{label}</span><div className="mt-2 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-200 [&_input]:px-3 [&_input]:py-2.5 [&_input]:outline-none [&_input]:ring-indigo-500 [&_input:focus]:ring-2 [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-slate-200 [&_textarea]:px-3 [&_textarea]:py-2.5 [&_textarea]:outline-none [&_textarea]:ring-indigo-500 [&_textarea:focus]:ring-2">{children}</div></label>
}
