import type * as React from 'react'
import { MessageSquareIcon, SettingsIcon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AgentStatus } from './agent-chip'

const statusConfig: Record<AgentStatus, { dot: string; label: string }> = {
  online: { dot: 'bg-status-online', label: '在岗' },
  running: { dot: 'bg-status-running', label: '执行中' },
  waiting: { dot: 'bg-status-waiting', label: '待命' },
  error: { dot: 'bg-status-error', label: '异常' },
  offline: { dot: 'bg-text-tertiary', label: '离线' },
}

export interface EmployeeCardProps extends React.ComponentProps<'div'> {
  name: string
  role: string
  avatarSrc?: string
  status?: AgentStatus
  skills?: string[]
  stats?: { label: string; value: string }[]
}

export function EmployeeCard({
  name,
  role,
  avatarSrc,
  status = 'online',
  skills = [],
  stats = [],
  className,
  ...props
}: EmployeeCardProps) {
  const config = statusConfig[status]
  const initials = name.slice(0, 2)

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-border bg-card p-5',
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar className="size-12">
            <AvatarImage src={avatarSrc} alt={name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-card',
              config.dot,
            )}
            aria-hidden
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {name}
          </h3>
          <p className="truncate text-xs text-muted-foreground">{role}</p>
        </div>
        <Badge variant="secondary">{config.label}</Badge>
      </div>

      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <Badge key={skill} variant="outline">
              {skill}
            </Badge>
          ))}
        </div>
      ) : null}

      {stats.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 rounded-lg bg-secondary/60 p-3">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-0.5 text-center">
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <Button variant="default" size="sm" className="flex-1">
          <MessageSquareIcon data-icon="inline-start" />
          对话
        </Button>
        <Button variant="outline" size="icon-sm" aria-label="配置">
          <SettingsIcon />
        </Button>
      </div>
    </div>
  )
}
