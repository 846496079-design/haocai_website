import { cn } from '@/lib/utils'

import type { TaxStatusTone } from './tax-status-badge'

const DOT_TONE: Record<TaxStatusTone, string> = {
  success: 'bg-status-online',
  processing: 'bg-status-running',
  warning: 'bg-status-warning',
  error: 'bg-status-error',
  neutral: 'bg-text-tertiary',
}

const RING_TONE: Record<TaxStatusTone, string> = {
  success: 'ring-status-online/20',
  processing: 'ring-status-running/20',
  warning: 'ring-status-warning/20',
  error: 'ring-status-error/20',
  neutral: 'ring-border',
}

export interface TaxTimelineItem {
  time: string
  title: string
  description?: string
  tone?: TaxStatusTone
}

export function TaxTimeline({
  items,
  className,
}: {
  items: TaxTimelineItem[]
  className?: string
}) {
  return (
    <ol className={cn('flex flex-col', className)}>
      {items.map((item, i) => {
        const tone = item.tone ?? 'neutral'
        const isLast = i === items.length - 1
        return (
          <li key={`${item.time}-${item.title}`} className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'mt-1 size-3 shrink-0 rounded-full ring-4',
                  DOT_TONE[tone],
                  RING_TONE[tone],
                )}
              />
              {!isLast ? (
                <span className="my-1 w-px flex-1 bg-border" />
              ) : null}
            </div>
            <div
              className={cn(
                'flex flex-col gap-0.5',
                isLast ? 'pb-0' : 'pb-5',
              )}
            >
              <span className="text-xs text-text-tertiary tabular-nums">
                {item.time}
              </span>
              <span className="text-sm font-medium text-foreground">
                {item.title}
              </span>
              {item.description ? (
                <span className="text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </span>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
