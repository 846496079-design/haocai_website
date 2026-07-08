'use client'

import { useState } from 'react'
import {
  BotIcon,
  ChevronDownIcon,
  CpuIcon,
  DatabaseIcon,
  FileTextIcon,
  GitBranchIcon,
  LayersIcon,
  PlugIcon,
  SettingsIcon,
  ShieldCheckIcon,
  WorkflowIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { Section, SectionHeader, ShowcaseBlock } from './showcase'

const AGENT_MODELS = [
  'GPT-4o 推理代理',
  'Claude 运维助手',
  'Llama 知识检索',
  'Mistral 销售助手',
  'Gemini 数据分析',
  '自定义微调模型',
]

const PERMISSIONS = [
  { id: 'read', label: '读取知识库', desc: '允许代理检索企业文档与数据', checked: true },
  { id: 'write', label: '写入工单系统', desc: '允许代理创建与更新运维工单', checked: true },
  { id: 'deploy', label: '触发部署流水线', desc: '高风险操作，需二次确认', checked: false },
  { id: 'billing', label: '访问计费数据', desc: '涉及敏感财务信息', checked: false },
]

export function InputsGallery() {
  const [checks, setChecks] = useState<Record<string, boolean>>(
    Object.fromEntries(PERMISSIONS.map((p) => [p.id, p.checked])),
  )
  const [allTools, setAllTools] = useState(false)

  return (
    <>
      {/* Checkbox */}
      <Section id="checkbox">
        <SectionHeader
          index="14"
          title="Checkbox 复选框"
          description="用于代理权限分配、工具授权等多选场景，支持选中、未选与父子联动状态。"
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <ShowcaseBlock title="代理权限授权" caption="为代理勾选可执行的操作范围">
            <div className="flex flex-col gap-4">
              {PERMISSIONS.map((p) => (
                <Field
                  key={p.id}
                  orientation="horizontal"
                  className="items-start"
                >
                  <Checkbox
                    id={`perm-${p.id}`}
                    checked={checks[p.id]}
                    onCheckedChange={(v) =>
                      setChecks((s) => ({ ...s, [p.id]: Boolean(v) }))
                    }
                  />
                  <div className="flex flex-col gap-0.5">
                    <FieldLabel htmlFor={`perm-${p.id}`} className="font-medium">
                      {p.label}
                    </FieldLabel>
                    <FieldDescription>{p.desc}</FieldDescription>
                  </div>
                </Field>
              ))}
            </div>
          </ShowcaseBlock>

          <ShowcaseBlock title="状态与父子联动" caption="全选 / 半选 / 禁用">
            <div className="flex flex-col gap-4">
              <Field orientation="horizontal">
                <Checkbox
                  id="tools-all"
                  checked={allTools}
                  onCheckedChange={(v) => setAllTools(Boolean(v))}
                />
                <FieldLabel htmlFor="tools-all" className="font-medium">
                  启用全部内置工具
                </FieldLabel>
              </Field>
              <Separator />
              <div className="flex flex-col gap-3 pl-6">
                <Field orientation="horizontal">
                  <Checkbox id="t1" checked={allTools} disabled />
                  <FieldLabel htmlFor="t1">网页搜索</FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox id="t2" checked={allTools} disabled />
                  <FieldLabel htmlFor="t2">代码解释器</FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <Checkbox id="t3" defaultChecked disabled />
                  <FieldLabel htmlFor="t3" className="text-muted-foreground">
                    文件读取（已锁定）
                  </FieldLabel>
                </Field>
              </div>
            </div>
          </ShowcaseBlock>
        </div>
      </Section>

      {/* Collapsible */}
      <Section id="collapsible">
        <SectionHeader
          index="15"
          title="Collapsible 折叠面板"
          description="用于代理执行步骤、日志详情等可展开内容，保持工作台信息密度的同时支持渐进式披露。"
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <ShowcaseBlock title="代理执行轨迹" caption="展开查看单步推理细节">
            <Collapsible defaultOpen className="flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <WorkflowIcon className="size-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    任务：生成季度运维报告
                  </span>
                </div>
                <CollapsibleTrigger
                  render={
                    <Button variant="ghost" size="icon-sm">
                      <ChevronDownIcon className="transition-transform data-[panel-open]:rotate-180" />
                      <span className="sr-only">展开</span>
                    </Button>
                  }
                />
              </div>
              <CollapsibleContent className="flex flex-col gap-2">
                {[
                  { icon: DatabaseIcon, t: '步骤 1 · 检索监控指标', s: '已完成' },
                  { icon: CpuIcon, t: '步骤 2 · 分析异常波动', s: '已完成' },
                  { icon: FileTextIcon, t: '步骤 3 · 撰写报告草稿', s: '进行中' },
                ].map((step) => (
                  <div
                    key={step.t}
                    className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <step.icon className="size-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{step.t}</span>
                    </div>
                    <Badge
                      variant={step.s === '进行中' ? 'secondary' : 'outline'}
                    >
                      {step.s}
                    </Badge>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </ShowcaseBlock>

          <ShowcaseBlock title="高级配置" caption="默认收起，按需展开">
            <Collapsible className="flex flex-col gap-3">
              <CollapsibleTrigger
                render={
                  <Button variant="outline" className="justify-between">
                    <span className="flex items-center gap-2">
                      <SettingsIcon data-icon="inline-start" />
                      高级运行参数
                    </span>
                    <ChevronDownIcon className="transition-transform data-[panel-open]:rotate-180" />
                  </Button>
                }
              />
              <CollapsibleContent className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">最大迭代轮数</span>
                  <span className="font-mono text-foreground">12</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">温度 Temperature</span>
                  <span className="font-mono text-foreground">0.4</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">超时阈值</span>
                  <span className="font-mono text-foreground">30s</span>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </ShowcaseBlock>
        </div>
      </Section>

      {/* Combobox */}
      <Section id="combobox">
        <SectionHeader
          index="16"
          title="Combobox 组合选择框"
          description="带搜索过滤的下拉选择，适用于从大量代理模型、知识库或集成中快速定位目标项。"
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <ShowcaseBlock title="选择代理基础模型" caption="输入关键字即时筛选">
            <Combobox items={AGENT_MODELS}>
              <Field>
                <FieldLabel>基础模型</FieldLabel>
                <ComboboxInput placeholder="搜索模型…" />
                <FieldDescription>
                  决定代理的推理能力与成本
                </FieldDescription>
              </Field>
              <ComboboxContent>
                <ComboboxEmpty>未找到匹配的模型</ComboboxEmpty>
                <ComboboxList>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      <BotIcon className="text-muted-foreground" />
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </ShowcaseBlock>

          <ShowcaseBlock title="禁用状态" caption="权限不足时不可编辑">
            <Combobox items={AGENT_MODELS}>
              <Field data-disabled>
                <FieldLabel>路由策略（只读）</FieldLabel>
                <ComboboxInput placeholder="默认负载均衡" disabled />
                <FieldDescription>
                  需管理员权限方可调整
                </FieldDescription>
              </Field>
            </Combobox>
          </ShowcaseBlock>
        </div>
      </Section>

      {/* Command */}
      <Section id="command">
        <SectionHeader
          index="17"
          title="Command 命令面板"
          description="全局快捷操作入口，运维与管理员可通过键盘快速跳转代理、调用工具或执行系统命令。"
        />
        <ShowcaseBlock
          title="代理工作台命令面板"
          caption="支持搜索、分组与快捷键提示"
        >
          <div className="mx-auto w-full max-w-md rounded-xl border border-border shadow-sm">
            <Command>
              <CommandInput placeholder="输入命令或搜索代理…" />
              <CommandList>
                <CommandEmpty>未找到相关命令</CommandEmpty>
                <CommandGroup heading="快捷操作">
                  <CommandItem>
                    <BotIcon />
                    新建 AI 代理
                    <CommandShortcut>⌘N</CommandShortcut>
                  </CommandItem>
                  <CommandItem>
                    <WorkflowIcon />
                    创建协作工作流
                    <CommandShortcut>⌘W</CommandShortcut>
                  </CommandItem>
                  <CommandItem>
                    <PlugIcon />
                    连接新集成
                    <CommandShortcut>⌘I</CommandShortcut>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="跳转">
                  <CommandItem>
                    <LayersIcon />
                    代理编排画布
                  </CommandItem>
                  <CommandItem>
                    <ShieldCheckIcon />
                    权限与审计
                  </CommandItem>
                  <CommandItem>
                    <GitBranchIcon />
                    版本与回滚
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </ShowcaseBlock>
      </Section>
    </>
  )
}
