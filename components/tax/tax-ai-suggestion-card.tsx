import { SparklesIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { TaxStatusBadge, type TaxStatusTone } from './tax-status-badge'

export interface TaxAISuggestion {
  /** 风险 / 建议 / 提示 */
  category: string
  categoryTone?: TaxStatusTone
  title: string
  detail: string
  /** 下一步操作文案 */
  action?: string
}

export function TaxAISuggestionCard({
  confidence = '高',
  confidenceTone = 'success',
  suggestions,
  className,
}: {
  confidence?: string
  confidenceTone?: TaxStatusTone
  suggestions: TaxAISuggestion[]
  className?: string
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-status-running/12 text-status-running">
              <SparklesIcon className="size-4" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                AI 核对建议
              </span>
              <span className="text-xs text-muted-foreground">
                基于本期票据、流水与工资数据生成
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-tertiary">置信度</span>
            <TaxStatusBadge tone={confidenceTone} withDot={false}>
              {confidence}
            </TaxStatusBadge>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          {suggestions.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-2 rounded-xl border border-border bg-muted/40 p-3.5"
            >
              <div className="flex items-center gap-2">
                <TaxStatusBadge
                  tone={item.categoryTone ?? 'processing'}
                  withDot={false}
                >
                  {item.category}
                </TaxStatusBadge>
                <span className="text-sm font-medium text-foreground">
                  {item.title}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {item.detail}
              </p>
              {item.action ? (
                <div>
                  <Button size="xs" variant="outline">
                    {item.action}
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
