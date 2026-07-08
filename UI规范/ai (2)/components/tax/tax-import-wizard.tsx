'use client'

import { useState } from 'react'
import { CheckIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface TaxImportStep {
  title: string
  description: string
  /** 当前步骤的主体内容 */
  content: React.ReactNode
}

export function TaxImportWizard({
  steps,
  className,
}: {
  steps: TaxImportStep[]
  className?: string
}) {
  const [current, setCurrent] = useState(0)
  const isLast = current === steps.length - 1

  return (
    <Card className={className}>
      <CardContent className="flex flex-col gap-5">
        {/* 步骤指示器 */}
        <div className="flex items-center">
          {steps.map((step, i) => {
            const done = i < current
            const active = i === current
            return (
              <div key={step.title} className="flex flex-1 items-center last:flex-none">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors',
                      done && 'bg-status-online/15 text-status-online',
                      active && 'bg-primary text-primary-foreground',
                      !done && !active && 'bg-muted text-text-tertiary',
                    )}
                  >
                    {done ? <CheckIcon className="size-3.5" /> : i + 1}
                  </span>
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        'text-sm font-medium whitespace-nowrap',
                        active || done
                          ? 'text-foreground'
                          : 'text-text-tertiary',
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                </div>
                {i < steps.length - 1 ? (
                  <span
                    className={cn(
                      'mx-3 h-px flex-1',
                      done ? 'bg-status-online' : 'bg-border',
                    )}
                  />
                ) : null}
              </div>
            )
          })}
        </div>

        {/* 当前步骤内容 */}
        <div className="rounded-xl border border-border bg-muted/30 p-5">
          <div className="mb-3 flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">
              {steps[current].title}
            </span>
            <span className="text-xs text-muted-foreground">
              {steps[current].description}
            </span>
          </div>
          {steps[current].content}
        </div>

        {/* 操作 */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-tertiary tabular-nums">
            第 {current + 1} / {steps.length} 步
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={current === 0}
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            >
              上一步
            </Button>
            <Button
              size="sm"
              onClick={() =>
                setCurrent((c) => Math.min(steps.length - 1, c + 1))
              }
            >
              {isLast ? '完成导入' : '下一步'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
