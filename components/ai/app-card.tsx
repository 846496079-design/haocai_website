import type * as React from 'react'
import { CheckIcon, StarIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface AppCardProps extends React.ComponentProps<'div'> {
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category?: string
  /** 评分 0-5 */
  rating?: number
  /** 安装量文案，如 "1.2k" */
  installs?: string
  installed?: boolean
  onInstall?: () => void
}

export function AppCard({
  name,
  description,
  icon: Icon,
  category,
  rating,
  installs,
  installed = false,
  onInstall,
  className,
  ...props
}: AppCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-card p-4',
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <Icon className="size-5" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {name}
          </h3>
          {category ? (
            <Badge variant="secondary" className="w-fit">
              {category}
            </Badge>
          ) : null}
        </div>
      </div>

      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {typeof rating === 'number' ? (
            <span className="flex items-center gap-1 tabular-nums">
              <StarIcon className="size-3.5 fill-status-warning text-status-warning" />
              {rating.toFixed(1)}
            </span>
          ) : null}
          {installs ? (
            <span className="tabular-nums">{installs} 安装</span>
          ) : null}
        </div>
        {installed ? (
          <Button variant="outline" size="sm" disabled>
            <CheckIcon data-icon="inline-start" />
            已安装
          </Button>
        ) : (
          <Button variant="default" size="sm" onClick={onInstall}>
            安装
          </Button>
        )}
      </div>
    </div>
  )
}
