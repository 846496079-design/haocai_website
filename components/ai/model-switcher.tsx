'use client'

import * as React from 'react'
import { CheckIcon, ChevronsUpDownIcon, SparklesIcon, ZapIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export interface ModelOption {
  id: string
  name: string
  vendor: string
  /** 速度档位，用于展示标签 */
  tier?: 'fast' | 'balanced' | 'powerful'
  description?: string
}

const tierConfig: Record<
  NonNullable<ModelOption['tier']>,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  fast: { label: '极速', icon: ZapIcon },
  balanced: { label: '均衡', icon: SparklesIcon },
  powerful: { label: '强力', icon: SparklesIcon },
}

export interface ModelSwitcherProps {
  models: ModelOption[]
  value?: string
  onValueChange?: (id: string) => void
  className?: string
}

export function ModelSwitcher({
  models,
  value,
  onValueChange,
  className,
}: ModelSwitcherProps) {
  const [internal, setInternal] = React.useState(value ?? models[0]?.id)
  const selectedId = value ?? internal
  const selected = models.find((m) => m.id === selectedId) ?? models[0]

  function handleSelect(id: string) {
    setInternal(id)
    onValueChange?.(id)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className={cn('h-9 justify-between gap-2 font-medium', className)}
          >
            <span className="flex items-center gap-2">
              <SparklesIcon data-icon="inline-start" />
              <span className="truncate">{selected?.name}</span>
            </span>
            <ChevronsUpDownIcon data-icon="inline-end" className="opacity-60" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel>选择推理模型</DropdownMenuLabel>
        <DropdownMenuGroup>
          {models.map((model) => {
            const Tier = model.tier ? tierConfig[model.tier].icon : null
            const isActive = model.id === selectedId
            return (
              <DropdownMenuItem
                key={model.id}
                onClick={() => handleSelect(model.id)}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                  {Tier ? <Tier className="size-4" /> : <SparklesIcon className="size-4" />}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {model.name}
                    </span>
                    {model.tier ? (
                      <Badge variant="secondary" className="shrink-0">
                        {tierConfig[model.tier].label}
                      </Badge>
                    ) : null}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {model.vendor}
                    {model.description ? ` · ${model.description}` : ''}
                  </span>
                </span>
                {isActive ? (
                  <CheckIcon className="mt-1 size-4 shrink-0 text-primary" />
                ) : null}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
