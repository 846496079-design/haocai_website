import {
  FileTextIcon,
  LoaderIcon,
  ReceiptTextIcon,
  WalletIcon,
  type LucideIcon,
} from 'lucide-react'

import { ChatBubble } from '@/components/ai/chat-bubble'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { TaxStatusBadge } from './tax-status-badge'

export interface AICitation {
  label: string
  source: string
  icon?: LucideIcon
}

export function AITaxChat({ className }: { className?: string }) {
  const citations: AICitation[] = [
    { label: '销项发票 INV-202606-001', source: '¥86,000', icon: ReceiptTextIcon },
    { label: '银行流水 06-12 收款', source: '¥86,000', icon: WalletIcon },
  ]

  return (
    <div
      className={cn(
        'flex h-[560px] flex-col overflow-hidden rounded-xl border border-border bg-card',
        className,
      )}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-status-online" />
          <span className="text-sm font-medium text-foreground">AI 财税助手</span>
        </div>
        <TaxStatusBadge tone="success" withDot={false}>
          置信度 高
        </TaxStatusBadge>
      </div>

      {/* 消息区 */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <ChatBubble role="user" author="我" timestamp="10:24">
          本期增值税应该交多少？帮我核对一下销项数据。
        </ChatBubble>

        {/* AI 思考过程 */}
        <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          <LoaderIcon className="size-3.5 animate-spin text-status-running" />
          正在核对 24 张销项发票与银行流水匹配关系…
        </div>

        <ChatBubble
          role="agent"
          author="好财 AI"
          timestamp="10:24"
          footer={
            <div className="flex flex-wrap gap-1.5">
              <Button size="xs" variant="outline">
                去处理异常发票
              </Button>
              <Button size="xs" variant="outline">
                生成申报表
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-2.5">
            <p>
              本期销项税额合计 <strong>¥15,480</strong>，进项可抵扣
              <strong> ¥9,360</strong>，预计应缴增值税
              <strong className="text-status-running"> ¥6,120</strong>。其中 1 张费用票存在异常，建议优先处理。
            </p>
            {/* 数据引用 */}
            <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/40 p-2.5">
              <span className="text-xs font-medium text-muted-foreground">
                数据来源
              </span>
              {citations.map((cite) => {
                const Icon = cite.icon ?? FileTextIcon
                return (
                  <div
                    key={cite.label}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="flex items-center gap-1.5 text-foreground">
                      <Icon className="size-3.5 text-status-running" />
                      {cite.label}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {cite.source}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </ChatBubble>
      </div>

      {/* 输入区 */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2.5">
          <input
            type="text"
            placeholder="向 AI 提问财税问题，或让它帮你核对数据…"
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-text-tertiary"
          />
          <Button size="sm">发送</Button>
        </div>
      </div>
    </div>
  )
}
