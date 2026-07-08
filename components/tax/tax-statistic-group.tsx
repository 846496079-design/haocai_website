import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import { TaxStatCard } from './tax-stat-card'
import type { TaxStatusTone } from './tax-status-badge'

export interface TaxStatistic {
  label: string
  value: string
  unit?: string
  icon: LucideIcon
  tone?: TaxStatusTone
  trend?: { value: string; direction: 'up' | 'down'; positive?: boolean }
  hint?: string
}

export function TaxStatisticGroup({
  items,
  columns = 4,
  className,
}: {
  items: TaxStatistic[]
  columns?: 2 | 3 | 4
  className?: string
}) {
  const colClass = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  }[columns]

  return (
    <div className={cn('grid grid-cols-1 gap-4', colClass, className)}>
      {items.map((item) => (
        <TaxStatCard key={item.label} {...item} />
      ))}
    </div>
  )
}
