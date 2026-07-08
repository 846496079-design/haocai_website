'use client'

import * as React from 'react'
import {
  AudioLinesIcon,
  BoxesIcon,
  ChevronDownIcon,
  CloudIcon,
  FishIcon,
  GiftIcon,
  HomeIcon,
  LayoutGridIcon,
  MoreHorizontalIcon,
  PlusIcon,
  RocketIcon,
  UsersRoundIcon,
  WorkflowIcon,
  MonitorIcon,
} from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AiPromptInput } from '@/components/ai/ai-prompt-input'
import { AgentChip } from '@/components/ai/agent-chip'
import { SectionHeader } from '@/components/workbench/showcase'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { icon: HomeIcon, label: '首页', active: true },
  { icon: AudioLinesIcon, label: '录音与纪要' },
  { icon: UsersRoundIcon, label: '数字员工' },
  { icon: FishIcon, label: '超级龙虾' },
  { icon: BoxesIcon, label: '技能库' },
  { icon: LayoutGridIcon, label: '应用广场' },
  { icon: WorkflowIcon, label: '自动化' },
  { icon: CloudIcon, label: '云盘' },
]

const AGENTS = [
  { name: '数据分析专家' },
  { name: '数据分析专家' },
  { name: '数据分析' },
  { name: '数据分析专家' },
  { name: '数据分析' },
]

const TOOLS = Array.from({ length: 6 }, (_, i) => ({ id: i, name: '飞书' }))

function Sidebar() {
  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-border bg-card">
      {/* 品牌 */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-secondary">
          <span className="size-5 rounded-md bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))]" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-semibold text-foreground">
            好财集团
          </span>
          <span className="text-[11px] tracking-wide text-text-tertiary">
            HAO CAI GROUP
          </span>
        </div>
      </div>

      {/* 主导航 */}
      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.label}
            href="#homepage-demo"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              item.active
                ? 'bg-secondary text-secondary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <item.icon className="size-[18px]" />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <Separator className="mx-6 my-4 w-auto" />

      {/* 工作空间 */}
      <div className="flex flex-col gap-1 px-3">
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-xs font-semibold text-muted-foreground">
            工作空间
          </span>
          <Button variant="ghost" size="icon-sm" aria-label="新建工作空间">
            <PlusIcon />
          </Button>
        </div>
        <a
          href="#homepage-demo"
          className="flex items-center gap-3 rounded-lg bg-secondary px-3 py-2.5 text-sm font-medium text-secondary-foreground"
        >
          <MonitorIcon className="size-[18px]" />
          <span>我的</span>
        </a>
        <a
          href="#homepage-demo"
          className="rounded-lg px-3 py-2 pl-11 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          未命名项目
        </a>
        <a
          href="#homepage-demo"
          className="rounded-lg px-3 py-2 pl-11 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          未命名项目
        </a>
      </div>

      {/* 底部用户 */}
      <div className="mt-auto flex items-center gap-3 border-t border-border px-6 py-4">
        <Avatar className="size-9 rounded-lg">
          <AvatarFallback className="rounded-lg bg-secondary text-secondary-foreground">
            管
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-medium text-foreground">管理员</span>
          <span className="text-xs text-text-tertiary">超级管理员</span>
        </div>
      </div>
    </aside>
  )
}

function Topbar() {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" className="h-9 gap-2 font-medium">
          <LayoutGridIcon data-icon="inline-start" className="opacity-70" />
          <span>工作空间 / 我的</span>
          <ChevronDownIcon data-icon="inline-end" className="opacity-60" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="更多操作">
          <MoreHorizontalIcon />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" className="h-9 gap-2 text-muted-foreground">
          <GiftIcon data-icon="inline-start" className="text-primary" />
          获取免费积分
        </Button>
        <div className="flex h-9 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm">
          <RocketIcon className="size-4 text-primary" />
          <span className="font-semibold tabular-nums text-foreground">
            1,200
          </span>
          <Separator orientation="vertical" className="h-4" />
          <span className="font-medium text-primary">充值</span>
        </div>
        <Button className="h-9 rounded-full px-5 font-semibold">升级</Button>
      </div>
    </header>
  )
}

