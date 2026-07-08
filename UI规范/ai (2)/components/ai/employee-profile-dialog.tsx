'use client'

import type * as React from 'react'
import { MessageSquareIcon, SettingsIcon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { AgentStatus } from './agent-chip'

const statusConfig: Record<AgentStatus, { dot: string; label: string }> = {
  online: { dot: 'bg-status-online', label: '在岗' },
  running: { dot: 'bg-status-running', label: '执行中' },
  waiting: { dot: 'bg-status-waiting', label: '待命' },
  error: { dot: 'bg-status-error', label: '异常' },
  offline: { dot: 'bg-text-tertiary', label: '离线' },
}

export interface EmployeeProfileDialogProps {
  trigger: React.ReactNode
  name: string
  role: string
  avatarSrc?: string
  status?: AgentStatus
  description?: string
  skills?: string[]
  /** 能力评分项 0-100 */
  capabilities?: { label: string; value: number }[]
  stats?: { label: string; value: string }[]
  /** 最近活动记录 */
  activities?: { id: string; text: string; time: string }[]
}

export function EmployeeProfileDialog({
  trigger,
  name,
  role,
  avatarSrc,
  status = 'online',
  description,
  skills = [],
  capabilities = [],
  stats = [],
  activities = [],
}: EmployeeProfileDialogProps) {
  const config = statusConfig[status]

  return (
    <Dialog>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="size-16">
                <AvatarImage src={avatarSrc} alt={name} />
                <AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 size-4 rounded-full border-2 border-card',
                  config.dot,
                )}
                aria-hidden
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1 pt-1">
              <div className="flex items-center gap-2">
                <DialogTitle>{name}</DialogTitle>
                <Badge variant="secondary">{config.label}</Badge>
              </div>
              <DialogDescription>{role}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="capability">能力</TabsTrigger>
            <TabsTrigger value="activity">动态</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex flex-col gap-4 pt-2">
            {description ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
            {skills.length > 0 ? (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-foreground">
                  专长技能
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
            {stats.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 rounded-lg bg-secondary/60 p-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col gap-0.5 text-center"
                  >
                    <span className="text-base font-semibold tabular-nums text-foreground">
                      {stat.value}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="capability" className="flex flex-col gap-3 pt-2">
            {capabilities.map((cap) => (
              <div key={cap.label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">
                    {cap.label}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {cap.value}
                  </span>
                </div>
                <Progress value={cap.value} />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="activity" className="flex flex-col gap-3 pt-2">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <span
                  className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                  aria-hidden
                />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-foreground">
                    {activity.text}
                  </span>
                  <span className="text-xs text-text-tertiary">
                    {activity.time}
                  </span>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" size="sm">
            <SettingsIcon data-icon="inline-start" />
            配置
          </Button>
          <Button variant="default" size="sm">
            <MessageSquareIcon data-icon="inline-start" />
            发起对话
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
