import type * as React from 'react'

import { cn } from '@/lib/utils'

import type { TaxStatusTone } from './tax-status-badge'

const BAR_TONE: Record<TaxStatusTone, string> = {
  success: 'bg-status-online',
  processing: 'bg-status-running',
  warning: 'bg-status-warning',
  error: 'bg-status-error',
  neutral: 'bg-primary',
}

export function TaxProgressBanner({
  title,
  description,
  value,
  tone = 'processing',
  actions,
  className,
}: {
  title: string
  description?: string
  /** 0 - 100 */
  value: number
  tone?: TaxStatusTone
  actions?: React.ReactNode
  className?: string
}) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-border bg-card p-5',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {clamped}%
          </span>
          {actions ? (
            <div className="flex items-center gap-2">{actions}</div>
          ) : null}
        </div>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn('h-full rounded-full transition-all', BAR_TONE[tone])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
