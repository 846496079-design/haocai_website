import { CheckIcon, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export type TaxStepState = 'done' | 'active' | 'todo'

export type TaxStep = {
  title: string
  description: string
  icon: LucideIcon
  state: TaxStepState
}

export function TaxStepFlow({
  steps,
  className,
}: {
  steps: TaxStep[]
  className?: string
}) {
  return (
    <ol className={cn('flex items-stretch gap-3', className)}>
      {steps.map((step, i) => {
        const Icon = step.icon
        const isDone = step.state === 'done'
        const isActive = step.state === 'active'
        return (
          <li key={i} className="flex flex-1 items-center gap-3">
            <div
              className={cn(
                'flex flex-1 items-start gap-3 rounded-xl border p-4 transition-colors',
                isActive
                  ? 'border-primary/40 bg-secondary'
                  : 'border-border bg-card',
              )}
            >
              <div
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-lg',
                  isDone && 'bg-status-online/12 text-status-online',
                  isActive && 'bg-primary text-primary-foreground',
                  step.state === 'todo' && 'bg-muted text-text-tertiary',
                )}
              >
                {isDone ? (
                  <CheckIcon className="size-4.5" />
                ) : (
                  <Icon className="size-4.5" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-text-tertiary tabular-nums">
                    {`0${i + 1}`}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {step.title}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
            {i < steps.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  'h-px w-6 shrink-0',
                  isDone ? 'bg-status-online/40' : 'bg-border',
                )}
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
