'use client'

import * as React from 'react'
import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  WorkflowNode,
  type WorkflowNodeKind,
  type WorkflowNodeState,
} from './workflow-node'

export interface AutomationStep {
  id: string
  title: string
  kind: WorkflowNodeKind
  icon: React.ComponentType<{ className?: string }>
  subtitle?: string
  state?: WorkflowNodeState
}

export interface AutomationBuilderProps {
  title?: string
  steps: AutomationStep[]
  selectedId?: string
  onAddStep?: () => void
  className?: string
}

function Connector({ active }: { active?: boolean }) {
  return (
    <div className="flex h-px min-w-8 flex-1 items-center" aria-hidden>
      <div
        className={cn(
          'h-0.5 w-full rounded-full',
          active ? 'bg-primary' : 'bg-border',
        )}
      />
    </div>
  )
}

export function AutomationBuilder({
  title = '自动化流程',
  steps,
  selectedId,
  onAddStep,
  className,
}: AutomationBuilderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl border border-border bg-secondary/40 p-5',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <Button variant="outline" size="sm" onClick={onAddStep}>
          <PlusIcon data-icon="inline-start" />
          添加节点
        </Button>
      </div>

      <div className="flex items-center gap-0 overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1
          const nextRunning =
            !isLast && steps[index + 1]?.state === 'running'
          const done = step.state === 'success'
          return (
            <React.Fragment key={step.id}>
              <WorkflowNode
                title={step.title}
                kind={step.kind}
                icon={step.icon}
                subtitle={step.subtitle}
                state={step.state}
                hasInput={index !== 0}
                hasOutput={!isLast}
                selected={step.id === selectedId}
                className="shrink-0"
              />
              {!isLast ? <Connector active={done || nextRunning} /> : null}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
