'use client'

import {
  ActivityIcon,
  BrainIcon,
  CheckCircle2Icon,
  ClockIcon,
  DatabaseIcon,
  GaugeIcon,
  MailIcon,
  MessageSquareIcon,
  PlugIcon,
  TimerIcon,
  UsersIcon,
} from 'lucide-react'

import { AppCard } from '@/components/ai/app-card'
import { AutomationCard } from '@/components/ai/automation-card'
import { ChatBubble } from '@/components/ai/chat-bubble'
import { EmployeeProfileDialog } from '@/components/ai/employee-profile-dialog'
import { FileCard } from '@/components/ai/file-card'
import { MetricCard } from '@/components/ai/metric-card'
import { ThinkingPanel } from '@/components/ai/thinking-panel'
import { Topbar } from '@/components/ai/topbar'
import { Button } from '@/components/ui/button'
import { Section, SectionHeader, ShowcaseBlock } from './showcase'

export function AiWorkspaceGallery() {
  return (
    <Section id="topbar">
      <SectionHeader
        index="07"
        title="AI 工作空间复合组件"
        description="覆盖顶栏导航、对话、推理、文件、应用、自动化与指标的工作空间级拼装组件。"
      />

      <ShowcaseBlock
        title="Topbar · 顶栏导航"
        caption="面包屑、全局搜索、通知与账户菜单的工作空间顶栏。"
        className="scroll-mt-24"
      >
        <div className="overflow-hidden rounded-lg border border-border">
          <Topbar
            crumbs={[
              { label: '工作空间', href: '#' },
              { label: '代理团队', href: '#' },
              { label: '数据分析师' },
            ]}
            userName="陈管理员"
            userRole="工作空间管理员"
            notifications={5}
          />
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock
        id="metric-card"
        title="MetricCard · 指标卡片"
        caption="带同比趋势的关键运营指标，正负向自动着色。"
        className="scroll-mt-24"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="活跃代理"
            value="48"
            icon={UsersIcon}
            delta={12}
            hint="对比上周"
          />
          <MetricCard
            label="今日任务"
            value="1,284"
            icon={ActivityIcon}
            delta={8}
            hint="对比昨日"
          />
          <MetricCard
            label="平均响应"
            value="1.4s"
            icon={TimerIcon}
            delta={-6}
            positiveIsGood={false}
            hint="越低越好"
          />
          <MetricCard
            label="成功率"
            value="98.6%"
            icon={GaugeIcon}
            delta={2}
            hint="对比上周"
          />
        </div>
      </ShowcaseBlock>

      <div className="grid gap-5 lg:grid-cols-2">
        <ShowcaseBlock
          id="chat-bubble"
          title="ChatBubble · 对话气泡"
          caption="区分用户、代理与系统消息的对话气泡。"
          className="scroll-mt-24"
        >
          <div className="flex flex-col gap-4">
            <ChatBubble role="system">会话已分配给「数据分析师」</ChatBubble>
            <ChatBubble role="user" author="我" timestamp="14:02">
              帮我生成上季度华东区销售汇总。
            </ChatBubble>
            <ChatBubble
              role="agent"
              author="数据分析师"
              timestamp="14:02"
              icon={BrainIcon}
              footer={
                <Button variant="ghost" size="xs">
                  <CheckCircle2Icon data-icon="inline-start" />
                  采纳
                </Button>
              }
            >
              已完成查询，华东区上季度销售额为 ¥2,847 万，环比增长 12%。报表已生成。
            </ChatBubble>
          </div>
        </ShowcaseBlock>

        <ShowcaseBlock
          id="thinking-panel"
          title="ThinkingPanel · 推理过程"
          caption="可折叠的代理推理步骤面板，展示思维链。"
          className="scroll-mt-24"
        >
          <ThinkingPanel
            thinking
            thoughts={[
              {
                id: '1',
                title: '解析用户意图',
                detail: '识别为销售数据汇总请求，地域=华东，周期=上季度。',
                state: 'done',
              },
              {
                id: '2',
                title: '检索数据源',
                detail: '连接 CRM 数据库，定位销售明细表。',
                state: 'done',
              },
              {
                id: '3',
                title: '聚合计算中',
                detail: '按区域与时间维度执行分组求和。',
                state: 'active',
              },
              {
                id: '4',
                title: '生成可视化报表',
                state: 'pending',
              },
            ]}
          />
        </ShowcaseBlock>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ShowcaseBlock
          id="file-card"
          title="FileCard · 文件卡片"
          caption="代理产出物的文件展示，含类型图标与操作。"
          className="scroll-mt-24"
        >
          <div className="flex flex-col gap-3">
            <FileCard
              name="2024Q1-华东销售汇总.xlsx"
              kind="sheet"
              size="2.4 MB"
              meta="由数据分析师生成"
            />
            <FileCard
              name="季度经营分析报告.pdf"
              kind="document"
              size="1.1 MB"
              meta="3 分钟前"
            />
            <FileCard
              name="趋势图表.png"
              kind="image"
              size="640 KB"
              meta="3 分钟前"
            />
          </div>
        </ShowcaseBlock>

        <ShowcaseBlock
          id="app-card"
          title="AppCard · 应用卡片"
          caption="应用市场中的集成应用，含评分与安装状态。"
          className="scroll-mt-24"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <AppCard
              name="知识库连接器"
              description="将企业文档库接入代理，提供检索增强能力。"
              icon={DatabaseIcon}
              category="数据"
              rating={4.8}
              installs="1.2k"
              installed
            />
            <AppCard
              name="邮件自动化"
              description="让代理自动收发与分类企业邮件。"
              icon={MailIcon}
              category="通讯"
              rating={4.6}
              installs="980"
            />
          </div>
        </ShowcaseBlock>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ShowcaseBlock
          id="automation-card"
          title="AutomationCard · 自动化卡片"
          caption="自动化流程概览，含触发条件、步骤与运行统计。"
          className="scroll-mt-24"
        >
          <div className="flex flex-col gap-3">
            <AutomationCard
              name="新邮件自动分派"
              trigger="收到客户邮件时"
              steps={5}
              runs={142}
              lastRun="12 分钟前"
              defaultEnabled
            />
            <AutomationCard
              name="每日报表生成"
              trigger="每天 08:00"
              steps={3}
              runs={30}
              lastRun="今天 08:00"
              defaultEnabled={false}
            />
          </div>
        </ShowcaseBlock>

        <ShowcaseBlock
          id="employee-profile-dialog"
          title="EmployeeProfileDialog · 员工档案"
          caption="数字员工完整档案对话框，含概览、能力与动态分页。"
          className="scroll-mt-24"
        >
          <div className="flex flex-col items-start gap-3">
            <EmployeeProfileDialog
              trigger={
                <Button variant="default">
                  <MessageSquareIcon data-icon="inline-start" />
                  查看 Aria 档案
                </Button>
              }
              name="Aria · 数据分析师"
              role="商业智能 / 报表自动化"
              avatarSrc="/agent-avatar.png"
              status="online"
              description="Aria 专注于企业数据的查询、聚合与可视化，可对接 CRM、数仓与 BI 工具，自动生成经营分析报表。"
              skills={['SQL', '数据可视化', '趋势预测', '报表自动化']}
              capabilities={[
                { label: '数据查询', value: 96 },
                { label: '可视化', value: 88 },
                { label: '预测分析', value: 74 },
              ]}
              stats={[
                { label: '本月任务', value: '128' },
                { label: '成功率', value: '99%' },
                { label: '平均耗时', value: '1.2m' },
              ]}
              activities={[
                {
                  id: '1',
                  text: '生成「华东区季度销售汇总」报表',
                  time: '3 分钟前',
                },
                {
                  id: '2',
                  text: '同步 CRM 客户标签 1,204 条',
                  time: '1 小时前',
                },
                { id: '3', text: '完成月度经营分析', time: '昨天 18:30' },
              ]}
            />
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <PlugIcon className="size-3.5" />
              点击按钮打开完整档案对话框。
            </p>
          </div>
        </ShowcaseBlock>
      </div>
    </Section>
  )
}
