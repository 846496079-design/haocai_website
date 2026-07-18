import { redirect } from 'next/navigation'
import CmsLoginForm from '@/components/cms/cms-login-form'
import { getCmsAdmin } from '@/lib/cms/auth'

export const metadata = { robots: { index: false, follow: false }, title: '账大师官网后台登录' }

export default async function CmsLoginPage() {
  if (await getCmsAdmin()) redirect('/cms/')
  return <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,_#e0e7ff,_#f8fafc_45%,_#eef2ff)] p-5"><section className="w-full max-w-md rounded-3xl border border-white/70 bg-white/90 p-8 shadow-2xl shadow-indigo-950/10"><p className="text-sm font-semibold text-indigo-600">账大师官网</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">官网后台</h1><p className="mt-3 text-sm leading-6 text-slate-500">用于管理官网线索和新闻内容，请使用后台管理员账号登录。</p><CmsLoginForm /></section></main>
}
