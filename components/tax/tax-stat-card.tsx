import { ArrowDownRightIcon, ArrowUpRightIcon, type LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import type { TaxStatusTone } from './tax-status-badge'

const ICON_TONE: Record<TaxStatusTone, string> = {
  success: 'bg-status-online/12 text-status-online',
  processing: 'bg-status-running/12 text-status-running',
  warning: 'bg-status-warning/14 text-status-warning',
  error: 'bg-status-error/12 text-status-error',
  neutral: 'bg-secondary text-primary',
}

export function TaxStatCard({
  label,
  value,
  unit,
  icon: Icon,
  tone = 'neutral',
  trend,
  hint,
}: {
  label: string
  value: string
  unit?: string
  icon: LucideIcon
  tone?: TaxStatusTone
  trend?: { value: string; direction: 'up' | 'down'; positive?: boolean }
  hint?: string
}) {
  const TrendIcon =
    trend?.direction === 'down' ? ArrowDownRightIcon : ArrowUpRightIcon
  return (
    <Card className="flex-1">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span
            className={cn(
              'flex size-8 items-center justify-center rounded-lg',
              ICON_TONE[tone],
            )}
          >
            <Icon className="size-4" />
          </span>
        </div>
        <div className="flex items-end gap-1">
          <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {value}
          </span>
          {unit ? (
            <span className="pb-0.5 text-xs text-text-tertiary">{unit}</span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {trend ? (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-xs font-medium tabular-nums',
                trend.positive === false
                  ? 'text-status-error'
                  : 'text-status-online',
              )}
            >
              <TrendIcon className="size-3.5" />
              {trend.value}
            </span>
          ) : null}
          {hint ? (
            <span className="text-xs text-text-tertiary">{hint}</span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
