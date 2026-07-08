'use client'

import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'
import {
  BotIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  CircleAlertIcon,
  CpuIcon,
  InfoIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RefreshCwIcon,
  Settings2Icon,
  ShieldCheckIcon,
  SparklesIcon,
  TrashIcon,
  TriangleAlertIcon,
} from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from '@/components/ui/button-group'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Separator } from '@/components/ui/separator'

import { Section, SectionHeader, ShowcaseBlock } from './showcase'

/* ----------------------------- Accordion ----------------------------- */
function AccordionDemo() {
  return (
    <Section id="accordion">
      <SectionHeader
        index="01"
        title="Accordion 手风琴"
        description="折叠展示代理的能力说明、权限范围与运行参数。"
      />
      <div className="grid grid-cols-2 gap-5">
        <ShowcaseBlock title="代理配置项" caption="可同时展开多个面板">
          <Accordion defaultValue={['cap']}>
            <AccordionItem value="cap">
              <AccordionTrigger>能力范围</AccordionTrigger>
              <AccordionContent>
                支持知识库检索、工单处理与多轮对话编排，可在工作流中与其它代理串联调用。
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="perm">
              <AccordionTrigger>权限与数据</AccordionTrigger>
              <AccordionContent>
                仅可访问被授权的销售数据集，所有调用均记录审计日志，符合企业合规要求。
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="model">
              <AccordionTrigger>运行参数</AccordionTrigger>
              <AccordionContent>
                默认温度 0.3，最大上下文 128K，超时 30 秒后自动重试一次。
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ShowcaseBlock>
        <ShowcaseBlock title="常见问题" caption="轻量信息密度">
          <Accordion>
            <AccordionItem value="q1">
              <AccordionTrigger>如何新增一个代理？</AccordionTrigger>
              <AccordionContent>
                在工作台右上角点击「新建代理」，选择模板并配置数据源即可上线。
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2">
              <AccordionTrigger>多个代理如何协作？</AccordionTrigger>
              <AccordionContent>
                通过编排画布把代理连成工作流，上游输出会作为下游输入自动传递。
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ShowcaseBlock>
      </div>
    </Section>
  )
}

/* ------------------------------- Alert -------------------------------- */
function AlertDemo() {
  return (
    <Section id="alert">
      <SectionHeader
        index="02"
        title="Alert 警告提示"
        description="以语义状态色传达代理运行中的信息、成功、警告与异常。"
      />
      <div className="grid grid-cols-2 gap-5">
        <ShowcaseBlock title="信息 / 成功" caption="default 变体 + 状态色图标">
          <div className="flex flex-col gap-3">
            <Alert className="border-l-4 border-l-status-running">
              <InfoIcon style={{ color: 'var(--status-running)' }} />
              <AlertTitle>代理正在执行任务</AlertTitle>
              <AlertDescription>
                「销售助手」正在批量处理 128 条客户线索，预计 2 分钟完成。
              </AlertDescription>
            </Alert>
            <Alert className="border-l-4 border-l-status-online">
              <CheckCircle2Icon style={{ color: 'var(--status-online)' }} />
              <AlertTitle>工作流部署成功</AlertTitle>
              <AlertDescription>
                3 个代理已上线并通过健康检查。
              </AlertDescription>
            </Alert>
          </div>
        </ShowcaseBlock>
        <ShowcaseBlock title="警告 / 异常" caption="warning + destructive 变体">
          <div className="flex flex-col gap-3">
            <Alert className="border-l-4 border-l-status-warning">
              <TriangleAlertIcon style={{ color: 'var(--status-warning)' }} />
              <AlertTitle>令牌额度即将耗尽</AlertTitle>
              <AlertDescription>
                当前团队本月用量已达 86%，请及时扩容以避免任务中断。
              </AlertDescription>
            </Alert>
            <Alert variant="destructive" className="border-l-4 border-l-status-error">
              <CircleAlertIcon />
              <AlertTitle>代理调用异常</AlertTitle>
              <AlertDescription>
                「运维巡检」连续 3 次超时，已自动暂停并通知管理员。
              </AlertDescription>
            </Alert>
          </div>
        </ShowcaseBlock>
      </div>
    </Section>
  )
}

