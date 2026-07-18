import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Clock3 } from 'lucide-react'
import LeadActions from '@/components/cms/lead-actions'
import { getCmsAdmin } from '@/lib/cms/auth'
import { getLeadSubmission } from '@/lib/leads/store'

export const dynamic = 'force-dynamic'
export const metadata = { robots: { index: false, follow: false }, title: '线索详情｜账大师官网后台' }

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(value))
}

const fieldLabels: Record<string, string> = {
  contactName: '联系人', contactPhone: '电话', referrerCode: '推荐码', companyName: '公司/团队',
  position: '角色身份', city: '城市', cooperationMode: '合作方式', customerScale: '客户资源规模',
  inviteCode: '邀请码/邀请人电话', remark: '补充说明',
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getCmsAdmin()
  if (!admin) redirect('/cms/login/')
  const id = Number((await params).id)
  if (!Number.isInteger(id) || id < 1) notFound()
  const item = getLeadSubmission(id)
  if (!item) notFound()
  return <main className="min-h-screen bg-slate-50 text-slate-950"><header className="border-b border-slate-200 bg-white"><div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 md:px-8"><p className="text-sm font-semibold text-indigo-600">账大师官网后台 / 线索管理</p><h1 className="mt-1 text-2xl font-bold tracking-tight">线索详情</h1></div></header><div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 md:px-8"><Link href="/cms/leads/" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900"><ArrowLeft className="size-4"/>返回线索列表</Link><div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]"><section className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-xs text-slate-400">{item.receiptId}</p><h2 className="mt-2 text-xl font-bold">{item.kind === 'TRIAL' ? '体验套餐线索' : '代理合作线索'}</h2><p className="mt-1 text-sm text-slate-500">接收于 {formatDate(item.createdAt)}</p></div><LeadActions id={item.id} status={item.status}/></div><dl className="mt-6 grid gap-x-6 gap-y-5 border-t border-slate-100 pt-6 sm:grid-cols-2">{Object.entries(item.payload).map(([key, value]) => <div key={key} className={key === 'remark' ? 'sm:col-span-2' : ''}><dt className="text-xs font-semibold text-slate-500">{fieldLabels[key] || key}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-900">{String(value)}</dd></div>)}</dl></section><aside className="h-fit rounded-xl border border-slate-200 bg-white p-5"><h2 className="flex items-center gap-2 font-bold"><Clock3 className="size-4"/>发送记录</h2><div className="mt-4 space-y-4">{item.attempts.map((attempt) => <div key={attempt.id} className="border-l-2 border-slate-200 pl-4 text-sm"><div className="flex items-center justify-between gap-2"><strong>{attempt.result === 'DELIVERED' ? '发送成功' : attempt.result === 'PAUSED' ? '已暂停' : '等待重试'}</strong><span className="text-xs text-slate-400">第 {attempt.attemptNo} 次</span></div><p className="mt-1 text-xs text-slate-500">{formatDate(attempt.finishedAt)} · {attempt.durationMs}ms{attempt.httpStatus ? ` · HTTP ${attempt.httpStatus}` : ''}</p>{attempt.errorMessage && <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs leading-5 text-slate-600">{attempt.errorMessage}</p>}</div>)}{!item.attempts.length && <p className="text-sm text-slate-500">尚未执行首次发送。</p>}</div></aside></div></div></main>
}
