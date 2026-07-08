import { SparklesIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export function AIQuickQuestion({
  title = '猜你想问',
  questions,
  className,
}: {
  title?: string
  questions: string[]
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {title ? (
        <div className="flex items-center gap-1.5">
          <SparklesIcon className="size-4 text-status-running" />
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {questions.map((q) => (
          <button
            key={q}
            type="button"
            className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-secondary/50 hover:text-foreground"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
