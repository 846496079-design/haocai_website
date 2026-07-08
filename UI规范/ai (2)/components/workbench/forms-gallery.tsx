'use client'

import { useState } from 'react'
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  ItalicIcon,
  MailIcon,
  SearchIcon,
  UnderlineIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Section, SectionHeader, ShowcaseBlock } from './showcase'

export function FormsGallery() {
  const [temperature, setTemperature] = useState<number[]>([0.7])
  const [topP, setTopP] = useState<number[]>([0.9])

  return (
    <>
      {/* Input / Textarea / Label / Field */}
      <Section id="input">
        <SectionHeader
          index="26"
          title="Input · Textarea · Label · Field"
          description="表单基础控件，配合 Field 结构组织标签、说明与校验状态，构成代理配置表单的骨架。"
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <ShowcaseBlock title="代理基础信息" caption="Field 结构组织表单">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="agent-name">代理名称</FieldLabel>
                <Input id="agent-name" placeholder="例如：销售线索分拣代理" />
                <FieldDescription>用于在工作区中标识该代理。</FieldDescription>
              </Field>
              <Field data-invalid>
                <FieldLabel htmlFor="agent-endpoint">服务端点</FieldLabel>
                <Input
                  id="agent-endpoint"
                  aria-invalid
                  defaultValue="https://"
                />
                <FieldDescription>请输入合法的 HTTPS 端点地址。</FieldDescription>
              </Field>
            </FieldGroup>
          </ShowcaseBlock>
          <ShowcaseBlock title="系统提示词" caption="多行文本输入">
            <Field>
              <FieldLabel htmlFor="system-prompt">System Prompt</FieldLabel>
              <Textarea
                id="system-prompt"
                rows={5}
                defaultValue="你是一名企业运维助手，需根据监控数据给出可执行的处置建议，并在高风险操作前请求确认。"
              />
              <FieldDescription>
                定义代理的角色、边界与行为准则。
              </FieldDescription>
            </Field>
          </ShowcaseBlock>
        </div>
      </Section>

      {/* Input Group / Input OTP / Native Select */}
      <Section id="input-group">
        <SectionHeader
          index="27"
          title="Input Group · Input OTP · Native Select"
          description="带前后缀的输入组合、一次性验证码输入与原生下拉选择，覆盖搜索、安全验证与轻量选择场景。"
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <ShowcaseBlock title="Input Group 输入组" caption="搜索与内嵌操作">
            <div className="flex flex-col gap-4">
              <InputGroup>
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupInput placeholder="搜索代理..." />
              </InputGroup>
              <InputGroup>
                <InputGroupAddon>
                  <MailIcon />
                </InputGroupAddon>
                <InputGroupInput placeholder="邀请成员邮箱" />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton variant="default">发送</InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </ShowcaseBlock>
          <ShowcaseBlock title="Input OTP 验证码" caption="高风险操作的二次验证">
            <Field>
              <FieldLabel htmlFor="otp">安全验证码</FieldLabel>
              <InputOTP id="otp" maxLength={6}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <FieldDescription>请输入发送至管理员邮箱的 6 位验证码。</FieldDescription>
            </Field>
          </ShowcaseBlock>
          <ShowcaseBlock title="Native Select 原生选择" caption="轻量级单选">
            <Field>
              <FieldLabel htmlFor="region">部署区域</FieldLabel>
              <NativeSelect id="region" className="w-full" defaultValue="cn-east">
                <NativeSelectOption value="cn-east">华东 1 区</NativeSelectOption>
                <NativeSelectOption value="cn-north">华北 2 区</NativeSelectOption>
                <NativeSelectOption value="ap-sg">新加坡</NativeSelectOption>
                <NativeSelectOption value="us-west">美西</NativeSelectOption>
              </NativeSelect>
              <FieldDescription>代理运行实例所在的地理区域。</FieldDescription>
            </Field>
          </ShowcaseBlock>
        </div>
      </Section>

      {/* Select / Radio Group / Switch */}
      <Section id="select">
        <SectionHeader
          index="28"
          title="Select · Radio Group · Switch"
          description="富样式下拉、单选组与开关，用于模型选择、运行模式切换与功能启停。"
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <ShowcaseBlock title="Select 模型选择" caption="分组下拉选择">
            <Field>
              <FieldLabel>基础模型</FieldLabel>
              <Select defaultValue="gpt-4o">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择模型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>OpenAI</SelectLabel>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4o mini</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Anthropic</SelectLabel>
                    <SelectItem value="claude">Claude Opus</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </ShowcaseBlock>
          <ShowcaseBlock title="Radio Group 单选组" caption="运行模式选择">
            <FieldSet>
              <FieldLegend variant="label">运行模式</FieldLegend>
              <RadioGroup defaultValue="auto">
                <FieldLabel
                  htmlFor="mode-auto"
                  className="font-normal"
                >
                  <RadioGroupItem id="mode-auto" value="auto" />
                  全自动执行
                </FieldLabel>
                <FieldLabel htmlFor="mode-review" className="font-normal">
                  <RadioGroupItem id="mode-review" value="review" />
                  人工复核后执行
                </FieldLabel>
                <FieldLabel htmlFor="mode-manual" className="font-normal">
                  <RadioGroupItem id="mode-manual" value="manual" />
                  仅生成建议
                </FieldLabel>
              </RadioGroup>
            </FieldSet>
          </ShowcaseBlock>
          <ShowcaseBlock title="Switch 开关" caption="功能启停">
            <div className="flex flex-col gap-4">
              <Field orientation="horizontal">
                <Switch id="sw-audit" defaultChecked />
                <FieldLabel htmlFor="sw-audit" className="font-normal">
                  启用审计日志
                </FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <Switch id="sw-stream" defaultChecked />
                <FieldLabel htmlFor="sw-stream" className="font-normal">
                  流式响应输出
                </FieldLabel>
              </Field>
              <Field orientation="horizontal">
                <Switch id="sw-fallback" />
                <FieldLabel htmlFor="sw-fallback" className="font-normal">
                  模型故障自动降级
                </FieldLabel>
              </Field>
            </div>
          </ShowcaseBlock>
        </div>
      </Section>

      {/* Slider / Toggle / Toggle Group */}
      <Section id="slider">
        <SectionHeader
          index="29"
          title="Slider · Toggle · Toggle Group"
          description="滑块用于调节模型采样参数，开关与开关组用于格式化与视图等二元/多态切换。"
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <ShowcaseBlock title="Slider 参数调节" caption="模型采样参数">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm">
                  <Label>Temperature</Label>
                  <span className="font-mono text-muted-foreground tabular-nums">
                    {temperature[0].toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={temperature}
                  onValueChange={(v) => setTemperature(v as number[])}
                  min={0}
                  max={1}
                  step={0.01}
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm">
                  <Label>Top P</Label>
                  <span className="font-mono text-muted-foreground tabular-nums">
                    {topP[0].toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={topP}
                  onValueChange={(v) => setTopP(v as number[])}
                  min={0}
                  max={1}
                  step={0.01}
                />
              </div>
            </div>
          </ShowcaseBlock>
          <ShowcaseBlock title="Toggle 开关按钮" caption="单个二元状态">
            <div className="flex items-center gap-2">
              <Toggle aria-label="加粗">
                <BoldIcon />
              </Toggle>
              <Toggle aria-label="斜体">
                <ItalicIcon />
              </Toggle>
              <Toggle aria-label="下划线" variant="outline">
                <UnderlineIcon />
              </Toggle>
            </div>
          </ShowcaseBlock>
          <ShowcaseBlock title="Toggle Group 开关组" caption="互斥的多态切换">
            <ToggleGroup defaultValue="left" spacing={0} variant="outline">
              <ToggleGroupItem value="left" aria-label="左对齐">
                <AlignLeftIcon />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="居中">
                <AlignCenterIcon />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="右对齐">
                <AlignRightIcon />
              </ToggleGroupItem>
            </ToggleGroup>
          </ShowcaseBlock>
        </div>
      </Section>
    </>
  )
}
