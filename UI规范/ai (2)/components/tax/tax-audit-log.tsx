import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { TaxStatusBadge, type TaxStatusTone } from './tax-status-badge'

export interface TaxAuditEntry {
  operator: string
  action: string
  target?: string
  time: string
  tag?: { tone: TaxStatusTone; label: string }
}

export function TaxAuditLog({
  title = '操作日志',
  entries,
  className,
}: {
  title?: string
  entries: TaxAuditEntry[]
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
        {entries.map((entry, i) => (
          <div
            key={`${entry.time}-${i}`}
            className={cn(
              'flex items-start gap-3 py-3',
              i < entries.length - 1 && 'border-b border-border',
            )}
          >
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="bg-secondary text-xs font-medium text-primary">
                {entry.operator.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-sm text-foreground">
                <span className="font-medium">{entry.operator}</span>
                <span className="text-muted-foreground"> {entry.action} </span>
                {entry.target ? (
                  <span className="font-medium">{entry.target}</span>
                ) : null}
              </p>
              <span className="text-xs text-text-tertiary tabular-nums">
                {entry.time}
              </span>
            </div>
            {entry.tag ? (
              <TaxStatusBadge tone={entry.tag.tone} withDot={false}>
                {entry.tag.label}
              </TaxStatusBadge>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
