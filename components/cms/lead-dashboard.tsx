import Link from 'next/link'
import { AlertTriangle, ArrowLeft, ArrowRight, BellOff, CheckCircle2, Clock3, Inbox, PauseCircle } from 'lucide-react'
import type { LeadFilters, LeadListItem, LeadStats } from '@/lib/leads/types'
import LeadActions from './lead-actions'

const statusCopy = {
  PENDING: { label: '待发送', className: 'bg-amber-50 text-amber-700' },
  DELIVERED: { label: '已发送', className: 'bg-emerald-50 text-emerald-700' },
  PAUSED: { label: '已暂停', className: 'bg-slate-100 text-slate-700' },
}

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(value))
}

function waiting(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000))
  if (minutes < 60) return `${minutes} 分钟`
  if (minutes < 1440) return `${Math.floor(minutes / 60)} 小时 ${minutes % 60} 分钟`
  return `${Math.floor(minutes / 1440)} 天 ${Math.floor((minutes % 1440) / 60)} 小时`
}

export default function LeadDashboard({ items, stats, filters, username }: { items: LeadListItem[]; stats: LeadStats; filters: LeadFilters; username: string }) {
  return <main className="min-h-screen bg-slate-50 text-slate-950">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 md:px-8"><div><p className="text-sm font-semibold text-indigo-600">账大师官网后台</p><h1 className="mt-1 text-2xl font-bold tracking-tight">线索管理</h1></div><div className="text-sm text-slate-500">管理员：{username}</div></div></header>
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8">
      <Link href="/cms/" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900"><ArrowLeft className="size-4" aria-hidden="true"/>返回官网后台</Link>

      {stats.overdue > 0 && <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"><AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true"/><div><p className="font-bold">{stats.overdue} 条线索超过 6 小时仍未送达</p><p className="mt-1 text-sm">最老一条已等待 {stats.oldestPendingAt ? waiting(stats.oldestPendingAt) : '未知时间'}，请检查最近错误或执行人工重试。</p></div></div>}
      {!stats.alertChannelConfigured && <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><BellOff className="mt-0.5 size-4 shrink-0" aria-hidden="true"/><p>飞书站外预警尚未配置；站内红色预警、线索接收和自动重试正常运行。</p></div>}

      <section aria-label="线索统计" className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="今日接收" value={stats.today} icon={<Inbox className="size-4"/>}/><StatCard label="待发送" value={stats.pending} icon={<Clock3 className="size-4"/>} tone="amber"/><StatCard label="超过 6 小时" value={stats.overdue} icon={<AlertTriangle className="size-4"/>} tone={stats.overdue ? 'red' : 'default'}/><StatCard label="已发送" value={stats.delivered} icon={<CheckCircle2 className="size-4"/>} tone="green"/><StatCard label="已暂停" value={stats.paused} icon={<PauseCircle className="size-4"/>}/>
      </section>

      <form method="get" className="mt-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[180px_180px_180px_auto]">
        <label className="grid gap-1 text-xs font-semibold text-slate-500">状态<select name="status" defaultValue={filters.status || ''} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-800"><option value="">全部状态</option><option value="PENDING">待发送</option><option value="DELIVERED">已发送</option><option value="PAUSED">已暂停</option></select></label>
        <label className="grid gap-1 text-xs font-semibold text-slate-500">类型<select name="kind" defaultValue={filters.kind || ''} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-800"><option value="">全部类型</option><option value="TRIAL">体验套餐</option><option value="PARTNER">代理合作</option></select></label>
        <label className="grid gap-1 text-xs font-semibold text-slate-500">预警<select name="overdue" defaultValue={filters.overdueOnly ? '1' : ''} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-800"><option value="">全部</option><option value="1">仅看超过 6 小时</option></select></label>
        <div className="flex items-end gap-2"><button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">筛选</button><Link href="/cms/leads/" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">清除</Link></div>
      </form>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="hidden overflow-x-auto md:block"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs font-semibold text-slate-500"><tr><th className="px-4 py-3">线索</th><th className="px-4 py-3">状态</th><th className="px-4 py-3">接收时间</th><th className="px-4 py-3">等待 / 尝试</th><th className="px-4 py-3">最近结果</th><th className="px-4 py-3">操作</th></tr></thead><tbody className="divide-y divide-slate-100">{items.map((item) => <LeadRow key={item.id} item={item}/>)}</tbody></table></div>
        <div className="divide-y divide-slate-100 md:hidden">{items.map((item) => <LeadCard key={item.id} item={item}/>)}</div>
        {!items.length && <div className="p-10 text-center"><Inbox className="mx-auto size-8 text-slate-300"/><p className="mt-3 font-semibold">没有符合条件的线索</p><p className="mt-1 text-sm text-slate-500">新的官网表单提交会出现在这里。</p></div>}
      </div>
    </div>
  </main>
}

