import { ChevronRightIcon, type LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import type { TaxStatusTone } from './tax-status-badge'

const ICON_TONE: Record<TaxStatusTone, string> = {
  success: 'bg-status-online/12 text-status-online',
  processing: 'bg-status-running/12 text-status-running',
  warning: 'bg-status-warning/14 text-status-warning',
  error: 'bg-status-error/12 text-status-error',
  neutral: 'bg-secondary text-primary',
}

export interface TaxAction {
  title: string
  description?: string
  icon: LucideIcon
  tone?: TaxStatusTone
}

export function TaxActionPanel({
  title = '快捷操作',
  primaryLabel,
  actions,
  className,
}: {
  title?: string
  primaryLabel?: string
  actions: TaxAction[]
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {primaryLabel ? <Button size="sm">{primaryLabel}</Button> : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.title}
              type="button"
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/40"
            >
              <span
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-lg',
                  ICON_TONE[action.tone ?? 'neutral'],
                )}
              >
                <Icon className="size-4.5" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-medium text-foreground">
                  {action.title}
                </span>
                {action.description ? (
                  <span className="truncate text-xs text-muted-foreground">
                    {action.description}
                  </span>
                ) : null}
              </div>
              <ChevronRightIcon className="size-4 shrink-0 text-text-tertiary" />
            </button>
          )
        })}
      </CardContent>
    </Card>
  )
}
