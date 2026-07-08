'use client'

import {
  BellRingIcon,
  BrainIcon,
  DatabaseIcon,
  FileSearchIcon,
  GitBranchIcon,
  MailIcon,
  SendIcon,
  ZapIcon,
} from 'lucide-react'

import { AgentChip } from '@/components/ai/agent-chip'
import { AiPromptInput } from '@/components/ai/ai-prompt-input'
import { AutomationBuilder } from '@/components/ai/automation-builder'
import { EmployeeCard } from '@/components/ai/employee-card'
import { ModelSwitcher, type ModelOption } from '@/components/ai/model-switcher'
import { PluginCard } from '@/components/ai/plugin-card'
import { TaskCard } from '@/components/ai/task-card'
import { WorkflowNode } from '@/components/ai/workflow-node'
import { Section, SectionHeader, ShowcaseBlock } from './showcase'

const models: ModelOption[] = [
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 Mini',
    vendor: 'OpenAI',
    tier: 'fast',
    description: '低延迟日常任务',
  },
  {
    id: 'claude-opus',
    name: 'Claude Opus 4.6',
    vendor: 'Anthropic',
    tier: 'powerful',
    description: '复杂推理',
  },
  {
    id: 'gemini-flash',
    name: 'Gemini 3 Flash',
    vendor: 'Google',
    tier: 'balanced',
    description: '多模态均衡',
  },
]

