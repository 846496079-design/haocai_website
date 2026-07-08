import type * as React from 'react'

import { cn } from '@/lib/utils'

export type WorkflowNodeKind = 'trigger' | 'agent' | 'tool' | 'condition' | 'output'

export type WorkflowNodeState = 'idle' | 'running' | 'success' | 'error'

const kindConfig: Record<WorkflowNodeKind, { label: string; tint: string }> = {
  trigger: { label: '触发器', tint: 'bg-status-warning/15 text-status-warning' },
  agent: { label: '代理', tint: 'bg-primary/12 text-primary' },
  tool: { label: '工具', tint: 'bg-status-running/15 text-status-running' },
  condition: { label: '条件', tint: 'bg-status-waiting/20 text-muted-foreground' },
  output: { label: '输出', tint: 'bg-status-online/15 text-status-online' },
}

const stateRing: Record<WorkflowNodeState, string> = {
  idle: 'border-border',
  running: 'border-status-running ring-2 ring-status-running/25',
  success: 'border-status-online',
  error: 'border-status-error ring-2 ring-status-error/20',
}

export interface WorkflowNodeProps extends React.ComponentProps<'div'> {
  title: string
  kind: WorkflowNodeKind
  icon: React.ComponentType<{ className?: string }>
  subtitle?: string
  state?: WorkflowNodeState
  /** 是否显示左侧输入连接点 */
  hasInput?: boolean
  /** 是否显示右侧输出连接点 */
  hasOutput?: boolean
  selected?: boolean
}

export function WorkflowNode({
  title,
  kind,
  icon: Icon,
  subtitle,
  state = 'idle',
  hasInput = true,
  hasOutput = true,
  selected = false,
  className,
  ...props
}: WorkflowNodeProps) {
  const config = kindConfig[kind]

  return (
    <div
      className={cn(
        'relative flex w-56 items-center gap-3 rounded-xl border bg-card p-3 shadow-sm transition-colors',
        stateRing[state],
        selected && 'border-ring ring-2 ring-ring/30',
        className,
      )}
      {...props}
    >
      {hasInput ? (
        <span
          className="absolute -left-1.5 top-1/2 size-3 -translate-y-1/2 rounded-full border-2 border-card bg-border"
          aria-hidden
        />
      ) : null}

      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg',
          config.tint,
        )}
      >
        <Icon className="size-4.5" />
      </span>

      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-foreground">
            {title}
          </span>
        </div>
        <span className="truncate text-xs text-muted-foreground">
          {config.label}
          {subtitle ? ` · ${subtitle}` : ''}
        </span>
      </div>

      {state === 'running' ? (
        <span
          className="absolute right-3 top-3 size-2 animate-pulse rounded-full bg-status-running"
          aria-hidden
        />
      ) : null}

      {hasOutput ? (
        <span
          className="absolute -right-1.5 top-1/2 size-3 -translate-y-1/2 rounded-full border-2 border-card bg-primary"
          aria-hidden
        />
      ) : null}
    </div>
  )
}
