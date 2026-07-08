'use client'

import * as React from 'react'
import {
   CheckCircle2Icon,
  ChevronDownIcon,
  LoaderIcon,
  SparklesIcon,
} from 'lucide-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

export type ThoughtState = 'done' | 'active' | 'pending'

export interface Thought {
  id: string
  /** 步骤标题，如"检索知识库" */
  title: string
  /** 该步骤的推理细节 */
  detail?: string
  state?: ThoughtState
}

export interface ThinkingPanelProps {
  /** 面板标题 */
  title?: string
  thoughts: Thought[]
  /** 是否正在思考（标题图标旋转） */
  thinking?: boolean
  /** 默认是否展开 */
  defaultOpen?: boolean
  className?: string
}

const stateIcon: Record<ThoughtState, React.ComponentType<{ className?: string }>> =
  {
    done: CheckCircle2Icon,
    active: LoaderIcon,
    pending: CheckCircle2Icon,
  }

const stateColor: Record<ThoughtState, string> = {
  done: 'text-status-online',
  active: 'text-status-running',
  pending: 'text-text-tertiary',
}

export function ThinkingPanel({
  title = '推理过程',
  thoughts,
  thinking = false,
  defaultOpen = true,
  className,
}: ThinkingPanelProps) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className={cn(
        'flex flex-col rounded-xl border border-border bg-secondary/40',
        className,
      )}
    >
      <CollapsibleTrigger className="group flex items-center justify-between gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-secondary/70">
        <span className="flex items-center gap-2">
          <SparklesIcon
            className={cn(
              'size-4 text-primary',
              thinking && 'animate-pulse',
            )}
          />
          {title}
          <span className="text-xs font-normal text-muted-foreground tabular-nums">
            {thoughts.length} 步
          </span>
        </span>
        <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-data-[panel-open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden">
        <div className="flex flex-col gap-3 px-4 pb-4 pt-1">
          {thoughts.map((thought, index) => {
            const state = thought.state ?? 'pending'
            const Icon = stateIcon[state]
            const isLast = index === thoughts.length - 1

            return (
              <div key={thought.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <Icon
                    className={cn(
                      'size-4 shrink-0',
                      stateColor[state],
                      state === 'active' && 'animate-spin',
                    )}
                  />
                  {!isLast ? (
                    <span className="mt-1 w-px flex-1 bg-border" aria-hidden />
                  ) : null}
                </div>
                <div className="flex flex-col gap-0.5 pb-1">
                  <span className="text-sm font-medium text-foreground">
                    {thought.title}
                  </span>
                  {thought.detail ? (
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {thought.detail}
                    </span>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
