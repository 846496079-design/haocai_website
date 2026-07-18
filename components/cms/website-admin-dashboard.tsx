'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ArrowRight, FileText, Inbox, Settings } from 'lucide-react'
import type { LeadStats } from '@/lib/leads/types'

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'

export default function WebsiteAdminDashboard({ username, leadStats }: { username: string; leadStats: LeadStats }) {
  const router = useRouter()

  async function logout() {
    try { await fetch('/api/cms/auth/logout/', { method: 'POST' }) } finally {
      router.replace('/cms/login/')
      router.refresh()
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 md:px-8">
          <div><p className="text-sm font-semibold text-indigo-600">账大师官网</p><h1 className="mt-1 text-2xl font-bold tracking-tight">官网后台</h1></div>
          <div className="flex items-center gap-3 text-sm text-slate-500"><span>管理员：{username}</span><Link href="/cms/settings/" className={`rounded-lg border border-slate-300 p-2 text-slate-700 hover:bg-slate-50 ${focusRing}`} aria-label="账号设置"><Settings className="size-4" /></Link><button type="button" onClick={logout} className={`rounded-lg border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50 ${focusRing}`}>退出</button></div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-8">
        {leadStats.overdue > 0 && <Link href="/cms/leads/?overdue=1" className={`mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 hover:bg-red-100 ${focusRing}`}><AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true"/><span><strong>{leadStats.overdue} 条线索超过 6 小时仍未送达</strong><span className="mt-1 block text-sm text-red-700">请进入线索管理检查外部接口和失败原因。</span></span><ArrowRight className="ml-auto size-5 shrink-0" aria-hidden="true"/></Link>}

        <section aria-labelledby="overview-title">
          <div><p className="text-sm font-semibold text-indigo-600">业务总览</p><h2 id="overview-title" className="mt-1 text-xl font-bold">选择需要管理的板块</h2></div>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Link href="/cms/leads/" className={`group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md ${focusRing}`}>
              <div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><Inbox className="size-5" aria-hidden="true"/></span><ArrowRight className="size-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600" aria-hidden="true"/></div>
              <h3 className="mt-5 text-lg font-bold">线索管理</h3><p className="mt-2 text-sm leading-6 text-slate-500">接收官网表单、自动转发、失败重试与超时预警。</p>
              <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5 text-sm"><div><dt className="text-slate-500">今日接收</dt><dd className="mt-1 text-xl font-bold">{leadStats.today}</dd></div><div><dt className="text-slate-500">待发送</dt><dd className="mt-1 text-xl font-bold text-amber-600">{leadStats.pending}</dd></div><div><dt className="text-slate-500">超时预警</dt><dd className={`mt-1 text-xl font-bold ${leadStats.overdue ? 'text-red-600' : 'text-emerald-600'}`}>{leadStats.overdue}</dd></div></dl>
            </Link>
            <Link href="/cms/news/" className={`group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md ${focusRing}`}>
              <div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><FileText className="size-5" aria-hidden="true"/></span><ArrowRight className="size-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600" aria-hidden="true"/></div>
              <h3 className="mt-5 text-lg font-bold">新闻内容管理</h3><p className="mt-2 text-sm leading-6 text-slate-500">管理官网新闻草稿、翻译、预览、发布和内容分类。</p>
              <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-5 text-sm font-semibold text-indigo-700"><FileText className="size-4" aria-hidden="true"/>进入内容工作台</div>
            </Link>
          </div>
        </section>

        {!leadStats.alertChannelConfigured && <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true"/><p><strong>飞书预警尚未配置。</strong>线索接收与自动重试不受影响；配置群机器人 Webhook 后会启用 6 小时站外预警。</p></div>}
      </div>
    </main>
  )
}
