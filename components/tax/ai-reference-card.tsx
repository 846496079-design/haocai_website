import {
  ExternalLinkIcon,
  FileTextIcon,
  type LucideIcon,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface AIReference {
  /** 引用类型，如 政策 / 票据 / 流水 */
  type: string
  title: string
  source?: string
  icon?: LucideIcon
}

export function AIReferenceCard({
  title = '引用依据',
  references,
  className,
}: {
  title?: string
  references: AIReference[]
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm font-normal text-muted-foreground tabular-nums">
            {references.length} 条
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {references.map((ref) => {
          const Icon = ref.icon ?? FileTextIcon
          return (
            <a
              key={ref.title}
              href="#"
              className={cn(
                'group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/40 hover:bg-muted/40',
              )}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                <Icon className="size-4.5" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {ref.type}
                  </span>
                  <span className="truncate text-sm font-medium text-foreground">
                    {ref.title}
                  </span>
                </div>
                {ref.source ? (
                  <span className="truncate text-xs text-muted-foreground">
                    {ref.source}
                  </span>
                ) : null}
              </div>
              <ExternalLinkIcon className="size-4 shrink-0 text-text-tertiary transition-colors group-hover:text-primary" />
            </a>
          )
        })}
      </CardContent>
    </Card>
  )
}
