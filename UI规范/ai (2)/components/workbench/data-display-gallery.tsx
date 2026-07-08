'use client'

import { useState } from 'react'
import {
  ArrowUpDownIcon,
  BotIcon,
  InboxIcon,
  PlusIcon,
  SearchIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Section, SectionHeader, ShowcaseBlock } from './showcase'

type AgentRow = {
  name: string
  type: string
  status: '运行中' | '已暂停' | '异常'
  calls: number
}

const AGENT_ROWS: AgentRow[] = [
  { name: '运维巡检代理', type: '运维', status: '运行中', calls: 1284 },
  { name: '销售线索分拣', type: '销售', status: '运行中', calls: 982 },
  { name: '知识库问答', type: '知识', status: '已暂停', calls: 540 },
  { name: '财务对账代理', type: '财务', status: '异常', calls: 76 },
]

const STATUS_VARIANT: Record<AgentRow['status'], 'secondary' | 'outline' | 'destructive'> = {
  运行中: 'secondary',
  已暂停: 'outline',
  异常: 'destructive',
}

export function DataDisplayGallery() {
  const [sortAsc, setSortAsc] = useState(false)

  const sortedRows = [...AGENT_ROWS].sort((a, b) =>
    sortAsc ? a.calls - b.calls : b.calls - a.calls,
  )

  return (
    <>
      {/* Table */}
      <Section id="table">
        <SectionHeader
          index="30"
          title="Table 表格"
          description="结构化展示代理清单、运行指标等表格数据，是工作台数据视图的基础。"
        />
        <ShowcaseBlock title="代理清单" caption="基础表格展示">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>代理名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">今日调用</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {AGENT_ROWS.map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.type}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[row.status]}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {row.calls.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ShowcaseBlock>
      </Section>

      {/* Data Table */}
      <Section id="data-table">
        <SectionHeader
          index="31"
          title="Data Table 数据表格"
          description="在基础表格之上叠加搜索、排序与分页等交互，构成可操作的数据管理视图。"
        />
        <ShowcaseBlock title="可交互代理表格" caption="搜索 · 排序 · 分页">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <InputGroup className="max-w-xs">
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupInput placeholder="筛选代理..." />
              </InputGroup>
              <Button variant="outline" size="sm">
                <PlusIcon data-icon="inline-start" />
                新建
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>代理名称</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSortAsc((s) => !s)}
                      className="-mr-2 ml-auto"
                    >
                      今日调用
                      <ArrowUpDownIcon data-icon="inline-end" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRows.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[row.status]}>
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {row.calls.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" text="上一页" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" text="下一页" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </ShowcaseBlock>
      </Section>

      {/* Progress / Skeleton / Spinner */}
      <Section id="progress">
        <SectionHeader
          index="32"
          title="Progress · Skeleton · Spinner"
          description="进度条、骨架屏与加载指示器，覆盖任务进度、内容占位与异步等待三类反馈。"
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <ShowcaseBlock title="Progress 进度条" caption="任务执行进度">
            <div className="flex flex-col gap-5">
              <Progress value={72}>
                <ProgressLabel>知识库索引</ProgressLabel>
                <ProgressValue />
                <ProgressTrack>
                  <ProgressIndicator />
                </ProgressTrack>
              </Progress>
              <Progress value={34}>
                <ProgressLabel>模型微调</ProgressLabel>
                <ProgressValue />
                <ProgressTrack>
                  <ProgressIndicator />
                </ProgressTrack>
              </Progress>
            </div>
          </ShowcaseBlock>
          <ShowcaseBlock title="Skeleton 骨架屏" caption="内容加载占位">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </ShowcaseBlock>
          <ShowcaseBlock title="Spinner 加载指示" caption="异步等待状态">
            <div className="flex items-center gap-4">
              <Spinner className="size-6 text-primary" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner />
                代理思考中...
              </div>
            </div>
          </ShowcaseBlock>
        </div>
      </Section>

      {/* Item / Kbd */}
      <Section id="item">
        <SectionHeader
          index="33"
          title="Item · Kbd"
          description="Item 用于构建一致的列表行，Kbd 展示键盘快捷键，二者常用于命令列表与设置项。"
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <ShowcaseBlock title="Item 列表项" caption="代理列表行">
            <ItemGroup>
              <Item variant="outline">
                <ItemMedia variant="icon">
                  <BotIcon />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>运维巡检代理</ItemTitle>
                  <ItemDescription>
                    自动监控基础设施健康度
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Badge variant="secondary">运行中</Badge>
                </ItemActions>
              </Item>
              <Item variant="outline">
                <ItemMedia variant="icon">
                  <BotIcon />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>销售线索分拣</ItemTitle>
                  <ItemDescription>
                    自动评分并分配销售线索
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Badge variant="secondary">运行中</Badge>
                </ItemActions>
              </Item>
            </ItemGroup>
          </ShowcaseBlock>
          <ShowcaseBlock title="Kbd 快捷键" caption="键盘操作提示">
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">打开命令面板</span>
                <KbdGroup>
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                </KbdGroup>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">运行全部代理</span>
                <KbdGroup>
                  <Kbd>⌘</Kbd>
                  <Kbd>⏎</Kbd>
                </KbdGroup>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">切换侧边栏</span>
                <KbdGroup>
                  <Kbd>⌘</Kbd>
                  <Kbd>B</Kbd>
                </KbdGroup>
              </div>
            </div>
          </ShowcaseBlock>
        </div>
      </Section>

      {/* Empty / Separator */}
      <Section id="empty">
        <SectionHeader
          index="34"
          title="Empty · Separator"
          description="空状态用于引导用户开始操作，分隔线用于在视觉上划分内容区块。"
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <ShowcaseBlock title="Empty 空状态" caption="无数据时的引导">
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <InboxIcon />
                </EmptyMedia>
                <EmptyTitle>暂无运行中的代理</EmptyTitle>
                <EmptyDescription>
                  创建你的第一个代理，开始构建多代理协作流程。
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button>
                  <PlusIcon data-icon="inline-start" />
                  新建代理
                </Button>
              </EmptyContent>
            </Empty>
          </ShowcaseBlock>
          <ShowcaseBlock title="Separator 分隔线" caption="横向与纵向分隔">
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="font-medium">代理工作台</span>
                <span className="text-muted-foreground">
                  企业级多代理协作空间
                </span>
              </div>
              <Separator />
              <div className="flex h-6 items-center gap-3">
                <span>编排</span>
                <Separator orientation="vertical" />
                <span>监控</span>
                <Separator orientation="vertical" />
                <span>治理</span>
              </div>
            </div>
          </ShowcaseBlock>
        </div>
      </Section>

      {/* Typography */}
      <Section id="typography">
        <SectionHeader
          index="35"
          title="Typography 排版"
          description="基于 Inter 字体的排版层级，确保标题、正文与辅助文本在工作台中保持一致的可读性。"
        />
        <ShowcaseBlock title="文字层级" caption="标题 · 正文 · 辅助文本">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold tracking-tight text-balance">
              企业级 AI 代理工作台
            </h1>
            <h2 className="text-xl font-semibold tracking-tight">
              多代理协作编排
            </h2>
            <p className="leading-relaxed text-foreground">
              在统一的工作空间内，可视化地编排多个智能体的协作流程，结合企业知识库与权限治理，构建高度可信的自动化能力。
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              辅助说明文本用于补充次要信息，颜色更浅、字号更小，与正文形成清晰的视觉层级。
            </p>
            <div className="flex items-center gap-2 text-sm">
              <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">
                agent.run()
              </code>
              <span className="text-muted-foreground">行内代码样式</span>
            </div>
            <blockquote className="border-l-2 border-border pl-4 text-sm italic text-muted-foreground">
              “可信、可控、可审计——是企业采用 AI 代理的前提。”
            </blockquote>
          </div>
        </ShowcaseBlock>
      </Section>
    </>
  )
}
