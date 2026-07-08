import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { TaxStatusBadge, type TaxStatusTone } from './tax-status-badge'

export interface VoucherEntry {
  /** 会计科目 */
  account: string
  /** 借方金额 */
  debit?: string
  /** 贷方金额 */
  credit?: string
}

export function VoucherPreview({
  voucherNo,
  date,
  summary,
  entries,
  totalDebit,
  totalCredit,
  statusTone = 'success',
  statusLabel = '已生成',
  className,
}: {
  voucherNo: string
  date: string
  summary: string
  entries: VoucherEntry[]
  totalDebit: string
  totalCredit: string
  statusTone?: TaxStatusTone
  statusLabel?: string
  className?: string
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="flex flex-col gap-4">
        {/* 凭证头 */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">
              记账凭证 {voucherNo}
            </span>
            <span className="text-xs text-muted-foreground">{date}</span>
          </div>
          <TaxStatusBadge tone={statusTone}>{statusLabel}</TaxStatusBadge>
        </div>

        <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          摘要：{summary}
        </p>

        {/* 借贷分录 */}
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 bg-muted/50 px-3.5 py-2 text-xs text-muted-foreground">
            <span>会计科目</span>
            <span className="w-24 text-right">借方</span>
            <span className="w-24 text-right">贷方</span>
          </div>
          <div className="divide-y divide-border">
            {entries.map((entry, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-3.5 py-2.5 text-sm"
              >
                <span className="text-foreground">{entry.account}</span>
                <span className="w-24 text-right tabular-nums text-foreground">
                  {entry.debit ?? '—'}
                </span>
                <span className="w-24 text-right tabular-nums text-foreground">
                  {entry.credit ?? '—'}
                </span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-t border-border bg-muted/40 px-3.5 py-2.5 text-sm font-semibold">
            <span className="text-foreground">合计</span>
            <span className="w-24 text-right tabular-nums text-foreground">
              {totalDebit}
            </span>
            <span className="w-24 text-right tabular-nums text-foreground">
              {totalCredit}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            编辑凭证
          </Button>
          <Button size="sm" className="flex-1">
            确认入账
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
