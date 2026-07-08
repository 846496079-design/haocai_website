'use client'

import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Building2,
  Calculator,
  CheckCircle2,
  Clock3,
  FileText,
  Headphones,
  Landmark,
  Layers3,
  Lock,
  Mail,
  MessageSquareText,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import Image from 'next/image'
import type { FormEvent, ReactNode } from 'react'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FadeInSection from '@/components/ui/fade-in-section'
import type { IconKey, SiteContent } from '@/lib/site-content'

const icons: Record<IconKey, typeof Building2> = {
  building: Building2,
  calculator: Calculator,
  chart: TrendingUp,
  check: BadgeCheck,
  clock: Clock3,
  file: FileText,
  headphones: Headphones,
  landmark: Landmark,
  layers: Layers3,
  lock: Lock,
  message: MessageSquareText,
  shield: ShieldCheck,
  spark: Sparkles,
  users: Users,
  wallet: Wallet,
}

function TrialLink({
  href,
  children,
  variant = 'primary',
}: {
  href: string
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'dark'
}) {
  const classes =
    variant === 'primary'
      ? 'bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] text-white shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25'
      : variant === 'dark'
        ? 'border border-white/20 bg-white text-[#18243D] hover:bg-white/90'
        : 'border border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary'

  return (
    <a
      href={href}
      className={`inline-flex h-12 items-center justify-center rounded-xl px-6 text-sm font-semibold transition-all ${classes}`}
    >
      {children}
    </a>
  )
}

function TrialButton({
  children,
  onClick,
  variant = 'primary',
}: {
  children: ReactNode
  onClick: () => void
  variant?: 'primary' | 'dark'
}) {
  const classes =
    variant === 'dark'
      ? 'border border-white/20 bg-white text-[#18243D] hover:bg-white/90'
      : 'bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] text-white shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-12 items-center justify-center rounded-xl px-6 text-sm font-semibold transition-all ${classes}`}
    >
      {children}
    </button>
  )
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold text-primary">{eyebrow}</p>
      )}
      <h2 className="text-3xl font-semibold leading-tight text-foreground md:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  )
}

function IconBox({ icon }: { icon: IconKey }) {
  const Icon = icons[icon]
  return (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
      <Icon className="size-5" />
    </div>
  )
}

