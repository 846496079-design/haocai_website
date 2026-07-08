import type * as React from 'react'

import { cn } from '@/lib/utils'

export type TaxStatusTone =
  | 'success'
  | 'processing'
  | 'warning'
  | 'error'
  | 'neutral'

const TONE_STYLES: Record<TaxStatusTone, string> = {
  success: 'bg-status-online/12 text-status-online',
  processing: 'bg-status-running/12 text-status-running',
  warning: 'bg-status-warning/14 text-status-warning',
  error: 'bg-status-error/12 text-status-error',
  neutral: 'bg-muted text-muted-foreground',
}

const DOT_STYLES: Record<TaxStatusTone, string> = {
  success: 'bg-status-online',
  processing: 'bg-status-running',
  warning: 'bg-status-warning',
  error: 'bg-status-error',
  neutral: 'bg-text-tertiary',
}

export function TaxStatusBadge({
  tone = 'neutral',
  children,
  withDot = true,
  className,
}: {
  tone?: TaxStatusTone
  children: React.ReactNode
  withDot?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex h-6 w-fit shrink-0 items-center gap-1.5 rounded-4xl px-2.5 text-xs font-medium whitespace-nowrap',
        TONE_STYLES[tone],
        className,
      )}
    >
      {withDot ? (
        <span className={cn('size-1.5 rounded-full', DOT_STYLES[tone])} />
      ) : null}
      {children}
    </span>
  )
}
