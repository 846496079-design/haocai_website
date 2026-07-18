'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Pause, RotateCcw } from 'lucide-react'
import type { LeadStatus } from '@/lib/leads/types'

const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'

export default function LeadActions({ id, status }: { id: number; status: LeadStatus }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function action(value: 'retry' | 'pause') {
    setPending(true)
    setError('')
    try {
      const response = await fetch(`/api/cms/leads/${id}/action/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: value }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as { message?: string }
        setError(data.message || '操作失败。')
        return
      }
      router.refresh()
    } catch {
      setError('网络连接异常，请稍后重试。')
    } finally {
      setPending(false)
    }
  }

  if (status === 'DELIVERED') return null
  return <div className="flex flex-wrap items-center gap-2">{status === 'PENDING' && <button type="button" disabled={pending} onClick={() => void action('pause')} className={`inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 ${focusRing}`}><Pause className="size-4" aria-hidden="true"/>暂停</button>}<button type="button" disabled={pending} onClick={() => void action('retry')} className={`inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 ${focusRing}`}><RotateCcw className="size-4" aria-hidden="true"/>{pending ? '处理中…' : '立即重试'}</button>{error && <span role="alert" className="text-xs text-red-600">{error}</span>}</div>
}