export function HomepageDemo() {
  return (
    <Section>
      <SectionHeader
        index="08"
        title="完整页面 · 好财集团 AI 工作空间首页"
        description="1440 × 1024 画布、左栏 260px，由组件库拼装：AiPromptInput、AgentChip、Button、Badge、Avatar、Separator 等。"
      />

      <div className="overflow-x-auto rounded-xl border border-border bg-card p-4">
        {/* 1440 × 1024 画布 */}
        <div className="mx-auto flex h-[1024px] w-[1440px] overflow-hidden rounded-lg border border-border bg-background">
          <Sidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />

            {/* 主内容 */}
            <div className="relative flex flex-1 flex-col overflow-hidden">
              {/* 顶部柔光背景 */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
                style={{
                  background:
                    'radial-gradient(60% 100% at 50% 0%, color-mix(in oklch, var(--primary) 12%, transparent), transparent 70%)',
                }}
              />

              <div className="relative mx-auto flex w-full max-w-[1021px] flex-1 flex-col pt-[132px]">
                {/* Hero 标题 648 × 122 */}
                <div className="mx-auto flex w-[648px] max-w-full flex-col items-center gap-3 text-center">
                  <p className="text-xl font-semibold text-foreground">
                    你的专属 <span className="text-primary">AI 团队</span> 已就绪
                  </p>
                  <h1 className="text-[44px] font-bold leading-tight tracking-tight text-balance text-foreground">
                    今天需要我帮你做些什么？
                  </h1>
                </div>

                {/* 代理行 */}
                <div className="mt-12 flex flex-nowrap items-stretch gap-3">
                  {AGENTS.map((agent, i) => (
                    <div
                      key={i}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary">
                        <span className="size-4 rounded-full bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] opacity-80" />
                      </span>
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="truncate text-sm font-semibold text-foreground">
                          {agent.name}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-text-tertiary">
                          <span className="size-1.5 rounded-full bg-status-online" />
                          在线
                        </span>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    aria-label="添加代理"
                    className="flex size-[68px] shrink-0 items-center justify-center rounded-2xl border border-dashed border-border bg-card text-text-tertiary transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    <PlusIcon className="size-5" />
                  </button>
                </div>

                {/* 智能输入框（复用 AiPromptInput） */}
                <div className="mt-8">
                  <AiPromptInput
                    models={[
                      {
                        id: 'pro',
                        name: '好财AI Pro',
                        vendor: '好财集团',
                        tier: 'powerful',
                        description: '企业级多代理协作模型',
                      },
                      {
                        id: 'lite',
                        name: '好财AI Lite',
                        vendor: '好财集团',
                        tier: 'fast',
                        description: '轻量极速响应',
                      },
                    ]}
                    placeholder="请输入您的需求，或上传文件，好财AI将为您解决问题。"
                  />
                  <p className="mt-2 px-1 text-xs text-text-tertiary">
                    Enter 发送；Shift + Enter 换行
                  </p>
                </div>

                {/* 连接你的工具 */}
                <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-6">
                  <h2 className="text-sm font-semibold text-foreground">
                    连接你的工具
                  </h2>
                  <div className="flex flex-nowrap gap-3">
                    {TOOLS.map((tool) => (
                      <div
                        key={tool.id}
                        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                          <span className="size-4 rounded-md bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] opacity-80" />
                        </span>
                        <div className="flex min-w-0 flex-col gap-1">
                          <span className="truncate text-sm font-semibold text-foreground">
                            {tool.name}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-text-tertiary">
                            <span className="size-1.5 rounded-full bg-status-online" />
                            已连接
                          </span>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      aria-label="连接更多工具"
                      className="flex w-[60px] shrink-0 items-center justify-center rounded-xl border border-dashed border-border bg-card text-text-tertiary transition-colors hover:border-primary/50 hover:text-primary"
                    >
                      <PlusIcon className="size-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1" />

                {/* 隐藏的可访问性引用，保留 AgentChip / Badge 复用 */}
                <div className="sr-only">
                  <AgentChip name="数据分析专家" status="online" />
                  <Badge variant="secondary">已就绪</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <section
      id="homepage-demo"
      className="flex scroll-mt-24 flex-col gap-5"
    >
      {children}
    </section>
  )
}
