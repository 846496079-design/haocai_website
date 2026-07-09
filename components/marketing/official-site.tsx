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

const partnerLeadApiUrl = 'https://hcagent.ai-hc.cn/api/v1/agent-public-pool-leads/submit'
const partnerLeadMaxLength = 50

const companyImages = [
  { src: '/images/company/scene-01.jpg' },
  { src: '/images/company/scene-02.jpg' },
  { src: '/images/company/scene-03.jpg' },
  { src: '/images/company/scene-04.jpg' },
  { src: '/images/company/scene-05.jpg' },
  { src: '/images/company/scene-06.jpg' },
]

function trimPartnerLeadField(value: string) {
  return value.trim().slice(0, partnerLeadMaxLength)
}

const pageCopy = {
  cn: {
    sideNavTitle: '本页导览',
    companyHeroTitle: '用专业财税服务经验，打磨一套更易用的 AI 记账系统',
    companyHeroDesc:
      '好财集团长期深耕企业财税服务，账大师把工资、发票、银行流水、报表和申报资料整理成清晰流程，让小微企业、财务人员和代账机构都能更高效地完成月度财税工作。',
    professionalEyebrow: '专业能力',
    professionalTitle: '我们把财税专业性，落实到每一个可执行步骤',
    professionalDesc:
      '从资料采集、规则配置、异常核对到报表输出，账大师不是只展示结果，而是帮助用户看清楚每一步为什么要做、谁来确认、下一步处理什么。',
    cards: [
      ['财税服务经验', '围绕工资、发票、流水、报表和申报资料，沉淀小微企业高频财税流程。'],
      ['产品化方法', '把专业财务动作拆成普通用户能理解的任务，降低使用门槛。'],
      ['交付支持', '围绕演示、开通、导入、培训和复盘形成标准服务方法。'],
    ],
    focusTitle: '专业但不复杂：让客户拿到可看、可查、可复核的财税结果',
    focusSubtitle:
      '账大师强调流程可落地、结果可复核、责任可确认，帮助企业把分散资料转化为清晰的月度财税视图。',
    sceneEyebrow: '企业现场',
    sceneTitle: '真实团队、真实服务场景',
    sceneSubtitle: '从产品交流、客户沟通到服务复盘，把财税产品背后的团队能力展示给客户。',
    partnerTitle: '把 AI 记账卖成客户听得懂的刚需产品',
    partnerSubtitle:
      '适合财税服务商、代账机构、企业服务顾问和本地渠道。你负责客户信任和本地资源，我们提供产品、价格、演示资料、开通方法和服务支持。',
    partnerCards: [
      ['客户为什么买', '客户要的不是抽象 AI，而是更少录表、更少返工、更快看到账务结果。'],
      ['如何完成交付', '通过演示、开通、导入、培训和复盘，把复杂服务拆成标准步骤。'],
      ['适合谁合作', '代账机构、财税顾问、本地企业服务渠道都可以从存量客户切入。'],
      ['总部支持什么', '提供产品、品牌、资料清单、演示素材和合作政策对接。'],
      ['先从哪里开始', '从存量小微企业中筛选高频财税需求客户，先跑通样板。'],
      ['如何降低决策', '360 元/年和 7 天体验套餐，让客户更容易先试用。'],
    ],
  },
  jp: {
    sideNavTitle: 'ページ案内',
    companyHeroTitle: '財税サービスの実務経験を、使いやすい AI 記帳システムへ',
    companyHeroDesc:
      '好财集团は企業財税サービスの現場経験をもとに、給与、発票、銀行流水、帳票、申告資料を分かりやすい業務フローへ整理しています。',
    professionalEyebrow: '専門性',
    professionalTitle: '財税業務を、実行しやすいステップに落とし込む',
    professionalDesc:
      '資料収集、ルール設定、異常確認、帳票出力まで、各ステップの目的と確認事項を明確にします。',
    cards: [
      ['財税サービス経験', '給与、発票、銀行流水、帳票、申告資料の高頻度業務を整理。'],
      ['プロダクト化', '専門的な財務作業を、利用者が理解しやすいタスクへ分解。'],
      ['導入支援', 'デモ、開通、導入、研修、振り返りを標準化。'],
    ],
    focusTitle: '専門的でありながら、分かりやすい財税結果へ',
    focusSubtitle:
      '账大师は実行可能なフロー、確認可能な結果、明確な責任分担を重視します。',
    sceneEyebrow: 'サービス現場',
    sceneTitle: 'チームとサービスの現場感',
    sceneSubtitle: '企業サービス、顧客コミュニケーション、導入支援の雰囲気を伝える写真エリアです。',
    partnerTitle: 'AI 記帳を、顧客に伝わる財税サービスへ',
    partnerSubtitle:
      '財税サービス事業者、代行記帳機構、企業サービスチャネル向けに、製品、価格、資料、導入方法を支援します。',
    partnerCards: [
      ['顧客価値', '抽象的な AI ではなく、入力作業、確認作業、帳務確認の負担を減らします。'],
      ['導入方法', 'デモ、開通、導入、研修、振り返りを標準化します。'],
      ['協業対象', '財税サービス、代行記帳、地域チャネルから始められます。'],
      ['本部支援', '製品、ブランド、資料、デモ素材、協業方針を支援します。'],
      ['開始方法', '既存顧客の中から高頻度な財税ニーズを選定します。'],
      ['導入ハードル', '360 元/年と 7 日体験で、まず試しやすくします。'],
    ],
  },
  hk: {
    sideNavTitle: '本頁導覽',
    companyHeroTitle: '以專業財稅服務經驗，打磨更易用的 AI 記賬系統',
    companyHeroDesc:
      '好財集團長期深耕企業財稅服務，賬大師把工資、發票、銀行流水、報表和申報資料整理為清晰流程，協助小微企業、財務人員和代賬機構提升月度財稅效率。',
    professionalEyebrow: '專業能力',
    professionalTitle: '把財稅專業性，落實到每一個可執行步驟',
    professionalDesc:
      '從資料採集、規則配置、異常核對到報表輸出，賬大師協助用戶看清每一步目的、確認責任和下一步處理事項。',
    cards: [
      ['財稅服務經驗', '圍繞工資、發票、流水、報表和申報資料，沉澱高頻財稅流程。'],
      ['產品化方法', '把專業財務動作拆成普通用戶可理解的任務，降低使用門檻。'],
      ['交付支持', '圍繞演示、開通、導入、培訓和復盤形成標準服務方法。'],
    ],
    focusTitle: '專業但不複雜：讓客戶拿到可看、可查、可復核的財稅結果',
    focusSubtitle:
      '賬大師重視流程可落地、結果可復核、責任可確認，協助企業把分散資料轉化為清晰的月度財稅視圖。',
    sceneEyebrow: '企業現場',
    sceneTitle: '真實團隊、真實服務場景',
    sceneSubtitle: '從產品交流、客戶溝通到服務復盤，把財稅產品背後的團隊能力展示給客戶。',
    partnerTitle: '把 AI 記賬變成客戶聽得懂的剛需產品',
    partnerSubtitle:
      '適合財稅服務商、代賬機構、企業服務顧問和本地渠道。你負責客戶信任和本地資源，我們提供產品、價格、演示資料、開通方法和服務支持。',
    partnerCards: [
      ['客戶為什麼買', '客戶要的不是抽象 AI，而是更少錄表、更少返工、更快看到賬務結果。'],
      ['如何完成交付', '透過演示、開通、導入、培訓和復盤，把複雜服務拆成標準步驟。'],
      ['適合誰合作', '代賬機構、財稅顧問、本地企業服務渠道都可以從存量客戶切入。'],
      ['總部支持什麼', '提供產品、品牌、資料清單、演示素材和合作政策對接。'],
      ['先從哪裡開始', '從存量小微企業中篩選高頻財稅需求客戶，先跑通樣板。'],
      ['如何降低決策', '360 元/年和 7 天體驗套餐，讓客戶更容易先試用。'],
    ],
  },
}