/* ---------------------------- Alert Dialog ---------------------------- */
function AlertDialogDemo() {
  return (
    <Section id="alert-dialog">
      <SectionHeader
        index="03"
        title="Alert Dialog 确认弹窗"
        description="对停用代理、删除工作流等高风险操作进行二次确认。"
      />
      <div className="grid grid-cols-2 gap-5">
        <ShowcaseBlock title="危险操作确认" caption="删除场景">
          <div className="flex items-center gap-3">
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="destructive">
                    <TrashIcon data-icon="inline-start" />
                    删除代理
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogMedia>
                    <TriangleAlertIcon
                      style={{ color: 'var(--status-error)' }}
                    />
                  </AlertDialogMedia>
                  <AlertDialogTitle>确认删除「销售助手」？</AlertDialogTitle>
                  <AlertDialogDescription>
                    删除后该代理的配置与历史会话将无法恢复，关联工作流会同步失效。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction variant="destructive">
                    确认删除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </ShowcaseBlock>
        <ShowcaseBlock title="状态变更确认" caption="停用场景">
          <div className="flex items-center gap-3">
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="outline">
                    <PauseIcon data-icon="inline-start" />
                    停用工作流
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogMedia>
                    <ShieldCheckIcon style={{ color: 'var(--primary)' }} />
                  </AlertDialogMedia>
                  <AlertDialogTitle>暂停「夜间巡检」工作流？</AlertDialogTitle>
                  <AlertDialogDescription>
                    暂停后正在排队的任务会保留，新触发将不再执行，可随时恢复。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>再想想</AlertDialogCancel>
                  <AlertDialogAction>确认暂停</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </ShowcaseBlock>
      </div>
    </Section>
  )
}

/* ---------------------------- Aspect Ratio ---------------------------- */
function AspectRatioDemo() {
  return (
    <Section id="aspect-ratio">
      <SectionHeader
        index="04"
        title="Aspect Ratio 宽高比"
        description="为代理缩略图、监控预览等媒体内容锁定一致的显示比例。"
      />
      <div className="grid grid-cols-3 gap-5">
        <ShowcaseBlock title="16 : 9" caption="监控预览">
          <AspectRatio
            ratio={16 / 9}
            className="overflow-hidden rounded-lg ring-1 ring-border ring-inset"
          >
            <div className="flex size-full items-center justify-center bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))]">
              <span className="font-mono text-sm font-medium text-primary-foreground">
                16 : 9
              </span>
            </div>
          </AspectRatio>
        </ShowcaseBlock>
        <ShowcaseBlock title="4 : 3" caption="信息卡片">
          <AspectRatio
            ratio={4 / 3}
            className="flex items-center justify-center overflow-hidden rounded-lg bg-secondary ring-1 ring-border ring-inset"
          >
            <CpuIcon className="size-8 text-primary" />
          </AspectRatio>
        </ShowcaseBlock>
        <ShowcaseBlock title="1 : 1" caption="代理头像位">
          <AspectRatio
            ratio={1}
            className="flex items-center justify-center overflow-hidden rounded-lg bg-secondary ring-1 ring-border ring-inset"
          >
            <BotIcon className="size-8 text-primary" />
          </AspectRatio>
        </ShowcaseBlock>
      </div>
    </Section>
  )
}

/* ------------------------------- Avatar ------------------------------- */
function StatusAvatar({
  initials,
  color,
}: {
  initials: string
  color: string
}) {
  return (
    <div className="relative">
      <Avatar className="size-11 ring-2 ring-card">
        <AvatarFallback className="bg-secondary text-secondary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span
        className="absolute right-0 bottom-0 size-3 rounded-full ring-2 ring-card"
        style={{ backgroundColor: color }}
      />
    </div>
  )
}

function AvatarDemo() {
  return (
    <Section id="avatar">
      <SectionHeader
        index="05"
        title="Avatar 头像"
        description="标识代理与协作成员，并以状态点呈现实时在线情况。"
      />
      <div className="grid grid-cols-2 gap-5">
        <ShowcaseBlock title="尺寸与状态" caption="带在线状态指示点">
          <div className="flex items-end gap-5">
            <StatusAvatar initials="销" color="var(--status-online)" />
            <StatusAvatar initials="运" color="var(--status-running)" />
            <StatusAvatar initials="知" color="var(--status-waiting)" />
            <Avatar className="size-11">
              <AvatarImage src="/agent-avatar.png" alt="代理头像" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                AI
              </AvatarFallback>
            </Avatar>
          </div>
        </ShowcaseBlock>
        <ShowcaseBlock title="协作成员组" caption="代理协作团队">
          <div className="flex items-center -space-x-2">
            {['张', '李', '王', '赵'].map((n) => (
              <Avatar key={n} className="size-9 ring-2 ring-card">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                  {n}
                </AvatarFallback>
              </Avatar>
            ))}
            <span className="ml-3 inline-flex size-9 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground ring-2 ring-card">
              +6
            </span>
          </div>
        </ShowcaseBlock>
      </div>
    </Section>
  )
}

/* -------------------------------- Badge ------------------------------- */
function StatusBadge({
  label,
  color,
}: {
  label: string
  color: string
}) {
  return (
    <Badge variant="outline" className="gap-1.5">
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </Badge>
  )
}

