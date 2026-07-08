import type * as React from 'react'

import { cn } from '@/lib/utils'

export function SectionHeader({
  index,
  title,
  description,
}: {
  index: string
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-secondary px-1.5 text-xs font-semibold text-secondary-foreground tabular-nums">
        {index}
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export function ShowcaseBlock({
  id,
  title,
  caption,
  children,
  className,
}: {
  id?: string
  title: string
  caption?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      id={id}
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-border bg-card p-5',
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {caption ? (
          <p className="text-xs text-muted-foreground">{caption}</p>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  )
}

export function Section({
  id,
  children,
}: {
  id: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="flex scroll-mt-24 flex-col gap-5">
      {children}
    </section>
  )
}
