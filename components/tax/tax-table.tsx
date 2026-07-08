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

export type TaxTableColumn = {
  key: string
  header: string
  align?: 'left' | 'right'
  numeric?: boolean
}

export type TaxTableRow = {
  cells: Record<string, string>
  status: { tone: TaxStatusTone; label: string }
}

export function TaxTable({
  columns,
  rows,
  statusHeader = '状态',
  className,
}: {
  columns: TaxTableColumn[]
  rows: TaxTableRow[]
  statusHeader?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border',
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  'text-xs text-muted-foreground',
                  col.align === 'right' && 'text-right',
                )}
              >
                {col.header}
              </TableHead>
            ))}
            <TableHead className="text-right text-xs text-muted-foreground">
              {statusHeader}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={cn(
                    'text-sm',
                    col.numeric && 'tabular-nums',
                    col.align === 'right' && 'text-right',
                    col.key === columns[0].key
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {row.cells[col.key]}
                </TableCell>
              ))}
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