function BadgeDemo() {
  return (
    <Section id="badge">
      <SectionHeader
        index="06"
        title="Badge 徽标"
        description="表示代理运行状态、标签分类与计数信息。"
      />
      <div className="grid grid-cols-2 gap-5">
        <ShowcaseBlock title="代理状态" caption="状态色 + 圆点">
          <div className="flex flex-wrap gap-2">
            <StatusBadge label="在线" color="var(--status-online)" />
            <StatusBadge label="执行中" color="var(--status-running)" />
            <StatusBadge label="等待中" color="var(--status-waiting)" />
            <StatusBadge label="警告" color="var(--status-warning)" />
            <StatusBadge label="异常" color="var(--status-error)" />
          </div>
        </ShowcaseBlock>
        <ShowcaseBlock title="变体" caption="内置 variant">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>默认</Badge>
            <Badge variant="secondary">企业版</Badge>
            <Badge variant="outline">草稿</Badge>
            <Badge variant="destructive">受限</Badge>
            <Badge>
              <SparklesIcon data-icon="inline-start" />
              新功能
            </Badge>
          </div>
        </ShowcaseBlock>
      </div>
    </Section>
  )
}

/* ----------------------------- Breadcrumb ----------------------------- */
function BreadcrumbDemo() {
  return (
    <Section id="breadcrumb">
      <SectionHeader
        index="07"
        title="Breadcrumb 面包屑"
        description="呈现工作台内代理、工作流与配置页的层级路径。"
      />
      <ShowcaseBlock title="层级导航" caption="工作台 / 代理 / 详情">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">工作台</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">代理管理</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">销售团队</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>销售助手 · 配置</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </ShowcaseBlock>
    </Section>
  )
}

/* ------------------------------- Button ------------------------------- */
function ButtonDemo() {
  return (
    <Section id="button">
      <SectionHeader
        index="08"
        title="Button 按钮"
        description="覆盖主操作、次级操作、危险操作与图标按钮等场景。"
      />
      <div className="grid grid-cols-2 gap-5">
        <ShowcaseBlock title="变体" caption="variant">
          <div className="flex flex-wrap items-center gap-3">
            <Button>
              <PlusIcon data-icon="inline-start" />
              新建代理
            </Button>
            <Button variant="secondary">复制配置</Button>
            <Button variant="outline">查看日志</Button>
            <Button variant="ghost">取消</Button>
            <Button variant="destructive">
              <TrashIcon data-icon="inline-start" />
              删除
            </Button>
            <Button variant="link">查看文档</Button>
          </div>
        </ShowcaseBlock>
        <ShowcaseBlock title="尺寸与状态" caption="size / 图标 / 运行中">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">小号</Button>
            <Button>默认</Button>
            <Button size="lg">大号</Button>
            <Button size="icon" variant="outline" aria-label="设置">
              <Settings2Icon />
            </Button>
            <Button disabled>
              <RefreshCwIcon data-icon="inline-start" className="animate-spin" />
              执行中
            </Button>
          </div>
        </ShowcaseBlock>
      </div>
    </Section>
  )
}

/* ---------------------------- Button Group ---------------------------- */
function ButtonGroupDemo() {
  return (
    <Section id="button-group">
      <SectionHeader
        index="09"
        title="Button Group 按钮组"
        description="组合相关操作，构建代理运行控制条与分段选择器。"
      />
      <div className="grid grid-cols-2 gap-5">
        <ShowcaseBlock title="运行控制条" caption="带文本与分隔符">
          <ButtonGroup>
            <Button variant="outline">
              <PlayIcon data-icon="inline-start" />
              运行
            </Button>
            <Button variant="outline">
              <PauseIcon data-icon="inline-start" />
              暂停
            </Button>
            <ButtonGroupSeparator />
            <Button variant="outline">
              <RefreshCwIcon data-icon="inline-start" />
              重试
            </Button>
          </ButtonGroup>
        </ShowcaseBlock>
        <ShowcaseBlock title="带前缀的分段" caption="ButtonGroupText">
          <ButtonGroup>
            <ButtonGroupText>视图</ButtonGroupText>
            <Button variant="outline">列表</Button>
            <Button variant="secondary">看板</Button>
            <Button variant="outline">画布</Button>
          </ButtonGroup>
        </ShowcaseBlock>
      </div>
    </Section>
  )
}

/* ------------------------------ Calendar ------------------------------ */
function CalendarDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  return (
    <Section id="calendar">
      <SectionHeader
        index="10"
        title="Calendar 日历"
        description="选择任务调度日期、查看代理运行排程。"
      />
      <ShowcaseBlock title="日期选择" caption="single 模式">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-lg border border-border"
        />
      </ShowcaseBlock>
    </Section>
  )
}