export function AiGallery() {
  return (
    <Section id="ai-prompt-input">
      <SectionHeader
        index="06"
        title="AI 产品组件"
        description="面向多代理协作工作台的专属复合组件，覆盖对话输入、编排、任务与人员管理。"
      />

      <ShowcaseBlock
        title="AiPromptInput · 智能提示输入"
        caption="集成模型切换、附件、联网检索与字数限制的代理对话输入框。"
      >
        <AiPromptInput models={models} />
      </ShowcaseBlock>

      <div className="grid gap-5 lg:grid-cols-2">
        <ShowcaseBlock
          id="model-switcher"
          title="ModelSwitcher · 模型切换器"
          caption="按速度档位组织的推理模型选择菜单。"
          className="scroll-mt-24"
        >
          <div className="flex flex-col items-start gap-3">
            <ModelSwitcher models={models} />
            <p className="text-xs text-muted-foreground">
              选择后将应用于当前会话的所有代理调用。
            </p>
          </div>
        </ShowcaseBlock>

        <ShowcaseBlock
          id="agent-chip"
          title="AgentChip · 代理标签"
          caption="带实时状态点的代理标识，可内联于任意上下文。"
          className="scroll-mt-24"
        >
          <div className="flex flex-wrap items-center gap-2">
            <AgentChip name="数据分析师" status="online" icon={BrainIcon} />
            <AgentChip name="工单处理代理" status="running" />
            <AgentChip name="邮件助手" status="waiting" icon={MailIcon} />
            <AgentChip name="部署代理" status="error" icon={ZapIcon} />
            <AgentChip name="离线代理" status="offline" />
            <AgentChip name="紧凑" status="online" compact />
          </div>
        </ShowcaseBlock>
      </div>

      <ShowcaseBlock
        id="task-card"
        title="TaskCard · 任务卡片"
        caption="展示代理任务的状态、进度、负责人与执行步骤。"
        className="scroll-mt-24"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <TaskCard
            title="生成季度销售报告"
            taskId="TASK-2041"
            status="running"
            progress={68}
            agentName="数据分析师"
            duration="预计 2 分钟"
            steps={{ done: 3, total: 5 }}
          />
          <TaskCard
            title="同步 CRM 客户标签"
            taskId="TASK-2042"
            status="queued"
            agentName="销售运营代理"
          />
          <TaskCard
            title="归档历史工单"
            taskId="TASK-2039"
            status="done"
            progress={100}
            agentName="工单处理代理"
            duration="用时 47 秒"
            steps={{ done: 4, total: 4 }}
          />
          <TaskCard
            title="部署预发布环境"
            taskId="TASK-2038"
            status="failed"
            progress={42}
            agentName="部署代理"
            duration="中断于 1 分钟"
            steps={{ done: 2, total: 6 }}
          />
        </div>
      </ShowcaseBlock>

      <div className="grid gap-5 lg:grid-cols-2">
        <ShowcaseBlock
          id="workflow-node"
          title="WorkflowNode · 工作流节点"
          caption="可编排画布中的节点，含类型、状态与连接点。"
          className="scroll-mt-24"
        >
          <div className="flex flex-wrap gap-4">
            <WorkflowNode
              title="收到新邮件"
              kind="trigger"
              icon={MailIcon}
              subtitle="Gmail 触发"
              hasInput={false}
              state="success"
            />
            <WorkflowNode
              title="意图分类"
              kind="agent"
              icon={BrainIcon}
              subtitle="GPT-5 Mini"
              state="running"
            />
            <WorkflowNode
              title="检索知识库"
              kind="tool"
              icon={FileSearchIcon}
              subtitle="向量检索"
              selected
            />
          </div>
        </ShowcaseBlock>

        <ShowcaseBlock
          id="plugin-card"
          title="PluginCard · 插件卡片"
          caption="可启停的工具 / 插件，状态随开关高亮。"
          className="scroll-mt-24"
        >
          <div className="flex flex-col gap-3">
            <PluginCard
              name="知识库检索"
              description="为代理提供企业文档的向量检索与引用能力。"
              icon={DatabaseIcon}
              category="数据"
              version="v2.1"
              defaultEnabled
            />
            <PluginCard
              name="邮件发送"
              description="允许代理通过企业邮箱自动发送与回复邮件。"
              icon={SendIcon}
              category="通讯"
              version="v1.4"
            />
          </div>
        </ShowcaseBlock>
      </div>

      <ShowcaseBlock
        id="employee-card"
        title="EmployeeCard · 数字员工卡片"
        caption="AI 数字员工档案，含技能标签、运行指标与快捷操作。"
        className="scroll-mt-24"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <EmployeeCard
            name="Aria · 数据分析师"
            role="商业智能 / 报表自动化"
            avatarSrc="/agent-avatar.png"
            status="online"
            skills={['SQL', '可视化', '预测']}
            stats={[
              { label: '本月任务', value: '128' },
              { label: '成功率', value: '99%' },
              { label: '平均耗时', value: '1.2m' },
            ]}
          />
          <EmployeeCard
            name="Leo · 销售运营代理"
            role="CRM 维护 / 线索跟进"
            status="running"
            skills={['CRM', '外呼', '报价']}
            stats={[
              { label: '本月任务', value: '94' },
              { label: '成功率', value: '97%' },
              { label: '平均耗时', value: '2.0m' },
            ]}
          />
          <EmployeeCard
            name="Mia · 工单处理代理"
            role="客服工单 / 知识应答"
            status="waiting"
            skills={['客服', '分类', '升级']}
            stats={[
              { label: '本月任务', value: '210' },
              { label: '成功率', value: '98%' },
              { label: '平均耗时', value: '0.8m' },
            ]}
          />
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock
        id="automation-builder"
        title="AutomationBuilder · 自动化编排器"
        caption="将触发器、代理与工具节点串联为端到端自动化流程。"
        className="scroll-mt-24"
      >
        <AutomationBuilder
          selectedId="classify"
          steps={[
            {
              id: 'trigger',
              title: '收到新邮件',
              kind: 'trigger',
              icon: MailIcon,
              subtitle: 'Gmail',
              state: 'success',
            },
            {
              id: 'classify',
              title: '意图分类',
              kind: 'agent',
              icon: BrainIcon,
              subtitle: 'GPT-5 Mini',
              state: 'running',
            },
            {
              id: 'retrieve',
              title: '检索知识库',
              kind: 'tool',
              icon: FileSearchIcon,
              subtitle: '向量检索',
            },
            {
              id: 'branch',
              title: '是否需人工',
              kind: 'condition',
              icon: GitBranchIcon,
            },
            {
              id: 'reply',
              title: '自动回复',
              kind: 'output',
              icon: BellRingIcon,
            },
          ]}
        />
      </ShowcaseBlock>
    </Section>
  )
}
