import { ArrowRightIcon, LinkIcon, type LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { TaxStatusBadge, type TaxStatusTone } from './tax-status-badge'

export interface MatchSide {
  label: string
  title: string
  amount: string
  icon: LucideIcon
}

export function BankMatchCard({
  flow,
  target,
  matchTone = 'success',
  matchLabel = '已匹配',
  confidence,
  className,
}: {
  flow: MatchSide
  target: MatchSide
  matchTone?: TaxStatusTone
  matchLabel?: string
  confidence?: string
  className?: string
}) {
  return (
    <Card className={cn('flex-1', className)}>
      <CardContent className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <LinkIcon className="size-4 text-status-running" />
            流水匹配
          </div>
          <TaxStatusBadge tone={matchTone}>{matchLabel}</TaxStatusBadge>
        </div>

        <div className="flex items-stretch gap-2">
          <MatchTile side={flow} />
          <div className="flex shrink-0 items-center text-text-tertiary">
            <ArrowRightIcon className="size-4" />
          </div>
          <MatchTile side={target} />
        </div>

        <div className="flex items-center justify-between">
          {confidence ? (
            <span className="text-xs text-text-tertiary">
              匹配置信度 <span className="font-medium text-foreground">{confidence}</span>
            </span>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button size="xs" variant="ghost">
              取消匹配
            </Button>
            <Button size="xs" variant="outline">
              确认
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MatchTile({ side }: { side: MatchSide }) {
  const Icon = side.icon
  return (
    <div className="flex flex-1 flex-col gap-1.5 rounded-xl border border-border bg-muted/40 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {side.label}
      </div>
      <span className="truncate text-sm font-medium text-foreground">
        {side.title}
      </span>
      <span className="text-sm font-semibold text-foreground tabular-nums">
        {side.amount}
      </span>
    </div>
  )
}
