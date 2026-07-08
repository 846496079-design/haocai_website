'use client'

import { useState } from 'react'
import { DirectionProvider } from '@base-ui/react/direction-provider'
import { format } from 'date-fns'
import {
  ActivityIcon,
  BotIcon,
  CalendarIcon,
  CheckCircle2Icon,
  LayoutGridIcon,
  SettingsIcon,
  ShieldCheckIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Section, SectionHeader, ShowcaseBlock } from './showcase'

const RUN_LOGS = [
  '12:04:21  代理已启动，加载系统提示词',
  '12:04:22  连接企业知识库 (3,201 文档)',
  '12:04:25  收到查询：本月异常工单趋势',
  '12:04:26  检索相关文档 8 篇',
  '12:04:29  生成处置建议草稿',
  '12:04:30  等待人工复核',
  '12:04:48  复核通过，执行工单创建',
  '12:04:49  任务完成，耗时 28s',
]

const SIDEBAR_ITEMS = [
  { icon: LayoutGridIcon, label: '工作台', active: true },
  { icon: BotIcon, label: '代理管理', active: false },
  { icon: ActivityIcon, label: '运行监控', active: false },
  { icon: ShieldCheckIcon, label: '安全治理', active: false },
  { icon: SettingsIcon, label: '设置', active: false },
]

export function LayoutGallery() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [rtl, setRtl] = useState(false)

  return (
    <>
      {/* Tabs */}
      <Section id="tabs">
        <SectionHeader
          index="36"
          title="Tabs 标签页"
          description="在有限空间内组织代理的多个视图，如概览、日志与配置，支持默认与下划线两种样式。"
        />
        <ShowcaseBlock title="代理详情标签页" caption="切换不同视图">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">概览</TabsTrigger>
              <TabsTrigger value="logs">运行日志</TabsTrigger>
              <TabsTrigger value="config">配置</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="pt-4">
              <p className="text-sm text-muted-foreground">
                运维巡检代理已稳定运行 142 天，今日处理 1,284 次请求，平均响应 1.2s。
              </p>
            </TabsContent>
            <TabsContent value="logs" className="pt-4">
              <p className="text-sm text-muted-foreground">
                最近一次运行于 12:04 完成，全部步骤执行成功。
              </p>
            </TabsContent>
            <TabsContent value="config" className="pt-4">
              <p className="text-sm text-muted-foreground">
                基础模型 GPT-4o，Temperature 0.7，已启用审计日志。
              </p>
            </TabsContent>
          </Tabs>
        </ShowcaseBlock>
      </Section>

      {/* Resizable / Scroll Area */}
      <Section id="resizable">
        <SectionHeader
          index="37"
          title="Resizable · Scroll Area"
          description="可拖拽调整的分栏布局与自定义滚动区域，用于编排画布与日志面板等分屏工作区。"
        />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ShowcaseBlock title="Resizable 分栏" caption="拖拽中间手柄调整比例">
            <ResizablePanelGroup
              direction="horizontal"
              className="h-48 rounded-lg border"
            >
              <ResizablePanel defaultSize={55}>
                <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
                  编排画布
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={45}>
                <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
                  属性面板
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ShowcaseBlock>
          <ShowcaseBlock title="Scroll Area 滚动区" caption="实时运行日志">
            <ScrollArea className="h-48 rounded-lg border p-3">
              <div className="flex flex-col gap-2 font-mono text-xs text-muted-foreground">
                {RUN_LOGS.map((line) => (
                  <p key={line}>{line}</p>
                ))}
                {RUN_LOGS.map((line) => (
                  <p key={`${line}-2`}>{line}</p>
                ))}
              </div>
            </ScrollArea>
          </ShowcaseBlock>
        </div>
      </Section>

      {/* Sidebar */}
      <Section id="sidebar">
        <SectionHeader
          index="38"
          title="Sidebar 侧边栏"
          description="工作台的主导航侧边栏，组织顶级模块入口，支持分组、激活态与底部用户信息。"
        />
        <ShowcaseBlock title="工作台主导航" caption="完整的侧边导航结构">
          <div className="h-80 overflow-hidden rounded-lg border">
            <SidebarProvider className="min-h-full">
              <Sidebar collapsible="none" className="border-r">
                <SidebarHeader>
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <BotIcon className="size-4" />
                    </span>
                    <span className="text-sm font-semibold">代理工作台</span>
                  </div>
                </SidebarHeader>
                <SidebarContent>
                  <SidebarGroup>
                    <SidebarGroupLabel>导航</SidebarGroupLabel>
                    <SidebarMenu>
                      {SIDEBAR_ITEMS.map((item) => (
                        <SidebarMenuItem key={item.label}>
                          <SidebarMenuButton isActive={item.active}>
                            <item.icon />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroup>
                </SidebarContent>
                <SidebarFooter>
                  <div className="flex items-center gap-2 px-2 py-1.5 text-sm">
                    <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
                      管
                    </span>
                    <div className="flex flex-col">
                      <span className="font-medium">代理管理员</span>
                      <span className="text-xs text-muted-foreground">
                        admin@acme.com
                      </span>
                    </div>
                  </div>
                </SidebarFooter>
              </Sidebar>
            </SidebarProvider>
          </div>
        </ShowcaseBlock>
      </Section>

      {/* Date Picker / Direction */}
      <Section id="date-picker">
        <SectionHeader
          index="39"
          title="Date Picker · Direction"
          description="日期选择器由日历与气泡组合而成；方向提供者支持从右到左（RTL）的国际化布局。"
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <ShowcaseBlock title="Date Picker 日期选择" caption="筛选运行记录的日期">
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start font-normal',
                      !date && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon data-icon="inline-start" />
                    {date ? format(date, 'yyyy 年 MM 月 dd 日') : '选择日期'}
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-lg"
                />
              </PopoverContent>
            </Popover>
          </ShowcaseBlock>
          <ShowcaseBlock title="Direction 文字方向" caption="切换 LTR / RTL 布局">
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => setRtl((v) => !v)}
              >
                当前：{rtl ? 'RTL（从右到左）' : 'LTR（从左到右）'}
              </Button>
              <DirectionProvider direction={rtl ? 'rtl' : 'ltr'}>
                <div
                  dir={rtl ? 'rtl' : 'ltr'}
                  className="flex items-center gap-2 rounded-lg border p-3 text-sm"
                >
                  <BotIcon className="size-4 shrink-0 text-primary" />
                  <span className="flex-1">运维巡检代理</span>
                  <span className="text-muted-foreground">运行中</span>
                </div>
              </DirectionProvider>
            </div>
          </ShowcaseBlock>
        </div>
      </Section>

      {/* Sonner / Toast */}
      <Section id="sonner">
        <SectionHeader
          index="40"
          title="Sonner · Toast 通知"
          description="非阻断式的轻量通知，用于代理任务完成、操作成功或异常等即时反馈。"
        />
        <ShowcaseBlock title="触发通知" caption="点击按钮查看右下角通知">
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() =>
                toast.success('代理已成功部署', {
                  description: '运维巡检代理现已进入运行状态。',
                  icon: <CheckCircle2Icon className="size-4" />,
                })
              }
            >
              成功通知
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast('任务已加入队列', {
                  description: '3 个代理将依次执行知识库同步。',
                })
              }
            >
              普通通知
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast.error('代理调用失败', {
                  description: '模型端点超时，已自动重试 1 次。',
                })
              }
            >
              错误通知
            </Button>
          </div>
        </ShowcaseBlock>
      </Section>
    </>
  )
}
