import { Building2Icon, CheckIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { TaxStatusBadge, type TaxStatusTone } from './tax-status-badge'

export function CompanyCard({
  name,
  taxNo,
  taxpayerType,
  statusTone,
  statusLabel,
  active = false,
  onSelect,
}: {
  name: string
  taxNo: string
  taxpayerType: string
  statusTone: TaxStatusTone
  statusLabel: string
  active?: boolean
  onSelect?: () => void
}) {
  return (
    <Card
      className={cn(
        'flex-1 transition-shadow',
        active && 'ring-2 ring-primary',
      )}
    >
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-from to-brand-to text-primary-foreground">
              <Building2Icon className="size-5" />
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground">
                {name}
              </span>
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                {taxpayerType}
              </span>
            </div>
          </div>
          <TaxStatusBadge tone={statusTone}>{statusLabel}</TaxStatusBadge>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
          <span className="text-xs text-muted-foreground">税号</span>
          <span className="font-mono text-xs font-medium text-foreground">
            {taxNo}
          </span>
        </div>

        <Button
          variant={active ? 'secondary' : 'outline'}
          className="w-full"
          onClick={onSelect}
          disabled={active}
        >
          {active ? (
            <>
              <CheckIcon data-icon="inline-start" />
              当前企业
            </>
          ) : (
            '切换至此企业'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
