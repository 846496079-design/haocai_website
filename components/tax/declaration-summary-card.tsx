import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import { TaxStatusBadge, type TaxStatusTone } from './tax-status-badge'

export interface DeclarationLine {
  name: string
  abbr: string
  amount: string
  status: { tone: TaxStatusTone; label: string }
}

export function DeclarationSummaryCard({
  period,
  lines,
  total,
  className,
}: {
  period: string
  lines: DeclarationLine[]
  total: string
  className?: string
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>本期申报汇总</span>
          <span className="text-sm font-normal text-muted-foreground">
            {period}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {lines.map((line) => (
          <div
            key={line.abbr}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-3.5 py-3"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 min-w-11 items-center justify-center rounded-md bg-secondary px-2 text-xs font-semibold text-primary">
                {line.abbr}
              </span>
              <span className="text-sm font-medium text-foreground">
                {line.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {line.amount}
              </span>
              <TaxStatusBadge tone={line.status.tone}>
                {line.status.label}
              </TaxStatusBadge>
            </div>
          </div>
        ))}

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">本期应缴税额合计</span>
          <span className="text-xl font-semibold tracking-tight text-foreground tabular-nums">
            {total}
          </span>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1">一键申报</Button>
          <Button variant="outline" className="flex-1">
            下载报表
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
