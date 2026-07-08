'use client'

import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export interface PluginCardProps {
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  category?: string
  version?: string
  defaultEnabled?: boolean
  enabled?: boolean
  onEnabledChange?: (enabled: boolean) => void
  className?: string
}

export function PluginCard({
  name,
  description,
  icon: Icon,
  category,
  version,
  defaultEnabled = false,
  enabled,
  onEnabledChange,
  className,
}: PluginCardProps) {
  const [internal, setInternal] = React.useState(defaultEnabled)
  const isOn = enabled ?? internal

  function handleChange(next: boolean) {
    setInternal(next)
    onEnabledChange?.(next)
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors',
        isOn ? 'border-primary/40' : 'border-border',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex size-10 items-center justify-center rounded-lg transition-colors',
              isOn
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground',
            )}
          >
            <Icon className="size-5" />
          </span>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">{name}</h3>
              {version ? (
                <span className="font-mono text-xs text-text-tertiary">
                  {version}
                </span>
              ) : null}
            </div>
            {category ? (
              <Badge variant="secondary" className="w-fit">
                {category}
              </Badge>
            ) : null}
          </div>
        </div>
        <Switch
          checked={isOn}
          onCheckedChange={handleChange}
          aria-label={`${isOn ? '停用' : '启用'} ${name}`}
        />
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