const uiCopy = {
  cn: {
    requiredError: '该项为必填项',
    requiredInfo: '必填信息',
    requiredHint: '先留下最基础的联系方式，方便商务经理快速判断区域和对接节奏。',
    name: '姓名',
    namePlaceholder: '请填写联系人姓名',
    phone: '电话',
    phonePlaceholder: '手机号或座机',
    city: '城市',
    cityPlaceholder: '如上海、苏州、杭州',
    optionalInfo: '选填信息',
    optionalHint: '这些信息可以帮助我们提前准备更合适的代理政策和支持资料。',
    company: '公司/团队',
    companyPlaceholder: '公司或团队名称',
    role: '角色身份',
    choose: '请选择',
    customerScale: '客户资源规模',
    unsure: '暂不确定',
    cooperationType: '合作方式',
    message: '补充说明',
    messagePlaceholder: '可以补充客户类型、合作诉求、希望对接时间等',
    submit: '提交合作意向',
    partnerReceivedTitle: '合作意向已收到',
    partnerReceivedDesc: '已收到您的代理合作意向，我们将安排专人尽快与您对接；如需提前了解代理政策、资源扶持及合作细则，可直接联系姚经理咨询。',
    qrNote: '扫码添加企业微信，备注“代理合作”。',
    confirm: '我知道了',
    submitting: '提交中...',
    submitError: '提交暂时失败，请稍后再试，或直接联系姚经理。',
  },
  jp: {
    requiredError: '必須項目です',
    requiredInfo: '必須情報',
    requiredHint: 'まず連絡に必要な基本情報をご入力ください。',
    name: '氏名',
    namePlaceholder: 'ご担当者名',
    phone: '電話番号',
    phonePlaceholder: '携帯番号または固定電話',
    city: '都市',
    cityPlaceholder: '例：上海、東京、大阪',
    optionalInfo: '任意情報',
    optionalHint: 'ご記入いただくと、より適切な協業方針をご提案できます。',
    company: '会社/チーム',
    companyPlaceholder: '会社名またはチーム名',
    role: '役割',
    choose: '選択してください',
    customerScale: '顧客リソース規模',
    unsure: '未定',
    cooperationType: '協業方式',
    message: '補足',
    messagePlaceholder: '顧客タイプ、協業希望、連絡希望時間など',
    submit: '協業意向を送信',
    partnerReceivedTitle: '協業意向を受け付けました',
    partnerReceivedDesc: '協業意向を受け付けました。担当者より順次ご連絡いたします。代理方針、支援内容、協業条件を先に確認したい場合は、姚经理までお問い合わせください。',
    qrNote: '企業微信を追加し、「代理合作」とご記入ください。',
    confirm: '確認しました',
    submitting: '送信中...',
    submitError: '送信できませんでした。時間をおいて再試行するか、姚经理までお問い合わせください。',
  },
  hk: {
    requiredError: '此項為必填項',
    requiredInfo: '必填資料',
    requiredHint: '先留下基本聯絡方式，方便商務經理判斷區域和對接節奏。',
    name: '姓名',
    namePlaceholder: '請填寫聯絡人姓名',
    phone: '電話',
    phonePlaceholder: '手機號或座機',
    city: '城市',
    cityPlaceholder: '如上海、深圳、香港',
    optionalInfo: '選填資料',
    optionalHint: '資料越完整，越方便我們準備合適的代理政策和支持資料。',
    company: '公司/團隊',
    companyPlaceholder: '公司或團隊名稱',
    role: '角色身份',
    choose: '請選擇',
    customerScale: '客戶資源規模',
    unsure: '暫不確定',
    cooperationType: '合作方式',
    message: '補充說明',
    messagePlaceholder: '可補充客戶類型、合作訴求、希望對接時間等',
    submit: '提交合作意向',
    partnerReceivedTitle: '合作意向已收到',
    partnerReceivedDesc: '已收到您的代理合作意向，我們將安排專人盡快與您對接；如需提前了解代理政策、資源扶持及合作細則，可直接聯絡姚經理諮詢。',
    qrNote: '掃碼添加企業微信，備註「代理合作」。',
    confirm: '我知道了',
    submitting: '提交中...',
    submitError: '提交暫時失敗，請稍後再試，或直接聯絡姚經理。',
  },
}

