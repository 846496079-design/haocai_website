'use client'

import type * as React from 'react'
import { CloudUploadIcon, FileTextIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function TaxUploadDialog({
  trigger,
  title = '上传发票 / 流水',
  description = '支持批量上传，AI 将自动识别并归类。',
  formats = 'PDF、JPG、PNG、OFD、Excel',
  maxSize = '单个文件 ≤ 20MB',
  sampleFiles = [],
}: {
  trigger: React.ReactNode
  title?: string
  description?: string
  formats?: string
  maxSize?: string
  sampleFiles?: string[]
}) {
  return (
    <Dialog>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-colors hover:border-primary/40 hover:bg-secondary/40">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
              <CloudUploadIcon className="size-6" />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-foreground">
                点击或拖拽文件到此处上传
              </p>
              <p className="text-xs text-muted-foreground">
                支持格式：{formats}
              </p>
              <p className="text-xs text-text-tertiary">{maxSize}</p>
            </div>
            <Button size="sm" variant="outline">
              选择文件
            </Button>
          </div>

          {sampleFiles.length > 0 ? (
            <div className="flex flex-col gap-2">
              {sampleFiles.map((file) => (
                <div
                  key={file}
                  className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2"
                >
                  <FileTextIcon className="size-4 shrink-0 text-status-running" />
                  <span className="truncate text-sm text-foreground">
                    {file}
                  </span>
                  <span className="ml-auto text-xs text-status-online">
                    已就绪
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline">取消</Button>} />
          <Button>开始上传</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
