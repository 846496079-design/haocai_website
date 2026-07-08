import {
  CalendarClockIcon,
  SparklesIcon,
  type LucideIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { TaxStatusBadge, type TaxStatusTone } from './tax-status-badge'

export interface TaxOverviewMetric {
  label: string
  value: string
  unit?: string
  icon: LucideIcon
}

export function TaxOverviewPanel({
  period,
  company,
  statusTone = 'processing',
  statusLabel = '申报中',
  progress,
  metrics,
  suggestion,
  className,
}: {
  period: string
  company: string
  statusTone?: TaxStatusTone
  statusLabel?: string
  progress: number
  metrics: TaxOverviewMetric[]
  suggestion?: string
  className?: string
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="flex flex-col gap-5">
        {/* 头部：申报期 + 企业 + 状态 */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarClockIcon className="size-4 text-status-running" />
              <span>本期申报期 {period}</span>
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground text-balance">
              {company}
            </h3>
          </div>
          <TaxStatusBadge tone={statusTone}>{statusLabel}</TaxStatusBadge>
        </div>

        {/* 整体进度 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">本期申报整体进度</span>
            <span className="font-medium text-foreground tabular-nums">
              {progress}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-status-running transition-all"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>

        {/* 指标网格 */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <div
                key={metric.label}
                className="flex flex-col gap-2 rounded-xl border border-border bg-muted/40 p-3"
              >
                <span className="flex size-7 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Icon className="size-4" />
                </span>
                <div className="flex items-end gap-1">
                  <span className="text-lg font-semibold text-foreground tabular-nums">
                    {metric.value}
                  </span>
                  {metric.unit ? (
                    <span className="pb-0.5 text-xs text-text-tertiary">
                      {metric.unit}
                    </span>
                  ) : null}
                </div>
                <span className="text-xs text-muted-foreground">
                  {metric.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* AI 建议 */}
        {suggestion ? (
          <div className="flex items-start gap-3 rounded-xl border border-status-running/20 bg-status-running/8 p-3.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-status-running/15 text-status-running">
              <SparklesIcon className="size-4" />
            </span>
            <div className="flex flex-1 flex-col gap-2">
              <p className="text-sm leading-relaxed text-foreground">
                {suggestion}
              </p>
              <div>
                <Button size="sm" variant="outline">
                  查看 AI 建议
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
