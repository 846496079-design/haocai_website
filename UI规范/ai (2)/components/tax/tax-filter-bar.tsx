'use client'

import { useState } from 'react'
import { SearchIcon } from 'lucide-react'

import { Input } from '@/components/ui/input'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { cn } from '@/lib/utils'

export interface TaxFilterOption {
  value: string
  label: string
}

export interface TaxFilterSelect {
  id: string
  placeholder: string
  options: TaxFilterOption[]
  defaultValue?: string
}

export function TaxFilterBar({
  searchPlaceholder = '搜索…',
  selects = [],
  chips = [],
  defaultChip,
  className,
}: {
  searchPlaceholder?: string
  selects?: TaxFilterSelect[]
  chips?: TaxFilterOption[]
  defaultChip?: string
  className?: string
}) {
  const [activeChip, setActiveChip] = useState(
    defaultChip ?? chips[0]?.value ?? '',
  )

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3',
        className,
      )}
    >
      <div className="relative min-w-52 flex-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-tertiary" />
        <Input
          placeholder={searchPlaceholder}
          className="pl-9"
          aria-label="搜索"
        />
      </div>

      {selects.map((select) => (
        <NativeSelect
          key={select.id}
          id={select.id}
          defaultValue={select.defaultValue ?? ''}
          className="w-auto min-w-36"
        >
          <NativeSelectOption value="" disabled>
            {select.placeholder}
          </NativeSelectOption>
          {select.options.map((opt) => (
            <NativeSelectOption key={opt.value} value={opt.value}>
              {opt.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      ))}

      {chips.length > 0 ? (
        <div className="flex items-center gap-1.5">
          {chips.map((chip) => {
            const active = chip.value === activeChip
            return (
              <button
                key={chip.value}
                type="button"
                onClick={() => setActiveChip(chip.value)}
                className={cn(
                  'h-8 rounded-lg px-3 text-sm font-medium transition-colors',
                  active
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
              >
                {chip.label}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
