import type * as React from 'react'
import {
  CheckCircle2Icon,
  CircleAlertIcon,
  ClockIcon,
  LoaderIcon,
  MoreHorizontalIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { AgentChip, type AgentStatus } from './agent-chip'

export type TaskStatus = 'running' | 'queued' | 'done' | 'failed'

const statusConfig: Record<
  TaskStatus,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    badge: 'default' | 'secondary' | 'outline' | 'destructive'
    accent: string
    agentStatus: AgentStatus
  }
> = {
  running: {
    label: '运行中',
    icon: LoaderIcon,
    badge: 'default',
    accent: 'text-status-running',
    agentStatus: 'running',
  },
  queued: {
    label: '排队中',
    icon: ClockIcon,
    badge: 'secondary',
    accent: 'text-status-waiting',
    agentStatus: 'waiting',
  },
  done: {
    label: '已完成',
    icon: CheckCircle2Icon,
    badge: 'outline',
    accent: 'text-status-online',
    agentStatus: 'online',
  },
  failed: {
    label: '失败',
    icon: CircleAlertIcon,
    badge: 'destructive',
    accent: 'text-status-error',
    agentStatus: 'error',
  },
}

export interface TaskCardProps extends React.ComponentProps<'div'> {
  title: string
  taskId: string
  status: TaskStatus
  /** 进度百分比 0-100 */
  progress?: number
  agentName: string
  /** 预计 / 实际耗时文案 */
  duration?: string
  steps?: { done: number; total: number }
}

export function TaskCard({
  title,
  taskId,
  status,
  progress = 0,
  agentName,
  duration,
  steps,
  className,
  ...props
}: TaskCardProps) {
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-border bg-card p-4',
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <StatusIcon
              className={cn(
                'size-4 shrink-0',
                config.accent,
                status === 'running' && 'animate-spin',
              )}
            />
            <h3 className="truncate text-sm font-semibold text-foreground">
              {title}
            </h3>
          </div>
          <span className="font-mono text-xs text-text-tertiary">{taskId}</span>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant={config.badge}>{config.label}</Badge>
          <Button variant="ghost" size="icon-sm" aria-label="更多操作">
            <MoreHorizontalIcon />
          </Button>
        </div>
      </div>

      {status !== 'queued' ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>执行进度</span>
            <span className="tabular-nums">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
        <AgentChip name={agentName} status={config.agentStatus} />
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {steps ? (
            <span className="tabular-nums">
              步骤 {steps.done}/{steps.total}
            </span>
          ) : null}
          {duration ? (
            <span className="flex items-center gap-1">
              <ClockIcon className="size-3.5" />
              {duration}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
