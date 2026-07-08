import { CheckCircle2Icon, ScanLineIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { TaxStatusBadge, type TaxStatusTone } from './tax-status-badge'

export interface OCRField {
  label: string
  value: string
  /** 单项识别置信状态 */
  tone?: TaxStatusTone
}

export function InvoiceOCRPanel({
  fileName = '电子发票_202606.pdf',
  confidence = '98.6%',
  fields,
  className,
}: {
  fileName?: string
  confidence?: string
  fields: OCRField[]
  className?: string
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {/* 左：发票预览占位 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm">
            <ScanLineIcon className="size-4 text-status-running" />
            <span className="font-medium text-foreground">{fileName}</span>
          </div>
          <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 text-text-tertiary">
            <ScanLineIcon className="size-8" />
            <span className="text-xs">发票影像预览</span>
          </div>
        </div>

        {/* 右：识别结果 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              AI 识别结果
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-tertiary">整体置信度</span>
              <TaxStatusBadge tone="success" withDot={false}>
                {confidence}
              </TaxStatusBadge>
            </div>
          </div>

          <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
            {fields.map((field) => (
              <div
                key={field.label}
                className="flex items-center justify-between gap-3 px-3.5 py-2.5"
              >
                <span className="text-xs text-muted-foreground">
                  {field.label}
                </span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-foreground tabular-nums">
                  {field.value}
                  {field.tone !== 'warning' && field.tone !== 'error' ? (
                    <CheckCircle2Icon className="size-4 text-status-online" />
                  ) : null}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button size="sm" className="flex-1">
              确认入账
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              重新识别
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
