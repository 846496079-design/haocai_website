'use client'

import * as React from 'react'
import {
  ArrowUpIcon,
  AtSignIcon,
  GlobeIcon,
  PaperclipIcon,
  SquareIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { ModelSwitcher, type ModelOption } from './model-switcher'

export interface AiPromptInputProps {
  models: ModelOption[]
  placeholder?: string
  maxChars?: number
  /** 是否处于生成中（显示停止按钮） */
  generating?: boolean
  onSend?: (value: string) => void
  onStop?: () => void
  className?: string
}

export function AiPromptInput({
  models,
  placeholder = '向代理描述任务，或输入 / 调用技能…',
  maxChars = 4000,
  generating = false,
  onSend,
  onStop,
  className,
}: AiPromptInputProps) {
  const [value, setValue] = React.useState('')
  const count = value.length
  const overLimit = count > maxChars

  function handleSubmit() {
    if (!value.trim() || overLimit) return
    onSend?.(value)
    setValue('')
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30',
        className,
      )}
    >
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            handleSubmit()
          }
        }}
        rows={3}
        placeholder={placeholder}
        className="w-full resize-none bg-transparent px-1 text-sm leading-relaxed text-foreground outline-none placeholder:text-text-tertiary"
      />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <ModelSwitcher models={models} />
          <Separator orientation="vertical" className="mx-1 h-5" />
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="添加附件">
                  <PaperclipIcon />
                </Button>
              }
            />
            <TooltipContent>添加附件</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="引用代理">
                  <AtSignIcon />
                </Button>
              }
            />
            <TooltipContent>引用代理 / 知识库</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="联网检索">
                  <GlobeIcon />
                </Button>
              }
            />
            <TooltipContent>联网检索</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={cn(
              'text-xs tabular-nums text-text-tertiary',
              overLimit && 'text-status-error',
            )}
          >
            {count}/{maxChars}
          </span>
          {generating ? (
            <Button variant="outline" size="icon" onClick={onStop} aria-label="停止生成">
              <SquareIcon />
            </Button>
          ) : (
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={!value.trim() || overLimit}
              aria-label="发送"
            >
              <ArrowUpIcon />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