/* -------------------------------- Card -------------------------------- */
function AgentCard({
  name,
  desc,
  status,
  color,
}: {
  name: string
  desc: string
  status: string
  color: string
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
              {name.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <CardTitle className="text-sm">{name}</CardTitle>
            <CardDescription className="text-xs">{desc}</CardDescription>
          </div>
        </div>
        <CardAction>
          <Badge variant="outline" className="gap-1.5">
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            {status}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">今日处理</span>
          <span className="font-medium text-foreground tabular-nums">
            1,284 条
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full">
          查看详情
          <ChevronRightIcon data-icon="inline-end" />
        </Button>
      </CardFooter>
    </Card>
  )
}

function CardDemo() {
  return (
    <Section id="card">
      <SectionHeader
        index="11"
        title="Card 卡片"
        description="承载代理概览、指标与操作的基础容器。"
      />
      <div className="grid grid-cols-3 gap-5">
        <AgentCard
          name="销售助手"
          desc="线索跟进 · 智能外呼"
          status="在线"
          color="var(--status-online)"
        />
        <AgentCard
          name="运维巡检"
          desc="日志分析 · 告警处理"
          status="执行中"
          color="var(--status-running)"
        />
        <AgentCard
          name="知识管家"
          desc="文档检索 · 问答"
          status="等待中"
          color="var(--status-waiting)"
        />
      </div>
    </Section>
  )
}

/* ------------------------------ Carousel ------------------------------ */
const metrics = [
  { label: '活跃代理', value: '24', delta: '+3 本周' },
  { label: '今日任务', value: '8,642', delta: '+12.4%' },
  { label: '平均响应', value: '1.2s', delta: '-0.3s' },
  { label: '成功率', value: '99.2%', delta: '+0.5%' },
  { label: '令牌用量', value: '86%', delta: '本月' },
]

function CarouselDemo() {
  return (
    <Section id="carousel">
      <SectionHeader
        index="12"
        title="Carousel 走马灯"
        description="在有限空间内轮播展示工作台关键指标。"
      />
      <ShowcaseBlock title="指标轮播" caption="每屏 3 项">
        <div className="px-12">
          <Carousel opts={{ align: 'start' }}>
            <CarouselContent>
              {metrics.map((m) => (
                <CarouselItem key={m.label} className="basis-1/3">
                  <div className="flex flex-col gap-1 rounded-lg border border-border bg-secondary/40 p-4">
                    <span className="text-xs text-muted-foreground">
                      {m.label}
                    </span>
                    <span className="text-2xl font-semibold text-foreground tabular-nums">
                      {m.value}
                    </span>
                    <span className="text-xs font-medium text-primary">
                      {m.delta}
                    </span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </ShowcaseBlock>
    </Section>
  )
}

/* ------------------------------- Chart -------------------------------- */
const chartData = [
  { day: '周一', completed: 420, failed: 12 },
  { day: '周二', completed: 510, failed: 18 },
  { day: '周三', completed: 680, failed: 9 },
  { day: '周四', completed: 590, failed: 22 },
  { day: '周五', completed: 760, failed: 14 },
  { day: '周六', completed: 480, failed: 6 },
  { day: '周日', completed: 360, failed: 4 },
]

const chartConfig = {
  completed: { label: '已完成', color: 'var(--chart-1)' },
  failed: { label: '失败', color: 'var(--chart-4)' },
} satisfies ChartConfig

function ChartDemo() {
  return (
    <Section id="chart">
      <SectionHeader
        index="13"
        title="Chart 图表"
        description="可视化代理任务吞吐与执行趋势，基于 Recharts。"
      />
      <ShowcaseBlock title="本周任务吞吐" caption="堆叠面积图">
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <AreaChart data={chartData} margin={{ left: 4, right: 12, top: 8 }}>
            <defs>
              <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-completed)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-completed)"
                  stopOpacity={0.02}
                />
              </linearGradient>
              <linearGradient id="fillFailed" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-failed)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-failed)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              dataKey="completed"
              type="natural"
              fill="url(#fillCompleted)"
              stroke="var(--color-completed)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="failed"
              type="natural"
              fill="url(#fillFailed)"
              stroke="var(--color-failed)"
              strokeWidth={2}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </ShowcaseBlock>
    </Section>
  )
}

/* ------------------------------ Gallery ------------------------------- */
export function ComponentGallery() {
  return (
    <div className="flex flex-col gap-14">
      <AccordionDemo />
      <Separator />
      <AlertDemo />
      <Separator />
      <AlertDialogDemo />
      <Separator />
      <AspectRatioDemo />
      <Separator />
      <AvatarDemo />
      <Separator />
      <BadgeDemo />
      <Separator />
      <BreadcrumbDemo />
      <Separator />
      <ButtonDemo />
      <Separator />
      <ButtonGroupDemo />
      <Separator />
      <CalendarDemo />
      <Separator />
      <CardDemo />
      <Separator />
      <CarouselDemo />
      <Separator />
      <ChartDemo />
    </div>
  )
}
