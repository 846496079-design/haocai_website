import { ArrowRightIcon, CalendarClockIcon, type LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import { TaxStatusBadge, type TaxStatusTone } from './tax-status-badge'

export function DeclarationCard({
  name,
  abbr,
  icon: Icon,
  period,
  deadline,
  amount,
  statusTone,
  statusLabel,
  actionLabel = '前往申报',
  onAction,
}: {
  name: string
  abbr: string
  icon: LucideIcon
  period: string
  deadline: string
  amount: string
  statusTone: TaxStatusTone
  statusLabel: string
  actionLabel?: string
  onAction?: () => void
}) {
  const overdueSoon = statusTone === 'warning' || statusTone === 'error'
  return (
    <Card className="flex-1">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
              <Icon className="size-5" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                {name}
              </span>
              <span className="text-xs text-text-tertiary">{abbr}</span>
            </div>
          </div>
          <TaxStatusBadge tone={statusTone}>{statusLabel}</TaxStatusBadge>
        </div>

        <Separator />

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">所属税期</span>
          <span className="font-medium text-foreground tabular-nums">
            {period}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">应纳税额</span>
          <span className="font-semibold text-foreground tabular-nums">
            {amount}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <CalendarClockIcon
            className={cn(
              'size-3.5',
              overdueSoon ? 'text-status-warning' : 'text-text-tertiary',
            )}
          />
          <span
            className={cn(
              overdueSoon ? 'text-status-warning' : 'text-text-tertiary',
            )}
          >
            申报截止 {deadline}
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onAction}>
          {actionLabel}
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </CardFooter>
    </Card>
  )
}
