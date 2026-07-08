import type * as React from 'react'
import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface MetricCardProps extends React.ComponentProps<'div'> {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
  /** 同比变化，正数为增长，负数为下降 */
  delta?: number
  /** 变化方向是否为正向收益（默认 true：增长为好） */
  positiveIsGood?: boolean
  /** 辅助说明，如对比周期 */
  hint?: string
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  delta,
  positiveIsGood = true,
  hint,
  className,
  ...props
}: MetricCardProps) {
  const hasDelta = typeof delta === 'number'
  const isUp = (delta ?? 0) >= 0
  const isGood = isUp === positiveIsGood
  const TrendIcon = isUp ? TrendingUpIcon : TrendingDownIcon

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-card p-4',
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        {Icon ? (
          <span className="flex size-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
          {value}
        </span>
        {hasDelta ? (
          <span
            className={cn(
              'flex items-center gap-1 text-xs font-medium tabular-nums',
              isGood ? 'text-status-online' : 'text-status-error',
            )}
          >
            <TrendIcon className="size-3.5" />
            {Math.abs(delta as number)}%
          </span>
        ) : null}
      </div>
      {hint ? (
        <span className="text-xs text-text-tertiary">{hint}</span>
      ) : null}
    </div>
  )
}
