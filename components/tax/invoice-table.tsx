'use client'

import { useState } from 'react'

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

export interface InvoiceRow {
  no: string
  date: string
  counterparty: string
  /** 销项 / 进项 / 费用 */
  type: '销项' | '进项' | '费用'
  amount: string
  tax: string
  certify: { tone: TaxStatusTone; label: string }
  booking: { tone: TaxStatusTone; label: string }
}

const FILTERS = ['全部', '销项', '进项', '费用', '异常'] as const

export function InvoiceTable({
  rows,
  className,
}: {
  rows: InvoiceRow[]
  className?: string
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('全部')

  const filtered = rows.filter((row) => {
    if (filter === '全部') return true
    if (filter === '异常') return row.certify.tone === 'error' || row.booking.tone === 'error'
    return row.type === filter
  })

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* 筛选标签 */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cn(
              'h-8 rounded-lg px-3 text-sm font-medium transition-colors',
              filter === item
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-secondary hover:text-primary',
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="text-xs text-muted-foreground">发票号码</TableHead>
              <TableHead className="text-xs text-muted-foreground">开票日期</TableHead>
              <TableHead className="text-xs text-muted-foreground">往来方</TableHead>
              <TableHead className="text-xs text-muted-foreground">类型</TableHead>
              <TableHead className="text-right text-xs text-muted-foreground">金额</TableHead>
              <TableHead className="text-right text-xs text-muted-foreground">税额</TableHead>
              <TableHead className="text-xs text-muted-foreground">认证状态</TableHead>
              <TableHead className="text-right text-xs text-muted-foreground">入账状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.no}>
                <TableCell className="text-sm font-medium text-foreground tabular-nums">
                  {row.no}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground tabular-nums">
                  {row.date}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                  {row.counterparty}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {row.type}
                </TableCell>
                <TableCell className="text-right text-sm font-medium text-foreground tabular-nums">
                  {row.amount}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                  {row.tax}
                </TableCell>
                <TableCell>
                  <TaxStatusBadge tone={row.certify.tone}>
                    {row.certify.label}
                  </TaxStatusBadge>
                </TableCell>
                <TableCell className="text-right">
                  <TaxStatusBadge tone={row.booking.tone}>
                    {row.booking.label}
                  </TaxStatusBadge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