const partnerOptionCopy = {
  cn: {
    roleOptions: ['代账机构', '财税顾问', '企业服务渠道', '软件服务商', '其他'],
    scaleOptions: ['10 家以内', '10-50 家', '50-200 家', '200 家以上'],
    cooperationOptions: [
      ['区域代理', '希望在本地城市或行业内长期推广。'],
      ['渠道分销', '已有企业客户资源，希望按成交转化合作。'],
      ['财税机构联合运营', '希望把 AI 工具纳入现有财税服务包。'],
      ['客户转介绍', '先从客户推荐开始。'],
    ],
  },
  jp: {
    roleOptions: ['代行記帳機構', '財税コンサルタント', '企業サービスチャネル', 'ソフトウェアサービス事業者', 'その他'],
    scaleOptions: ['10 社以内', '10-50 社', '50-200 社', '200 社以上'],
    cooperationOptions: [
      ['地域代理', '地域または特定業界で継続的に展開したい。'],
      ['チャネル販売', '既存の企業顧客リソースを活用して販売したい。'],
      ['財税機構との共同運営', 'AI ツールを既存の財税サービスに組み込みたい。'],
      ['顧客紹介', 'まず顧客紹介から協業を始めたい。'],
    ],
  },
  hk: {
    roleOptions: ['代賬機構', '財稅顧問', '企業服務渠道', '軟件服務商', '其他'],
    scaleOptions: ['10 家以內', '10-50 家', '50-200 家', '200 家以上'],
    cooperationOptions: [
      ['區域代理', '希望在本地城市或行業內長期推廣。'],
      ['渠道分銷', '已有企業客戶資源，希望按成交轉化合作。'],
      ['財稅機構聯合運營', '希望把 AI 工具納入現有財稅服務包。'],
      ['客戶轉介紹', '先從客戶推薦開始。'],
    ],
  },
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

function ProductSideNav({ site }: { site: SiteContent }) {
  return (
    <aside className="fixed left-6 top-24 z-40 hidden w-44 xl:block">
      <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white/75 p-2 shadow-[0_24px_70px_rgba(24,36,61,.12)] ring-1 ring-primary/5 backdrop-blur-xl">
        <p className="px-4 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{pageCopy[site.code].sideNavTitle}</p>
        <nav className="grid gap-1">
          {site.productNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-[#F3F6FF] hover:text-foreground"
            >
              <span className="size-1.5 rounded-full bg-primary/30 transition-colors group-hover:bg-primary" />
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  )
}

function CompanyImageStream({
  title,
  subtitle,
  eyebrow,
}: {
  title: string
  subtitle: string
  eyebrow: string
}) {
  const marqueeImages = [...companyImages, ...companyImages]

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-[1280px] overflow-hidden">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <div className="relative mt-12 overflow-hidden py-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />
          <div className="flex w-max gap-5 company-marquee hover:[animation-play-state:paused]">
            {marqueeImages.map((item, index) => (
              <div key={`${item.src}-${index}`} className="w-[280px] shrink-0 overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_18px_50px_rgba(24,36,61,.10)] md:w-[360px]">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={item.src}
                    alt={`${title} ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 280px, 360px"
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

type PartnerField =
  | 'name'
  | 'phone'
  | 'company'
  | 'city'
  | 'role'
  | 'customerScale'
  | 'cooperationType'
  | 'message'

const requiredPartnerFields: PartnerField[] = ['name', 'phone', 'city']

type OfficialPage = 'product' | 'company' | 'partners'

export default function OfficialSite({ site, page = 'product' }: { site: SiteContent; page?: OfficialPage }) {
  const contactHref = `tel:${site.company.contact}`
  const copy = pageCopy[site.code]
  const ui = uiCopy[site.code]
  const partnerOptions = partnerOptionCopy[site.code]
  const [trialOpen, setTrialOpen] = useState(false)
  const [partnerSent, setPartnerSent] = useState(false)
  const [partnerSubmitting, setPartnerSubmitting] = useState(false)
  const [partnerApiError, setPartnerApiError] = useState('')
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    phone: '',
    company: '',
    city: '',
    role: '',
    customerScale: '',
    cooperationType: '',
    message: '',
  })
  const [partnerErrors, setPartnerErrors] = useState<Partial<Record<PartnerField, string>>>({})

  function updatePartnerField(field: PartnerField, value: string) {
    setPartnerForm((form) => ({ ...form, [field]: value }))
    if (partnerApiError) {
      setPartnerApiError('')
    }
    if (partnerErrors[field]) {
      setPartnerErrors((errors) => ({ ...errors, [field]: undefined }))
    }
  }

  function fieldClass(field: PartnerField) {
    return `rounded-xl border bg-card px-4 font-normal outline-none transition-colors focus:border-primary ${
      partnerErrors[field] ? 'border-red-400' : 'border-border'
    }`
  }

  function fieldError(field: PartnerField) {
    return partnerErrors[field] ? (
      <p className="text-xs font-normal text-red-500">{partnerErrors[field]}</p>
    ) : null
  }

  async function submitPartnerForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: Partial<Record<PartnerField, string>> = {}
    requiredPartnerFields.forEach((field) => {
      if (!partnerForm[field].trim()) {
        nextErrors[field] = ui.requiredError
      }
    })

    if (Object.keys(nextErrors).length > 0) {
      setPartnerErrors(nextErrors)
      return
    }

    setPartnerErrors({})
    setPartnerApiError('')
    setPartnerSubmitting(true)

    const inviteCode = new URLSearchParams(window.location.search).get('inviteCode') || undefined
    const companyName = trimPartnerLeadField(partnerForm.company)
    const position = trimPartnerLeadField(partnerForm.role)
    const city = trimPartnerLeadField(partnerForm.city)
    const cooperationMode = trimPartnerLeadField(partnerForm.cooperationType)
    const remark = [
      `${ui.customerScale}：${partnerForm.customerScale || ui.unsure}`,
      `${ui.message}：${partnerForm.message || ui.unsure}`,
      `来源站点：${site.name}`,
      `页面地址：${window.location.href}`,
    ].join('\n')

    try {
      const response = await fetch(partnerLeadApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: partnerForm.name.trim(),
          contactPhone: partnerForm.phone.trim(),
          ...(companyName ? { companyName } : {}),
          ...(position ? { position } : {}),
          ...(city ? { city } : {}),
          ...(cooperationMode ? { cooperationMode } : {}),
          ...(inviteCode ? { inviteCode } : {}),
          remark,
        }),
      })

      const result = await response.json().catch(() => ({}))
      const message = result?.message || result?.msg || result?.detail

      if (!response.ok) {
        setPartnerApiError(message || ui.submitError)
        return
      }

      setPartnerSent(true)
    } catch {
      setPartnerApiError(ui.submitError)
    } finally {
      setPartnerSubmitting(false)
    }
  }

  function renderPartnerForm() {
    return (
      <form noValidate onSubmit={submitPartnerForm} className="rounded-[28px] border border-border bg-background p-6 shadow-[0_20px_60px_rgba(24,36,61,.10)]">
        <div>
          <p className="text-sm font-semibold">{ui.requiredInfo}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{ui.requiredHint}</p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            <span>{ui.name} <span className="text-red-500">*</span></span>
            <input
              value={partnerForm.name}
              onChange={(event) => updatePartnerField('name', event.target.value)}
              className={`h-12 ${fieldClass('name')}`}
              placeholder={ui.namePlaceholder}
            />
            {fieldError('name')}
          </label>
          <label className="grid gap-2 text-sm font-medium">
            <span>{ui.phone} <span className="text-red-500">*</span></span>
            <input
              value={partnerForm.phone}
              onChange={(event) => updatePartnerField('phone', event.target.value)}
              className={`h-12 ${fieldClass('phone')}`}
              placeholder={ui.phonePlaceholder}
            />
            {fieldError('phone')}
          </label>
          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            <span>{ui.city} <span className="text-red-500">*</span></span>
            <input
              value={partnerForm.city}
              onChange={(event) => updatePartnerField('city', event.target.value)}
              className={`h-12 ${fieldClass('city')}`}
              placeholder={ui.cityPlaceholder}
              maxLength={partnerLeadMaxLength}
            />
            {fieldError('city')}
          </label>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <p className="text-sm font-semibold">{ui.optionalInfo}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{ui.optionalHint}</p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">
            {ui.company}
            <input
              value={partnerForm.company}
              onChange={(event) => updatePartnerField('company', event.target.value)}
              className={`h-12 ${fieldClass('company')}`}
              placeholder={ui.companyPlaceholder}
              maxLength={partnerLeadMaxLength}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            {ui.role}
            <select
              value={partnerForm.role}
              onChange={(event) => updatePartnerField('role', event.target.value)}
              className={`h-12 ${fieldClass('role')}`}
            >
              <option value="">{ui.choose}</option>
              {partnerOptions.roleOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            {ui.customerScale}
            <select
              value={partnerForm.customerScale}
              onChange={(event) => updatePartnerField('customerScale', event.target.value)}
              className={`h-12 ${fieldClass('customerScale')}`}
            >
              <option value="">{ui.unsure}</option>
              {partnerOptions.scaleOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <div className="md:col-span-2">
            <p className="text-sm font-medium">{ui.cooperationType}</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {partnerOptions.cooperationOptions.map(([value, desc]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updatePartnerField('cooperationType', value)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    partnerForm.cooperationType === value
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <span className="block text-sm font-semibold">{value}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{desc}</span>
                </button>
              ))}
            </div>
          </div>
          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            {ui.message}
            <textarea
              value={partnerForm.message}
              onChange={(event) => updatePartnerField('message', event.target.value)}
              className={`min-h-28 py-3 ${fieldClass('message')}`}
              placeholder={ui.messagePlaceholder}
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={partnerSubmitting}
          className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] px-6 text-sm font-semibold text-white shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {partnerSubmitting ? ui.submitting : ui.submit}
          <Send className="ml-2 size-4" />
        </button>
        {partnerApiError && (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
            {partnerApiError}
          </p>
        )}
      </form>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar site={site} />

      <main className={page === 'product' ? 'xl:pl-44' : undefined}>
        {page === 'product' && <ProductSideNav site={site} />}
        {page === 'product' && (
          <>
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

        <section id="product" className="px-6 py-20">
          <div className="mx-auto grid max-w-[1280px] gap-8">
            <div>
              <FadeInSection>
                <SectionHeading title={site.painTitle} subtitle={site.painSubtitle} />
              </FadeInSection>
              <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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
              </div>
            </div>
          </div>
        </section>
          </>
        )}

        {page === 'company' && (
          <>
            <section className="relative overflow-hidden px-6 py-20 md:py-24">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_0%,rgba(91,108,255,0.14),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(34,197,94,0.10),transparent_28%)]" />
              <div className="mx-auto grid max-w-[1280px] items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
                <FadeInSection>
                  <div>
                    <p className="text-sm font-semibold text-primary">{site.companyIntro.eyebrow}</p>
                    <h1 className="mt-4 text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                      {copy.companyHeroTitle}
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                      {copy.companyHeroDesc}
                    </p>
                  </div>
                </FadeInSection>
                <FadeInSection delay={120}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {site.companyIntro.stats.map((item) => (
                      <div key={item.label} className="rounded-3xl border border-border bg-card p-6 shadow-[0_10px_30px_rgba(24,36,61,.08)]">
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className="mt-2 text-3xl font-semibold">{item.value}</p>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </FadeInSection>
              </div>
            </section>

            <section className="px-6 py-20">
              <div className="mx-auto grid max-w-[1280px] gap-8 lg:grid-cols-3">
                {[
                  ...copy.cards,
                ].map(([title, desc], index) => (
                  <FadeInSection key={title}>
                    <div className="h-full rounded-3xl border border-border bg-card p-7">
                      <IconBox icon={index === 1 ? 'spark' : index === 2 ? 'users' : 'calculator'} />
                      <h2 className="mt-5 text-xl font-semibold">{title}</h2>
                      <p className="mt-4 text-sm leading-7 text-muted-foreground">{desc}</p>
                    </div>
                  </FadeInSection>
                ))}
              </div>
            </section>

            <section className="bg-card px-6 py-20">
              <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                <FadeInSection>
                  <SectionHeading
                    align="left"
                    eyebrow={copy.professionalEyebrow}
                    title={copy.professionalTitle}
                    subtitle={copy.professionalDesc}
                  />
                </FadeInSection>
                <FadeInSection delay={120}>
                  <div className="grid gap-4">
                    {site.companyIntro.focus.map((item, index) => (
                      <div key={item} className="flex gap-4 rounded-3xl border border-border bg-background p-5">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                          {index + 1}
                        </span>
                        <p className="text-sm leading-7 text-muted-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </FadeInSection>
              </div>
            </section>

            <CompanyImageStream
              eyebrow={copy.sceneEyebrow}
              title={copy.sceneTitle}
              subtitle={copy.sceneSubtitle}
            />
          </>
        )}

        {page === 'partners' && (
          <section className="bg-card px-6 py-20 md:py-24">
            <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[1fr_1fr]">
              <FadeInSection>
                <div>
                  <SectionHeading
                    align="left"
                    eyebrow="代理合作意向"
                    title={copy.partnerTitle}
                    subtitle={copy.partnerSubtitle}
                  />
                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {copy.partnerCards.map(([title, desc]) => (
                      <div key={title} className="rounded-2xl border border-border bg-background p-4">
                        <p className="font-semibold">{title}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInSection>

              <FadeInSection delay={120}>
                {renderPartnerForm()}
              </FadeInSection>
            </div>
          </section>
        )}
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
            <div className="mt-6">
              <a
                href={site.trialUrl}
                className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] px-6 text-sm font-semibold text-white"
              >
                去注册并领取体验
                <ArrowRight className="ml-2 size-4" />
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
            <h3 className="mt-5 text-2xl font-semibold">{ui.partnerReceivedTitle}</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {ui.partnerReceivedDesc}
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
                <p className="text-xs leading-5 text-muted-foreground">{ui.qrNote}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPartnerSent(false)}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-border px-6 text-sm font-semibold hover:bg-secondary"
            >
              {ui.confirm}
            </button>
          </div>
        </div>
      )}

      <Footer site={site} />
    </div>
  )
}
