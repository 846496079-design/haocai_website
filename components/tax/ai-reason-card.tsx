import { BrainCircuitIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { TaxStatusBadge, type TaxStatusTone } from './tax-status-badge'

export interface AIReasonStep {
  title: string
  detail: string
}

export function AIReasonCard({
  title = 'AI 推理过程',
  confidence = '高',
  confidenceTone = 'success',
  steps,
  conclusion,
  className,
}: {
  title?: string
  confidence?: string
  confidenceTone?: TaxStatusTone
  steps: AIReasonStep[]
  conclusion?: string
  className?: string
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-status-running/12 text-status-running">
              <BrainCircuitIcon className="size-4" />
            </span>
            <span className="text-sm font-semibold text-foreground">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-tertiary">置信度</span>
            <TaxStatusBadge tone={confidenceTone} withDot={false}>
              {confidence}
            </TaxStatusBadge>
          </div>
        </div>

        <ol className="flex flex-col gap-0">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary tabular-nums">
                  {i + 1}
                </span>
                {i < steps.length - 1 ? (
                  <span className="my-1 w-px flex-1 bg-border" />
                ) : null}
              </div>
              <div className="flex flex-col gap-0.5 pb-4 last:pb-0">
                <span className="text-sm font-medium text-foreground">
                  {step.title}
                </span>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  {step.detail}
                </span>
              </div>
            </li>
          ))}
        </ol>

        {conclusion ? (
          <div className="rounded-xl border border-status-running/20 bg-status-running/8 p-3.5">
            <p className="text-sm leading-relaxed text-foreground">
              <span className="font-medium">结论：</span>
              {conclusion}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