export default function OfficialSite({ site }: { site: SiteContent }) {
  const contactHref = `tel:${site.company.contact}`
  const [trialOpen, setTrialOpen] = useState(false)
  const [partnerSent, setPartnerSent] = useState(false)
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    phone: '',
    company: '',
    city: '',
    role: '',
    customerScale: '',
    cooperationType: '渠道分销',
    message: '',
  })

  function submitPartnerForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const subject = `账大师代理合作申请 - ${partnerForm.company || partnerForm.name}`
    const body = [
      '代理合作申请',
      '',
      `联系人：${partnerForm.name}`,
      `联系电话：${partnerForm.phone}`,
      `公司/团队：${partnerForm.company}`,
      `所在城市：${partnerForm.city}`,
      `角色身份：${partnerForm.role}`,
      `客户资源规模：${partnerForm.customerScale}`,
      `合作类型：${partnerForm.cooperationType}`,
      `补充说明：${partnerForm.message || '无'}`,
      '',
      '来源：好财账大师官网代理合作表单',
    ].join('\n')

    window.location.href = `mailto:${site.company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setPartnerSent(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar site={site} />

      <main>
        <section className="relative overflow-hidden px-6 pb-20 pt-14 md:pb-24 md:pt-20">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(91,108,255,0.14),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(34,197,94,0.08),transparent_28%)]" />
          <div className="mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[1fr_520px]">
            <FadeInSection>
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-[0_4px_18px_rgba(38,67,104,.05)]">
                  <span className="size-2 rounded-full bg-status-online" />
                  {site.hero.eyebrow}
                </div>
                <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-6xl">
                  {site.hero.title}
                  <span className="block bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] bg-clip-text text-transparent">
                    {site.hero.titleAccent}
                  </span>
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                  {site.hero.description}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <TrialButton onClick={() => setTrialOpen(true)}>
                    {site.hero.primaryCta}
                    <ArrowRight className="ml-2 size-4" />
                  </TrialButton>
                  <TrialLink href={contactHref} variant="secondary">
                    {site.hero.secondaryCta}
                  </TrialLink>
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {site.metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-2xl border border-border bg-card p-4 shadow-[0_4px_18px_rgba(38,67,104,.05)]"
                    >
                      <div className="text-2xl font-semibold text-foreground">{metric.value}</div>
                      <div className="mt-1 text-sm font-medium text-foreground">{metric.label}</div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{metric.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInSection>

            <FadeInSection delay={120}>
              <div className="relative">
                <div className="mx-auto max-w-[430px] rounded-[32px] border border-border bg-card p-3 shadow-[0_24px_70px_rgba(24,36,61,.14)]">
                  <Image
                    src="/images/product-mobile-dashboard.png"
                    alt="好财账大师移动端 AI 三步智能记账界面"
                    width={922}
                    height={2048}
                    priority
                    className="h-[620px] w-full rounded-[24px] object-cover object-top md:h-[700px]"
                  />
                </div>
                <div className="absolute -bottom-5 left-1/2 hidden w-[88%] -translate-x-1/2 rounded-2xl border border-border bg-card/95 p-4 shadow-[0_12px_34px_rgba(24,36,61,.12)] backdrop-blur md:block">
                  <div className="flex items-start gap-3">
                    <Bot className="mt-0.5 size-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">真实产品截图</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        展示移动端 AI 三步智能记账、银行流水同步和下一步建议。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>

        <section className="border-y border-border bg-card px-6 py-6">
          <div className="mx-auto grid max-w-[1280px] gap-4 md:grid-cols-4">
            {site.proofItems.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 size-5 shrink-0 text-status-online" />
                <div>
                  <p className="text-sm font-semibold">{item.label}：{item.value}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-[1280px]">
            <FadeInSection>
              <SectionHeading title={site.painTitle} subtitle={site.painSubtitle} />
            </FadeInSection>
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {site.pains.map((pain, index) => (
                <FadeInSection key={pain.title} delay={index * 60}>
                  <div className="h-full rounded-3xl border border-border bg-card p-6 shadow-[0_4px_18px_rgba(38,67,104,.05)]">
                    <IconBox icon={pain.icon} />
                    <h3 className="mt-5 text-lg font-semibold">{pain.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{pain.description}</p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-card px-6 py-20">
          <div className="mx-auto max-w-[1280px]">
            <FadeInSection>
              <SectionHeading
                eyebrow="用案例和数据说话"
                title="为什么小微企业愿意先试账大师？"
                subtitle="以下为典型使用场景测算，实际节省金额和效率提升会因企业规模、资料完整度和服务方式不同而变化。"
              />
            </FadeInSection>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {[
                {
                  title: '小规模商贸公司',
                  result: '年服务费从数千元降到 360 元起',
                  desc: '按常见基础代账 300 元/月估算，单企业每年可少支出约 3,240 元，把预算留给经营。',
                  tags: ['月度报税', '发票流水', '老板查账'],
                },
                {
                  title: '3 家门店老板',
                  result: '一个账号查看多家公司进度',
                  desc: '不用在多个表格和聊天记录里找资料，收入、成本、待办和税额集中呈现。',
                  tags: ['多企业', '移动端', '经营看板'],
                },
                {
                  title: '代账会计团队',
                  result: '先看待办，再处理客户',
                  desc: '把发票、工资、流水异常提前排队，减少月底集中追资料和反复沟通。',
                  tags: ['多客户', '待办提醒', '批量处理'],
                },
              ].map((item, index) => (
                <FadeInSection key={item.title} delay={index * 70}>
                  <div className="h-full rounded-3xl border border-border bg-background p-6">
                    <p className="text-sm font-semibold text-primary">{item.title}</p>
                    <h3 className="mt-3 text-2xl font-semibold leading-tight">{item.result}</h3>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.desc}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-card px-3 py-1 text-xs text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="px-6 py-20">
          <div className="mx-auto max-w-[1280px]">
            <FadeInSection>
              <SectionHeading title={site.featuresTitle} subtitle={site.featuresSubtitle} />
            </FadeInSection>
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {site.features.map((feature, index) => (
                <FadeInSection key={feature.title} delay={index * 50}>
                  <div className="h-full rounded-3xl border border-border bg-card p-6 shadow-[0_4px_18px_rgba(38,67,104,.05)]">
                    <IconBox icon={feature.icon} />
                    <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {feature.details.map((detail) => (
                        <span
                          key={detail}
                          className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground"
                        >
                          {detail}
                        </span>
                      ))}
                    </div>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        <section id="roles" className="bg-card px-6 py-20">
          <div className="mx-auto max-w-[1280px]">
            <FadeInSection>
              <SectionHeading title={site.rolesTitle} subtitle={site.rolesSubtitle} />
            </FadeInSection>
            <div className="mt-12 grid gap-5 lg:grid-cols-5">
              {site.roles.map((role, index) => (
                <FadeInSection key={role.title} delay={index * 60}>
                  <div className="h-full rounded-3xl border border-border bg-background p-5">
                    <IconBox icon={role.icon} />
                    <h3 className="mt-5 text-lg font-semibold">{role.title}</h3>
                    <p className="mt-2 text-sm text-primary">{role.user}</p>
                    <ol className="mt-5 space-y-3">
                      {role.journey.map((item, itemIndex) => (
                        <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-card text-xs font-semibold text-primary">
                            {itemIndex + 1}
                          </span>
                          {item}
                        </li>
                      ))}
                    </ol>
                    <p className="mt-5 rounded-2xl bg-card p-3 text-xs leading-5 text-muted-foreground">{role.cta}</p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="px-6 py-20">
          <div className="mx-auto max-w-[1280px]">
            <FadeInSection>
              <SectionHeading title={site.workflowTitle} subtitle={site.workflowSubtitle} />
            </FadeInSection>
            <div className="mt-12 grid gap-4 lg:grid-cols-5">
              {site.workflow.map((step, index) => (
                <FadeInSection key={step.step} delay={index * 70}>
                  <div className="h-full rounded-3xl border border-border bg-card p-5 shadow-[0_4px_18px_rgba(38,67,104,.05)]">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-white">
                      {step.step}
                    </div>
                    <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.description}</p>
                    <p className="mt-4 rounded-2xl bg-background p-3 text-xs leading-5 text-muted-foreground">
                      {step.output}
                    </p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <FadeInSection>
              <SectionHeading
                align="left"
                eyebrow="软件核心"
                title={site.proofTitle}
                subtitle={site.proofSubtitle}
              />
            </FadeInSection>
            <FadeInSection delay={120}>
              <div className="grid gap-4 md:grid-cols-2">
                {site.proofItems.map((item) => (
                  <div key={item.label} className="rounded-3xl border border-border bg-card p-6">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </FadeInSection>
          </div>
        </section>

        <section id="pricing" className="bg-card px-6 py-20">
          <div className="mx-auto grid max-w-[1120px] items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <FadeInSection>
              <SectionHeading align="left" title={site.pricing.title} subtitle={site.pricing.subtitle} />
            </FadeInSection>
            <FadeInSection delay={120}>
              <div className="rounded-[28px] border border-primary/20 bg-background p-6 shadow-[0_20px_60px_rgba(24,36,61,.12)]">
                <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary">统一定价</p>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-5xl font-semibold">{site.pricing.price}</span>
                      <span className="pb-2 text-muted-foreground">{site.pricing.period}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{site.pricing.description}</p>
                  </div>
                  <TrialButton onClick={() => setTrialOpen(true)}>{site.pricing.cta}</TrialButton>
                </div>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-semibold">{site.pricing.includedTitle}</h3>
                    <ul className="mt-4 space-y-3">
                      {site.pricing.included.map((item) => (
                        <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-status-online" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">{site.pricing.boundaryTitle}</h3>
                    <ul className="mt-4 space-y-3">
                      {site.pricing.boundaries.map((item) => (
                        <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-status-warning" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-[1280px] rounded-[28px] border border-border bg-card p-6 md:p-10">
            <FadeInSection>
              <SectionHeading title={site.compliance.title} subtitle={site.compliance.subtitle} />
            </FadeInSection>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              <div className="rounded-3xl bg-background p-6">
                <h3 className="font-semibold">服务亮点</h3>
                <ul className="mt-4 space-y-3">
                  {site.compliance.safe.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-status-online" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-background p-6">
                <h3 className="font-semibold">使用提醒</h3>
                <ul className="mt-4 space-y-3">
                  {site.compliance.limited.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                      <Lock className="mt-0.5 size-5 shrink-0 text-status-warning" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="partners" className="bg-card px-6 py-20">
          <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <FadeInSection>
              <div>
                <SectionHeading
                  align="left"
                  eyebrow="代理合作"
                  title="有客户资源？一起把账大师卖给更多小微企业"
                  subtitle="面向财税服务商、代账机构、企业服务顾问、园区招商和本地渠道。你负责客户触达和本地服务，我们提供产品、价格、试用和客服承接。"
                />
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    ['统一低价', '360 元/年，更容易做首次成交。'],
                    ['试用承接', '7 天体验套餐降低客户决策门槛。'],
                    ['客户复购', '财税工具天然适合长期服务。'],
                    ['专属对接', '姚经理负责合作沟通和资料支持。'],
                  ].map(([title, desc]) => (
                    <div key={title} className="rounded-2xl border border-border bg-background p-4">
                      <p className="font-semibold">{title}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInSection>

            <FadeInSection delay={120}>
              <form onSubmit={submitPartnerForm} className="rounded-[28px] border border-border bg-background p-6 shadow-[0_20px_60px_rgba(24,36,61,.10)]">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium">
                    联系人
                    <input
                      required
                      value={partnerForm.name}
                      onChange={(event) => setPartnerForm({ ...partnerForm, name: event.target.value })}
                      className="h-12 rounded-xl border border-border bg-card px-4 font-normal outline-none transition-colors focus:border-primary"
                      placeholder="请填写姓名"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    联系电话
                    <input
                      required
                      value={partnerForm.phone}
                      onChange={(event) => setPartnerForm({ ...partnerForm, phone: event.target.value })}
                      className="h-12 rounded-xl border border-border bg-card px-4 font-normal outline-none transition-colors focus:border-primary"
                      placeholder="手机号或座机"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    公司/团队
                    <input
                      required
                      value={partnerForm.company}
                      onChange={(event) => setPartnerForm({ ...partnerForm, company: event.target.value })}
                      className="h-12 rounded-xl border border-border bg-card px-4 font-normal outline-none transition-colors focus:border-primary"
                      placeholder="公司或团队名称"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    所在城市
                    <input
                      required
                      value={partnerForm.city}
                      onChange={(event) => setPartnerForm({ ...partnerForm, city: event.target.value })}
                      className="h-12 rounded-xl border border-border bg-card px-4 font-normal outline-none transition-colors focus:border-primary"
                      placeholder="如上海、苏州、杭州"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    角色身份
                    <select
                      required
                      value={partnerForm.role}
                      onChange={(event) => setPartnerForm({ ...partnerForm, role: event.target.value })}
                      className="h-12 rounded-xl border border-border bg-card px-4 font-normal outline-none transition-colors focus:border-primary"
                    >
                      <option value="">请选择</option>
                      <option value="代账机构">代账机构</option>
                      <option value="财税顾问">财税顾问</option>
                      <option value="企业服务渠道">企业服务渠道</option>
                      <option value="园区/招商服务">园区/招商服务</option>
                      <option value="其他">其他</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    客户资源规模
                    <select
                      required
                      value={partnerForm.customerScale}
                      onChange={(event) => setPartnerForm({ ...partnerForm, customerScale: event.target.value })}
                      className="h-12 rounded-xl border border-border bg-card px-4 font-normal outline-none transition-colors focus:border-primary"
                    >
                      <option value="">请选择</option>
                      <option value="10 家以内">10 家以内</option>
                      <option value="10-50 家">10-50 家</option>
                      <option value="50-200 家">50-200 家</option>
                      <option value="200 家以上">200 家以上</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium md:col-span-2">
                    合作方式
                    <select
                      value={partnerForm.cooperationType}
                      onChange={(event) => setPartnerForm({ ...partnerForm, cooperationType: event.target.value })}
                      className="h-12 rounded-xl border border-border bg-card px-4 font-normal outline-none transition-colors focus:border-primary"
                    >
                      <option value="渠道分销">渠道分销</option>
                      <option value="代账客户转化">代账客户转化</option>
                      <option value="园区批量推荐">园区批量推荐</option>
                      <option value="联合服务">联合服务</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium md:col-span-2">
                    补充说明
                    <textarea
                      value={partnerForm.message}
                      onChange={(event) => setPartnerForm({ ...partnerForm, message: event.target.value })}
                      className="min-h-28 rounded-xl border border-border bg-card px-4 py-3 font-normal outline-none transition-colors focus:border-primary"
                      placeholder="可以补充客户类型、合作诉求、希望对接时间等"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] px-6 text-sm font-semibold text-white shadow-lg shadow-primary/20"
                >
                  提交合作申请
                  <Send className="ml-2 size-4" />
                </button>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  提交后将自动生成合作申请邮件，请确认发送；发送后页面会展示姚经理电话和企业微信二维码。
                </p>
              </form>
            </FadeInSection>
          </div>
        </section>

        <section id="faq" className="bg-card px-6 py-20">
          <div className="mx-auto max-w-[960px]">
            <FadeInSection>
              <SectionHeading title={site.faqTitle} />
            </FadeInSection>
            <div className="mt-10 divide-y divide-border rounded-3xl border border-border bg-background">
              {site.faqs.map((faq) => (
                <div key={faq.q} className="p-6">
                  <h3 className="font-semibold">{faq.q}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-[1120px] overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#18243D,#2E3B66)] p-8 text-white md:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="text-sm font-medium text-white/70">{site.name}</p>
                <h2 className="mt-3 text-3xl font-semibold md:text-4xl">{site.finalCta.title}</h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">{site.finalCta.description}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <TrialButton onClick={() => setTrialOpen(true)} variant="dark">
                  {site.finalCta.primary}
                  <ArrowRight className="ml-2 size-4" />
                </TrialButton>
                <a
                  href={contactHref}
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  {site.finalCta.secondary}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {trialOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#18243D]/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[560px] rounded-[28px] bg-card p-6 shadow-[0_24px_80px_rgba(24,36,61,.24)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-primary">领取 7 天体验套餐</p>
                <h3 className="mt-2 text-2xl font-semibold">先注册，再领取体验权益</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  为了保存企业账套和试用数据，需要先用手机号完成注册或登录。进入产品后创建企业，即可按提示领取 7 天体验套餐。
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTrialOpen(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                aria-label="关闭"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-6 grid gap-3">
              {[
                ['1', '手机号注册/登录', '进入产品登录页，用手机号创建或登录账号。'],
                ['2', '创建企业账套', '填写企业名称、纳税人类型等基础信息，用于保存试用数据。'],
                ['3', '领取 7 天体验套餐', '进入体验流程后，先跑通工资、发票、流水和报表。'],
                ['4', '需要帮助就联系姚经理', '电话或企业微信都可以承接试用、开通和代理合作。'],
              ].map(([index, title, desc]) => (
                <div key={index} className="flex gap-3 rounded-2xl bg-background p-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                    {index}
                  </span>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a
                href={site.trialUrl}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] px-6 text-sm font-semibold text-white"
              >
                去注册并领取体验
                <ArrowRight className="ml-2 size-4" />
              </a>
              <a
                href={contactHref}
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border px-6 text-sm font-semibold text-foreground hover:bg-secondary"
              >
                先电话咨询
              </a>
            </div>
          </div>
        </div>
      )}

      {partnerSent && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#18243D]/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[520px] rounded-[28px] bg-card p-6 text-center shadow-[0_24px_80px_rgba(24,36,61,.24)]">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Headphones className="size-7" />
            </div>
            <h3 className="mt-5 text-2xl font-semibold">合作申请已生成</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              请在邮件客户端确认发送。你也可以直接联系姚经理，沟通代理政策、客户资源和合作方式。
            </p>
            <div className="mt-6 grid gap-4 rounded-3xl bg-background p-5 text-left sm:grid-cols-[120px_1fr]">
              <Image
                src="/images/wechat-qr.png"
                alt="姚经理企业微信二维码"
                width={120}
                height={120}
                className="rounded-2xl border border-border"
              />
              <div className="space-y-3 text-sm">
                <p className="font-semibold">{site.company.manager}</p>
                <a href={contactHref} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Phone className="size-4" />
                  {site.company.contact}
                </a>
                <a href={`mailto:${site.company.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Mail className="size-4" />
                  {site.company.email}
                </a>
                <p className="text-xs leading-5 text-muted-foreground">扫码添加企业微信，备注“代理合作”。</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPartnerSent(false)}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-border px-6 text-sm font-semibold hover:bg-secondary"
            >
              我知道了
            </button>
          </div>
        </div>
      )}

      <Footer site={site} />
    </div>
  )
}
