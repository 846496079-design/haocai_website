import { ChevronRightIcon, type LucideIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import type { TaxStatusTone } from './tax-status-badge'

const COUNT_TONE: Record<TaxStatusTone, string> = {
  success: 'bg-status-online/12 text-status-online',
  processing: 'bg-status-running/12 text-status-running',
  warning: 'bg-status-warning/14 text-status-warning',
  error: 'bg-status-error/12 text-status-error',
  neutral: 'bg-muted text-muted-foreground',
}

const ICON_TONE: Record<TaxStatusTone, string> = {
  success: 'bg-status-online/12 text-status-online',
  processing: 'bg-status-running/12 text-status-running',
  warning: 'bg-status-warning/14 text-status-warning',
  error: 'bg-status-error/12 text-status-error',
  neutral: 'bg-secondary text-primary',
}

export interface TaxTodoItem {
  title: string
  description: string
  count: number
  icon: LucideIcon
  tone: TaxStatusTone
}

export function TaxTodoList({
  title = '待处理事项',
  items,
  className,
}: {
  title?: string
  items: TaxTodoItem[]
  className?: string
}) {
  const total = items.reduce((sum, item) => sum + item.count, 0)
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm font-normal text-muted-foreground tabular-nums">
            共 {total} 项
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.title}
              type="button"
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/40"
            >
              <span
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-lg',
                  ICON_TONE[item.tone],
                )}
              >
                <Icon className="size-4.5" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-medium text-foreground">
                  {item.title}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {item.description}
                </span>
              </div>
              <span
                className={cn(
                  'flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums',
                  COUNT_TONE[item.tone],
                )}
              >
                {item.count}
              </span>
              <ChevronRightIcon className="size-4 shrink-0 text-text-tertiary" />
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}
