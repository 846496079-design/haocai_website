import type * as React from 'react'
import {
  DownloadIcon,
  FileIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  ImageIcon,
  MoreHorizontalIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type FileKind = 'document' | 'sheet' | 'image' | 'generic'

const kindConfig: Record<
  FileKind,
  { icon: React.ComponentType<{ className?: string }>; tint: string }
> = {
  document: { icon: FileTextIcon, tint: 'bg-secondary text-secondary-foreground' },
  sheet: { icon: FileSpreadsheetIcon, tint: 'bg-secondary text-secondary-foreground' },
  image: { icon: ImageIcon, tint: 'bg-secondary text-secondary-foreground' },
  generic: { icon: FileIcon, tint: 'bg-secondary text-secondary-foreground' },
}

export interface FileCardProps extends React.ComponentProps<'div'> {
  name: string
  kind?: FileKind
  /** 文件大小文案，如 "2.4 MB" */
  size?: string
  /** 元信息，如来源代理或时间 */
  meta?: string
}

export function FileCard({
  name,
  kind = 'generic',
  size,
  meta,
  className,
  ...props
}: FileCardProps) {
  const config = kindConfig[kind]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/40',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-lg',
          config.tint,
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium text-foreground">
          {name}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {size ? <span className="tabular-nums">{size}</span> : null}
          {size && meta ? (
            <span className="size-0.5 rounded-full bg-text-tertiary" aria-hidden />
          ) : null}
          {meta ? <span className="truncate">{meta}</span> : null}
        </span>
      </div>
      <div className="flex items-center gap-0.5">
        <Button variant="ghost" size="icon-sm" aria-label="下载">
          <DownloadIcon />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="更多操作">
          <MoreHorizontalIcon />
        </Button>
      </div>
    </div>
  )
}
