'use client'

import * as React from 'react'
import {
  ClockIcon,
  PlayIcon,
  WorkflowIcon,
  ZapIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export interface AutomationCardProps {
  name: string
  /** 触发条件描述 */
  trigger: string
  /** 步骤数 */
  steps: number
  /** 本周运行次数 */
  runs?: number
  /** 最近运行时间文案 */
  lastRun?: string
  defaultEnabled?: boolean
  enabled?: boolean
  onEnabledChange?: (enabled: boolean) => void
  onRun?: () => void
  className?: string
}

export function AutomationCard({
  name,
  trigger,
  steps,
  runs,
  lastRun,
  defaultEnabled = true,
  enabled,
  onEnabledChange,
  onRun,
  className,
}: AutomationCardProps) {
  const [internal, setInternal] = React.useState(defaultEnabled)
  const isOn = enabled ?? internal

  function handleChange(next: boolean) {
    setInternal(next)
    onEnabledChange?.(next)
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl border bg-card p-4 transition-colors',
        isOn ? 'border-primary/40' : 'border-border',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex size-10 items-center justify-center rounded-lg transition-colors',
              isOn
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground',
            )}
          >
            <WorkflowIcon className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-foreground">{name}</h3>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ZapIcon className="size-3.5 text-status-warning" />
              {trigger}
            </span>
          </div>
        </div>
        <Switch
          checked={isOn}
          onCheckedChange={handleChange}
          aria-label={`${isOn ? '停用' : '启用'} ${name}`}
        />
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline">{steps} 个步骤</Badge>
        {isOn ? (
          <Badge variant="secondary">已启用</Badge>
        ) : (
          <Badge variant="secondary">已暂停</Badge>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {typeof runs === 'number' ? (
            <span className="tabular-nums">本周 {runs} 次</span>
          ) : null}
          {lastRun ? (
            <span className="flex items-center gap-1">
              <ClockIcon className="size-3.5" />
              {lastRun}
            </span>
          ) : null}
        </div>
        <Button variant="outline" size="sm" onClick={onRun} disabled={!isOn}>
          <PlayIcon data-icon="inline-start" />
          运行
        </Button>
      </div>
    </div>
  )
}
