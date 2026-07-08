import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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

export interface SalaryRow {
  name: string
  idNo: string
  phone: string
  gross: string
  social: string
  fund: string
  tax: string
  status: { tone: TaxStatusTone; label: string }
}

export function SalaryTable({
  rows,
  onEdit,
  className,
}: {
  rows: SalaryRow[]
  onEdit?: (row: SalaryRow) => void
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
            <TableHead className="text-xs text-muted-foreground">员工</TableHead>
            <TableHead className="text-xs text-muted-foreground">手机号</TableHead>
            <TableHead className="text-right text-xs text-muted-foreground">
              应发工资
            </TableHead>
            <TableHead className="text-right text-xs text-muted-foreground">
              个人社保
            </TableHead>
            <TableHead className="text-right text-xs text-muted-foreground">
              个人公积金
            </TableHead>
            <TableHead className="text-right text-xs text-muted-foreground">
              预计个税
            </TableHead>
            <TableHead className="text-xs text-muted-foreground">状态</TableHead>
            <TableHead className="text-right text-xs text-muted-foreground">
              操作
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.idNo}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="bg-secondary text-xs text-primary">
                      {row.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {row.name}
                    </span>
                    <span className="text-xs text-text-tertiary tabular-nums">
                      {row.idNo}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground tabular-nums">
                {row.phone}
              </TableCell>
              <TableCell className="text-right text-sm font-medium text-foreground tabular-nums">
                {row.gross}
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                {row.social}
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                {row.fund}
              </TableCell>
              <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                {row.tax}
              </TableCell>
              <TableCell>
                <TaxStatusBadge tone={row.status.tone}>
                  {row.status.label}
                </TaxStatusBadge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit?.(row)}
                >
                  编辑
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
