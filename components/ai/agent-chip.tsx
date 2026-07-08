import type * as React from 'react'
import { BotIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export type AgentStatus = 'online' | 'running' | 'waiting' | 'error' | 'offline'

const statusConfig: Record<
  AgentStatus,
  { dot: string; label: string }
> = {
  online: { dot: 'bg-status-online', label: '在线' },
  running: { dot: 'bg-status-running', label: '运行中' },
  waiting: { dot: 'bg-status-waiting', label: '等待中' },
  error: { dot: 'bg-status-error', label: '异常' },
  offline: { dot: 'bg-text-tertiary', label: '离线' },
}

export interface AgentChipProps extends React.ComponentProps<'span'> {
  name: string
  status?: AgentStatus
  icon?: React.ComponentType<{ className?: string }>
  /** 紧凑模式：仅显示头像与状态点 */
  compact?: boolean
}

export function AgentChip({
  name,
  status = 'online',
  icon: Icon = BotIcon,
  compact = false,
  className,
  ...props
}: AgentChipProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-3 text-xs font-medium text-foreground',
        compact && 'pr-1',
        className,
      )}
      {...props}
    >
      <span className="relative inline-flex size-6 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <Icon className="size-3.5" />
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card',
            config.dot,
          )}
          aria-hidden
        />
      </span>
      {!compact && (
        <>
          <span className="max-w-32 truncate">{name}</span>
          <span className="sr-only">{config.label}</span>
        </>
      )}
    </span>
  )
}