function StatCard({ label, value, icon, tone = 'default' }: { label: string; value: number; icon: React.ReactNode; tone?: 'default' | 'amber' | 'red' | 'green' }) {
  const color = tone === 'red' ? 'text-red-600' : tone === 'amber' ? 'text-amber-600' : tone === 'green' ? 'text-emerald-600' : 'text-slate-900'
  return <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center gap-2 text-xs font-semibold text-slate-500">{icon}{label}</div><p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p></div>
}

function LeadRow({ item }: { item: LeadListItem }) {
  const status = statusCopy[item.status]
  return <tr className={item.overdue ? 'bg-red-50/40' : ''}><td className="px-4 py-4"><Link href={`/cms/leads/${item.id}/`} className="font-semibold text-slate-900 hover:text-indigo-700">{item.contactName}</Link><p className="mt-1 text-xs text-slate-500">{item.kind === 'TRIAL' ? '体验套餐' : '代理合作'} · {item.maskedPhone}</p><p className="mt-1 font-mono text-[11px] text-slate-400">{item.receiptId}</p></td><td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>{item.overdue && <span className="ml-2 inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">已超时</span>}</td><td className="whitespace-nowrap px-4 py-4 text-slate-600">{formatDate(item.createdAt)}</td><td className="px-4 py-4 text-slate-600">{item.status === 'DELIVERED' ? '已完成' : waiting(item.createdAt)}<p className="mt-1 text-xs text-slate-400">已尝试 {item.attemptCount} 次</p></td><td className="max-w-[240px] px-4 py-4 text-xs leading-5 text-slate-500">{item.lastErrorMessage || (item.deliveredAt ? `成功于 ${formatDate(item.deliveredAt)}` : '等待首次发送')}</td><td className="px-4 py-4"><div className="space-y-2"><Link href={`/cms/leads/${item.id}/`} className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-900">详情<ArrowRight className="size-4"/></Link><LeadActions id={item.id} status={item.status}/></div></td></tr>
}

function LeadCard({ item }: { item: LeadListItem }) {
  const status = statusCopy[item.status]
  return <article className={`p-4 ${item.overdue ? 'bg-red-50/40' : ''}`}><div className="flex items-start justify-between gap-3"><div><Link href={`/cms/leads/${item.id}/`} className="font-bold text-slate-900">{item.contactName}</Link><p className="mt-1 text-xs text-slate-500">{item.kind === 'TRIAL' ? '体验套餐' : '代理合作'} · {item.maskedPhone}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span></div><dl className="mt-4 grid grid-cols-2 gap-3 text-xs"><div><dt className="text-slate-400">接收时间</dt><dd className="mt-1 text-slate-700">{formatDate(item.createdAt)}</dd></div><div><dt className="text-slate-400">尝试次数</dt><dd className="mt-1 text-slate-700">{item.attemptCount} 次</dd></div></dl>{item.lastErrorMessage && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">{item.lastErrorMessage}</p>}<div className="mt-4"><LeadActions id={item.id} status={item.status}/></div></article>
}
