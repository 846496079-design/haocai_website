import type * as React from 'react'
import {
  DownloadIcon,
  FileTextIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface TaxPreviewField {
  label: string
  value: string
}

export function TaxPreviewPanel({
  fileName,
  fileType = 'PDF',
  fields,
  footer,
  className,
}: {
  fileName: string
  fileType?: string
  fields: TaxPreviewField[]
  footer?: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="grid grid-cols-1 gap-0 p-0 md:grid-cols-2">
        {/* 影像预览区 */}
        <div className="flex flex-col border-b border-border bg-muted/30 md:border-r md:border-b-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <FileTextIcon className="size-4 shrink-0 text-status-running" />
              <span className="truncate text-sm font-medium text-foreground">
                {fileName}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" className="size-7" aria-label="缩小">
                <ZoomOutIcon className="size-4" />
              </Button>
              <Button size="icon" variant="ghost" className="size-7" aria-label="放大">
                <ZoomInIcon className="size-4" />
              </Button>
              <Button size="icon" variant="ghost" className="size-7" aria-label="下载">
                <DownloadIcon className="size-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="flex aspect-[3/4] w-44 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card text-text-tertiary">
              <FileTextIcon className="size-8" />
              <span className="text-xs">{fileType} 预览</span>
            </div>
          </div>
        </div>

        {/* 字段区 */}
        <div className="flex flex-col">
          <div className="border-b border-border px-4 py-2.5">
            <span className="text-sm font-medium text-foreground">
              识别字段
            </span>
          </div>
          <div className="flex flex-1 flex-col divide-y divide-border">
            {fields.map((field) => (
              <div
                key={field.label}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <span className="shrink-0 text-sm text-muted-foreground">
                  {field.label}
                </span>
                <span className="text-right text-sm font-medium text-foreground tabular-nums">
                  {field.value}
                </span>
              </div>
            ))}
          </div>
          {footer ? (
            <div className="border-t border-border px-4 py-3">{footer}</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
