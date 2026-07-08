import type * as React from 'react'
import { InboxIcon, type LucideIcon } from 'lucide-react'

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { cn } from '@/lib/utils'

export function TaxEmptyState({
  icon: Icon = InboxIcon,
  title = '暂无数据',
  description,
  actions,
  className,
}: {
  icon?: LucideIcon
  title?: string
  description?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <Empty className={cn('border border-dashed border-border', className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description ? (
          <EmptyDescription>{description}</EmptyDescription>
        ) : null}
      </EmptyHeader>
      {actions ? (
        <EmptyContent>
          <div className="flex items-center justify-center gap-2">{actions}</div>
        </EmptyContent>
      ) : null}
    </Empty>
  )
}
