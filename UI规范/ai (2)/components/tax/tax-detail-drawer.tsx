'use client'

import type * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

import { TaxStatusBadge, type TaxStatusTone } from './tax-status-badge'

export interface TaxDetailItem {
  label: string
  value: string
}

export interface TaxDetailGroup {
  legend: string
  items: TaxDetailItem[]
}

export function TaxDetailDrawer({
  trigger,
  title,
  description,
  status,
  groups,
  footer,
}: {
  trigger: React.ReactNode
  title: string
  description?: string
  status?: { tone: TaxStatusTone; label: string }
  groups: TaxDetailGroup[]
  footer?: React.ReactNode
}) {
  return (
    <Drawer direction="right">
      <DrawerTrigger render={trigger as React.ReactElement} />
      <DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-md">
        <DrawerHeader>
          <div className="flex items-center gap-2.5">
            <DrawerTitle>{title}</DrawerTitle>
            {status ? (
              <TaxStatusBadge tone={status.tone}>{status.label}</TaxStatusBadge>
            ) : null}
          </div>
          {description ? (
            <DrawerDescription>{description}</DrawerDescription>
          ) : null}
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <div className="flex flex-col gap-5">
            {groups.map((group) => (
              <div key={group.legend} className="flex flex-col gap-2.5">
                <span className="text-xs font-medium tracking-wide text-text-tertiary uppercase">
                  {group.legend}
                </span>
                <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-3.5">
                  {group.items.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start justify-between gap-4"
                    >
                      <span className="shrink-0 text-sm text-muted-foreground">
                        {item.label}
                      </span>
                      <span className="text-right text-sm font-medium text-foreground tabular-nums">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DrawerFooter className="flex-row justify-end gap-2">
          {footer ?? (
            <DrawerClose render={<Button variant="outline">关闭</Button>} />
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
