import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

import { TaxStatusBadge, type TaxStatusTone } from './tax-status-badge'

export interface BankFlowRow {
  date: string
  account: string
  counterparty: string
  /** 收入金额，无则留空 */
  income?: string
  /** 支出金额，无则留空 */
  expense?: string
  summary: string
  matched: string
  status: { tone: TaxStatusTone; label: string }
}

export function BankFlowTable({
  rows,
  className,
}: {
  rows: BankFlowRow[]
  className?: string
}) {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-xl border border-border',
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="text-xs text-muted-foreground">交易日期</TableHead>
            <TableHead className="text-xs text-muted-foreground">账户</TableHead>
            <TableHead className="text-xs text-muted-foreground">对方户名</TableHead>
            <TableHead className="text-right text-xs text-muted-foreground">收入</TableHead>
            <TableHead className="text-right text-xs text-muted-foreground">支出</TableHead>
            <TableHead className="text-xs text-muted-foreground">摘要</TableHead>
            <TableHead className="text-xs text-muted-foreground">匹配发票</TableHead>
            <TableHead className="text-right text-xs text-muted-foreground">状态</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              <TableCell className="text-sm text-muted-foreground tabular-nums">
                {row.date}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {row.account}
              </TableCell>
              <TableCell className="max-w-[180px] truncate text-sm font-medium text-foreground">
                {row.counterparty}
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums text-status-online">
                {row.income ?? '—'}
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums text-status-error">
                {row.expense ?? '—'}
              </TableCell>
              <TableCell className="max-w-[140px] truncate text-sm text-muted-foreground">
                {row.summary}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground tabular-nums">
                {row.matched}
              </TableCell>
              <TableCell className="text-right">
                <TaxStatusBadge tone={row.status.tone}>
                  {row.status.label}
                </TaxStatusBadge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
