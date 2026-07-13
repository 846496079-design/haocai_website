'use client'

import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Briefcase,
  Building2,
  Calculator,
  CheckCircle2,
  Clock3,
  Code2,
  Coins,
  Cpu,
  Factory,
  FileText,
  Globe2,
  GraduationCap,
  Hammer,
  Headphones,
  HeartPulse,
  Landmark,
  Layers3,
  Leaf,
  Lock,
  Mail,
  MessageSquareText,
  Minus,
  Phone,
  Rocket,
  ScanLine,
  Send,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  TrendingUp,
  Truck,
  UtensilsCrossed,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import Image from 'next/image'
import type { FormEvent, ReactNode } from 'react'
import { Fragment, useEffect, useMemo, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FadeInSection from '@/components/ui/fade-in-section'
import type { IconKey, SiteContent } from '@/lib/site-content'
import { getNewsArticle, newsArticles, type NewsArticle } from '@/lib/news-content'

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
  store: Store,
  factory: Factory,
  truck: Truck,
  food: UtensilsCrossed,
  health: HeartPulse,
  education: GraduationCap,
  code: Code2,
  retail: ShoppingBag,
  build: Hammer,
  cpu: Cpu,
  briefcase: Briefcase,
  leaf: Leaf,
  scan: ScanLine,
  coins: Coins,
  rocket: Rocket,
  globe: Globe2,
}

const partnerLeadApiUrl = 'https://hcagent.ai-hc.cn/api/v1/agent-public-pool-leads/submit'
const trialLeadApiUrl = 'https://hcagent.ai-hc.cn/api/v1/customer-lead-pool-leads/submit'
const partnerLeadMaxLength = 50
const trialContactNameMaxLength = 50
const trialContactPhoneMaxLength = 20

// Mac 桌面端下载地址
const macDownloadUrl =
  'https://douteng.oss-cn-hangzhou.aliyuncs.com/%E5%A5%BD%E8%B4%A2%E8%B4%A6%E5%A4%A7%E5%B8%88_1.0.0_aarch64.dmg'

const companyImages = [
  { src: '/images/company/scene-01.jpg' },
  { src: '/images/company/scene-02.jpg' },
  { src: '/images/company/scene-03.jpg' },
  { src: '/images/company/scene-04.jpg' },
  { src: '/images/company/scene-05.jpg' },
  { src: '/images/company/scene-06.jpg' },
]

// 分站点产品截图
const screenshotSrc = {
  cn: '/images/product-mobile-cn.png',
  jp: '/images/product-mobile-jp.png',
  hk: '/images/product-mobile-hk.png',
} as const

// 分站点竖版 Logo（用于品牌时刻）
const brandLogoV = {
  cn: '/images/brand/zds-logo-v-cn-web.png',
  jp: '/images/brand/zds-logo-v-jp-web.png',
  hk: '/images/brand/zds-logo-v-hk-web.png',
} as const

function trimPartnerLeadField(value: string) {
  return value.trim().slice(0, partnerLeadMaxLength)
}

const pageCopy = {
  cn: {
    sideNavTitle: '本页导览',
    companyHeroTitle: '让天下企业拥有一个 AI 财税大脑',
    companyHeroDesc:
      '账大师（上海）人工智能技术有限公司成立于 2014 年，专注于人工智能、大数据、云计算与企业财务服务的融合创新。我们以账大师为产品载体，用 AI 让企业财务管理更智能、更高效、更易协同。',
    professionalEyebrow: '专业能力',
    professionalTitle: '以 AI 技术，连接财务流程与经营决策',
    professionalDesc:
      '从资料归集、智能处理、数据核对到经营分析，账大师帮助企业把高频财务工作沉淀为清晰流程，并为管理者提供更及时的经营信息参考。',
    focusTitle: '站在月球看地球，大风流创新，大风流创业',
    focusSubtitle:
      '账大师强调流程可落地、结果可复核、责任可确认，帮助企业把分散资料转化为清晰的月度财税视图。',
    sceneEyebrow: '企业现场',
    sceneTitle: '真实团队、真实服务场景',
    sceneSubtitle: '从产品交流、客户沟通到服务复盘，把账大师背后的团队能力展示给客户。',
  },
  jp: {
    sideNavTitle: 'ページ案内',
    companyHeroTitle: 'すべての企業に AI 財税ブレーンを',
    companyHeroDesc:
      '账大师（上海）人工智能技术有限公司は 2014 年に設立され、AI、大数据、クラウドと企業財務サービスの融合を探求しています。',
    professionalEyebrow: '専門性',
    professionalTitle: 'AI で財務プロセスと経営判断をつなぐ',
    professionalDesc:
      '情報収集、照合、分析までの高頻度な業務を整理し、企業が経営情報をより早く把握できるよう支援します。',
    focusTitle: '専門的でありながら、分かりやすい財税結果へ',
    focusSubtitle:
      '账大师は実行可能なフロー、確認可能な結果、明確な責任分担を重視します。',
    sceneEyebrow: 'サービス現場',
    sceneTitle: 'チームとサービスの現場感',
    sceneSubtitle: '企業サービス、顧客コミュニケーション、導入支援の雰囲気を伝える写真エリアです。',
  },
  hk: {
    sideNavTitle: '本頁導覽',
    companyHeroTitle: '讓天下企業擁有一個 AI 財稅大腦',
    companyHeroDesc:
      '賬大師（上海）人工智能技術有限公司成立於 2014 年，專注人工智能、大數據、雲計算與企業財務服務的融合創新，持續探索更智能、更高效、更易協同的企業財務管理方式。',
    professionalEyebrow: '專業能力',
    professionalTitle: '以 AI 技術，連接財務流程與經營決策',
    professionalDesc:
      '從資料歸集、智能處理、數據核對到經營分析，賬大師協助企業把高頻財務工作沉澱為清晰流程，並提供更及時的經營信息參考。',
    focusTitle: '專業但不複雜：讓客戶拿到可看、可查、可復核的財稅結果',
    focusSubtitle:
      '賬大師重視流程可落地、結果可復核、責任可確認，協助企業把分散資料轉化為清晰的月度財稅視圖。',
    sceneEyebrow: '企業現場',
    sceneTitle: '真實團隊、真實服務場景',
    sceneSubtitle: '從產品交流、客戶溝通到服務復盤，把賬大師背後的團隊能力展示給客戶。',
  },
}

const productIntroCopy = {
  cn: {
    eyebrow: '产品中心',
    status: '主推产品',
    name: '账大师 · AI 财务',
    title: '以账大师为核心，把财税工作装进一套 AI 流程',
    subtitle: '账大师是我们唯一主推的产品——把工资、发票、流水、报税和经营查看做深、做透。',
    imageAlt: '账大师移动端 AI 三步智能记账界面',
    imageLabel: '真实产品截图',
    imageDesc: '展示移动端 AI 三步智能记账、银行流水同步和下一步建议。',
    description:
      '面向小微企业、财务人员和代账机构，把工资、发票、银行流水、核对、报表和待办提醒统一到一套流程里，用 AI 把重复整理和基础核对做掉。',
    bullets: ['360 元/年 · 一天一块钱', 'AI 三步智能记账', '移动端与电脑端协同', '适合财税和代账场景'],
  },
  jp: {
    eyebrow: '製品センター',
    status: '主力製品',
    name: '帳マスター · AI 財務',
    title: '帳マスターを中心に、日々の財務確認を一つの流れへ',
    subtitle: '給与、請求書、銀行明細、照合、申告資料の確認を、役割ごとに連携しやすい業務フローにまとめます。',
    imageAlt: '帳マスターのモバイル AI 記帳画面',
    imageLabel: 'モバイル画面の例',
    imageDesc: 'AI記帳、銀行明細の同期、次の対応事項をモバイルで確認できます。',
    description: '給与、請求書、銀行明細、照合、帳票、タスク確認を一つのフローにまとめます。',
    bullets: ['年額 360 元', 'AI 3ステップ記帳', 'Web・モバイル対応', '財務・会計サービス向け'],
  },
  hk: {
    eyebrow: '產品中心',
    status: '主推產品',
    name: '賬大師 · AI 財務',
    title: '以賬大師為核心，把日常財務工作整合到同一流程',
    subtitle: '把工資、發票、銀行流水、核對及申報資料查看，整理為不同角色都容易協同的工作方式。',
    imageAlt: '賬大師流動端 AI 智能記賬畫面',
    imageLabel: '流動端產品畫面',
    imageDesc: '可在流動端查看 AI 記賬、銀行流水同步及下一步處理建議。',
    description: '面向小微企業、財務人員和代賬機構，把工資、發票、銀行流水、核對、報表和待辦提醒統一到一套流程裡。',
    bullets: ['360 元/年 · 一天一塊錢', 'AI 三步智能記賬', '移動端與電腦端協同', '適合財稅和代賬場景'],
  },
}

const newsCopy = {
  cn: {
    eyebrow: '新闻中心',
    title: '账大师动态与 AI 财税观察',
    subtitle: '关注账大师的产品实践、企业交流与 AI 财税观察。',
    all: '全部',
    back: '返回新闻中心',
    read: '阅读全文',
  },
  jp: {
    eyebrow: 'ニュース',
    title: '账大师ニュースと AI 財税の観察',
    subtitle: '账大师の製品実践、企業交流、AI 財税の取り組みを紹介します。',
    all: 'すべて',
    back: 'ニュース一覧へ戻る',
    read: '全文を読む',
  },
  hk: {
    eyebrow: '新聞中心',
    title: '賬大師動態與 AI 財稅觀察',
    subtitle: '關注賬大師的產品實踐、企業交流與 AI 財稅觀察。',
    all: '全部',
    back: '返回新聞中心',
    read: '閱讀全文',
  },
}

const homeCopy = {
  cn: {
    productPeek: '进入产品中心',
    seePricing: '查看定价',
    followWechat: '关注公众号',
    featuresMore: '查看全部核心功能',
    fullWorkflow: '查看完整工作流程',
    fullComparison: '查看完整功能对比表',
    viewCases: '查看全部客户案例',
    aboutUs: '了解账大师',
    moreNews: '进入新闻中心',
    industryTeaserTitle: '各行各业的企业，都在用账大师',
    industryTeaserSub: '面向不同行业的高频财税工作场景，提供清晰、可协同的处理方式。',
    philoTeaserTitle: '不只是记账工具，更是企业的 AI 财税伙伴',
    newsTeaserSub: '关注账大师的产品实践、企业交流与 AI 财税观察。',
    navCards: [
      ['客户案例', '查看不同企业在日常财税工作中的匿名使用反馈。', '/cases/'],
      ['代理合作', '万亿级企业服务市场，与账大师一起把 AI 记账带给更多企业。', '/partners/'],
      ['加入我们', '财务疑难处理与全栈开发两个方向正在招募，欢迎直接投递简历。', '/join/'],
    ],
  },
  jp: {
    productPeek: '製品センターへ',
    seePricing: '料金を見る',
    followWechat: '公式アカウント',
    featuresMore: '主な機能を表示',
    fullWorkflow: '作業フローを見る',
    fullComparison: '機能比較を見る',
    viewCases: '顧客事例を見る',
    aboutUs: '账大师について',
    moreNews: 'ニュースへ',
    industryTeaserTitle: 'さまざまな業種の企業が账大师を利用',
    industryTeaserSub: 'EC・小売、飲食、IT など幅広い業種で利用されています。',
    philoTeaserTitle: '記帳ツールを超えた、企業の AI 財税パートナー',
    newsTeaserSub: '账大师の製品実践、企業交流、AI 財税の取り組みを紹介します。',
    navCards: [
      ['顧客事例', '多くの企業が账大师を利用しています。', '/cases/'],
      ['代理連携', '企業サービス市場で账大师と協業しませんか。', '/partners/'],
      ['採用情報', '財務難題対応とフルスタック開発を募集中。', '/join/'],
    ],
  },
  hk: {
    productPeek: '進入產品中心',
    seePricing: '查看定價',
    followWechat: '關注公眾號',
    featuresMore: '查看全部核心功能',
    fullWorkflow: '查看完整工作流程',
    fullComparison: '查看完整功能對比表',
    viewCases: '查看全部客戶案例',
    aboutUs: '了解賬大師',
    moreNews: '進入新聞中心',
    industryTeaserTitle: '各行各業的企業，都在用賬大師',
    industryTeaserSub: '面向不同行業的高頻財稅工作場景，提供清晰、可協同的處理方式。',
    philoTeaserTitle: '不只是記賬工具，更是企業的 AI 財稅夥伴',
    newsTeaserSub: '關注賬大師的產品實踐、企業交流與 AI 財稅觀察。',
    navCards: [
      ['客戶案例', '查看不同企業在日常財稅工作中的匿名使用反饋。', '/cases/'],
      ['代理合作', '萬億級企業服務市場，與賬大師一起把 AI 記賬帶給更多企業。', '/partners/'],
      ['加入我們', '財務疑難處理與全棧開發兩個方向正在招募，歡迎直接投遞簡歷。', '/join/'],
    ],
  },
}

const trialCopy = {
  cn: {
    eyebrow: '领取 7 天体验套餐',
    title: '留下信息，获取试用政策和开通指引',
    desc: '当前试用流程先介绍政策优惠并收集客户信息，后续由工作人员根据联系方式对接试用套餐、开通方式和使用范围。',
    steps: [
      ['1', '政策说明', '说明 7 天体验套餐、360 元/年定价和适用场景。'],
      ['2', '资料登记', '留下联系人、电话和邀请码或邀请人电话，便于识别来源。'],
      ['3', '人工对接', '工作人员确认需求后，再安排试用开通和使用指引。'],
    ],
    contactName: '联系人',
    contactNamePlaceholder: '请填写联系人姓名',
    contactPhone: '电话',
    contactPhonePlaceholder: '手机号或座机',
    inviteCode: '邀请人电话或邀请码',
    inviteCodePlaceholder: '如邀请人手机号或邀请码 A12345',
    submit: '立即使用',
    successTitle: '试用申请已收到',
    successDesc: '我们会根据你留下的信息安排人员对接试用政策、优惠和开通说明。',
  },
  jp: {
    eyebrow: '7 日体験パッケージ',
    title: '情報を残して、試用政策と開通案内を受け取る',
    desc: '現在の試用フローは政策説明と顧客情報収集までです。担当者が試用内容、開通方法、利用範囲をご案内します。',
    steps: [
      ['1', '政策説明', '7 日体験、360 元/年料金、適用シーンを説明します。'],
      ['2', '情報登録', '担当者名、電話、招待コードまたは紹介者電話番号を残します。'],
      ['3', '担当者連絡', '確認後、試用開通と利用案内を行います。'],
    ],
    contactName: '担当者',
    contactNamePlaceholder: '担当者名',
    contactPhone: '電話',
    contactPhonePlaceholder: '携帯または固定電話',
    inviteCode: '紹介者電話番号または招待コード',
    inviteCodePlaceholder: '例：紹介者電話番号、招待コード A12345',
    submit: '試用申請を送信',
    successTitle: '試用申請を受け付けました',
    successDesc: '担当者より試用政策、優待、開通説明をご連絡します。',
  },
  hk: {
    eyebrow: '領取 7 天體驗套餐',
    title: '留下信息，獲取試用政策和開通指引',
    desc: '目前試用流程先介紹政策優惠並收集客戶信息，後續由工作人員根據聯絡方式對接試用套餐、開通方式和使用範圍。',
    steps: [
      ['1', '政策說明', '說明 7 天體驗套餐、360 元/年定價和適用場景。'],
      ['2', '資料登記', '留下聯絡人、電話和邀請碼或邀請人電話，便於識別來源。'],
      ['3', '人工對接', '工作人員確認需求後，再安排試用開通和使用指引。'],
    ],
    contactName: '聯絡人',
    contactNamePlaceholder: '請填寫聯絡人姓名',
    contactPhone: '電話',
    contactPhonePlaceholder: '手機號或座機',
    inviteCode: '邀請人電話或邀請碼',
    inviteCodePlaceholder: '如邀請人手機號或邀請碼 A12345',
    submit: '提交試用申請',
    successTitle: '試用申請已收到',
    successDesc: '我們會根據你留下的信息安排人員對接試用政策、優惠和開通說明。',
  },
}

const jobCopy = {
  cn: {
    eyebrow: '加入我们',
    title: '两个方向，寻找能把复杂问题真正解决的人',
    subtitle: '我们重视专业能力、解决复杂问题的韧性，以及把想法落成结果的执行力。',
    manager: '人事经理电话',
    phone: '18317138302',
    email: 'haocaiwang2022@126.com',
    emailLabel: '简历投递邮箱',
    jobs: [
      {
        title: '财务疑难问题处理方向',
        salary: '期望薪资面议',
        responsibilities: [
          '注册攻坚：解决新公司设立中的特殊行业审批、地址异常、税务核定受阻等复杂问题。',
          '变更处理：处理跨区迁移、复杂股权调整、法人变更等引发的工商税务遗留问题。',
          '注销清算：主导非正常户解除、税务稽查应对、吊销转注销等全流程疑难注销案件。',
          '外部协调：对接工商、税务等政府部门，沟通疑难问题并推动解决。',
        ],
        requirements: [
          '统招本科及以上，财税或法学相关专业，持中级会计师、税务师、CPA 优先。',
          '至少 1 年以上财务经验。',
          '熟悉各地工商税务实操政策，有处理非正常户、跨省迁移或复杂注销的实战案例。',
          '沟通协调能力强，能独立撰写申诉材料，抗压能力强。',
        ],
      },
      {
        title: '全栈开发工程师',
        salary: '期望薪资面议',
        responsibilities: [
          '需求深度拆解：深入理解内部业务痛点，将模糊需求转化为清晰系统产品方案。',
          '从 0 到 1 构建：负责企业内部效能系统的前后端架构、核心代码和数据库设计。',
          '自动化驱动：利用自动化脚本、API 集成或 AI 技术，帮助业务部门减少日常机械性工作。',
          '全生命周期管理：独立负责需求、开发、测试、部署和后续迭代维护。',
        ],
        requirements: [
          '5 年以上开发经验，熟练掌握 React/Vue、Node.js/Python/Java/Go 等技术栈和主流数据库。',
          '具备产品思维，能主动站在业务视角思考工具如何更好用、更高效。',
          '有独立主导 Web 应用或企业级 SaaS 系统从 0 到 1 上线经验，面试需提供项目演示或架构思路。',
          '沟通能力强，能把复杂技术逻辑解释给非技术人员。',
          '具备 LLM API、Agent 开发、AI 中间件架构经验，有开源项目或独立产品经验优先。',
        ],
      },
    ],
  },
  jp: {
    eyebrow: '採用情報',
    title: '複雑な問題を実際に解決できる人を求めています',
    subtitle: '専門性、複雑な課題を解決する粘り強さ、そして着実な実行力を大切にしています。',
    manager: '採用担当電話',
    phone: '18317138302',
    email: 'haocaiwang2022@126.com',
    emailLabel: '履歴書送付先',
    jobs: [
      {
        title: '財務難題対応',
        salary: '給与は面談にて相談',
        responsibilities: ['特殊業種の設立、住所異常、税務認定などの複雑課題を処理。', '移転、持分調整、法人変更に伴う工商税務課題を処理。', '非正常户解除、税務調査対応、注销清算案件を推進。'],
        requirements: ['本科以上、財税または法学関連専攻。', '1 年以上の財務経験。', '工商税務実務政策に詳しく、複雑案件の実務経験がある方。'],
      },
      {
        title: 'フルスタック開発エンジニア',
        salary: '給与は面談にて相談',
        responsibilities: ['社内業務課題をシステム方案へ整理。', '企業効率化システムの前後端、DB、アーキテクチャを構築。', '自動化と AI 技術で反復作業を削減。'],
        requirements: ['5 年以上の開発経験。', 'React/Vue、Node.js/Python/Java/Go、主流 DB に精通。', '0 から 1 の Web/SaaS 開発経験、LLM/Agent 経験歓迎。'],
      },
    ],
  },
  hk: {
    eyebrow: '加入我們',
    title: '兩個方向，尋找能把複雜問題真正解決的人',
    subtitle: '我們重視專業能力、解決複雜問題的韌性，以及把想法落成結果的執行力。',
    manager: '人事經理電話',
    phone: '18317138302',
    email: 'haocaiwang2022@126.com',
    emailLabel: '簡歷投遞郵箱',
    jobs: [
      {
        title: '財務疑難問題處理方向',
        salary: '期望薪資面議',
        responsibilities: ['註冊攻堅：解決特殊行業審批、地址異常、稅務核定受阻等問題。', '變更處理：處理跨區遷移、複雜股權調整、法人變更等遺留問題。', '註銷清算：主導非正常戶解除、稅務稽查應對、吊銷轉註銷等案件。', '外部協調：對接工商、稅務等政府部門並推動解決。'],
        requirements: ['本科及以上，財稅或法學相關專業，中級會計師、稅務師、CPA 優先。', '至少 1 年以上財務經驗。', '熟悉工商稅務實操政策，有複雜案件實戰案例。', '溝通協調能力強，能獨立撰寫申訴材料，抗壓能力強。'],
      },
      {
        title: '全棧開發工程師',
        salary: '期望薪資面議',
        responsibilities: ['深入理解內部業務痛點，將模糊需求轉化為清晰系統產品方案。', '負責企業內部效能系統的前後端架構、核心代碼和數據庫設計。', '利用自動化腳本、API 集成或 AI 技術，減少日常機械性工作。', '獨立負責需求、開發、測試、部署和後續迭代維護。'],
        requirements: ['5 年以上開發經驗，熟悉 React/Vue、Node.js/Python/Java/Go 和主流數據庫。', '具備產品思維，能站在業務視角思考工具效率。', '有 Web 應用或企業級 SaaS 系統從 0 到 1 上線經驗。', '具備 LLM API、Agent 開發或 AI 中間件經驗優先。'],
      },
    ],
  },
}

const uiCopy = {
  cn: {
    requiredError: '该项为必填项',
    contactNameLengthError: '联系人请填写 1 至 50 个字符',
    contactPhoneLengthError: '电话请填写 1 至 20 个字符',
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
    inviteCode: '邀请码/邀请人电话',
    inviteCodePlaceholder: '如邀请码 A12345，或邀请人手机号',
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
    contactNameLengthError: '担当者名は 1〜50 文字で入力してください',
    contactPhoneLengthError: '電話番号は 1〜20 文字で入力してください',
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
    inviteCode: '招待コード/紹介者電話番号',
    inviteCodePlaceholder: '例：招待コード A12345、または紹介者の電話番号',
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
    contactNameLengthError: '聯絡人請填寫 1 至 50 個字符',
    contactPhoneLengthError: '電話請填寫 1 至 20 個字符',
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
    inviteCode: '邀請碼/邀請人電話',
    inviteCodePlaceholder: '如邀請碼 A12345，或邀請人手機號',
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

const mobileContentCopy = {
  cn: { expand: '展开查看', faqExpand: '展开', features: '查看全部核心功能', roles: '按角色查看使用方式', workflow: '查看完整工作流程', focus: '查看我们的专业服务重点', output: '产出' },
  jp: { expand: '表示', faqExpand: '表示', features: '主な機能を表示', roles: '役割別の利用方法を表示', workflow: '全体の作業フローを表示', focus: '専門サービスの重点を表示', output: 'アウトプット' },
  hk: { expand: '展開查看', faqExpand: '展開', features: '查看全部核心功能', roles: '按角色查看使用方式', workflow: '查看完整工作流程', focus: '查看我們的專業服務重點', output: '產出' },
} as const

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
      : 'bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] text-white shadow-lg shadow-primary/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30'

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
  level = 'h2',
  titleClassName,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  level?: 'h1' | 'h2'
  titleClassName?: string
}) {
  const HeadingTag = level
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      {eyebrow && (
        <p className={`mb-3 inline-flex items-center gap-2 text-sm font-semibold text-primary ${align === 'center' ? 'justify-center' : ''}`}>
          <span className="inline-block h-1 w-1 rounded-full bg-primary" />
          {eyebrow}
        </p>
      )}
      <HeadingTag className={titleClassName ?? 'text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl'}>
        {title}
      </HeadingTag>
      {subtitle && (
        <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  )
}

function MobileDisclosure({ title, actionLabel, children }: { title: string; actionLabel: string; children: ReactNode }) {
  return (
    <details className="rounded-2xl border border-border bg-card px-4 py-3 md:hidden">
      <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
        {title}
        <span className="float-right text-xs font-normal text-primary">{actionLabel}</span>
      </summary>
      <div className="mt-4 border-t border-border pt-4">{children}</div>
    </details>
  )
}

function IconBox({ icon, tone = 'brand' }: { icon: IconKey; tone?: 'brand' | 'plain' }) {
  const Icon = icons[icon]
  if (tone === 'brand') {
    return (
      <div className="icon-box flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] text-white shadow-lg shadow-primary/25">
        <Icon className="size-5" />
      </div>
    )
  }
  return (
    <div className="icon-box flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
      <Icon className="size-5" />
    </div>
  )
}

function ComparisonCell({ value }: { value: string }) {
  if (value === '✓') {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-status-online/12 text-status-online">
        <CheckCircle2 className="size-4" />
      </span>
    )
  }
  if (value === '—') {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-text-tertiary">
        <Minus className="size-4" />
      </span>
    )
  }
  return <span className="text-sm text-muted-foreground">{value}</span>
}

function CompanyImageStream({ title, subtitle, eyebrow }: { title: string; subtitle: string; eyebrow: string }) {
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
                  <Image src={item.src} alt={`${title} ${index + 1}`} fill sizes="(max-width: 768px) 280px, 360px" className="object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const touchpointCopy = {
  cn: {
    eyebrow: '开始使用',
    title: '扫码关注账大师公众号',
    subtitle: '了解试用政策与使用指引，也可以直接在线开始使用。',
    wechatTitle: '关注公众号',
    wechatDesc: '微信扫描二维码，关注「账大师」公众号。',
    wechatNote: '微信扫一扫',
    webTitle: '网页版立即使用',
    webDesc: '填写信息后跳转产品登录页，电脑浏览器随时随地记账报税。',
    webCta: '立即使用',
    macTitle: 'Mac 桌面端下载',
    macDesc: '适用于 Apple 芯片 Mac，桌面端集中处理财税工作。',
    macCta: '下载 Mac 版',
  },
  jp: {
    eyebrow: 'はじめる',
    title: '公式アカウントを追加',
    subtitle: '利用案内を確認し、Web 版からすぐに始められます。',
    wechatTitle: '公式アカウント',
    wechatDesc: 'WeChat で「账大师」公式アカウントを追加し、料金と 7 日体験を確認してご利用ください。',
    wechatNote: 'WeChat でスキャン',
    webTitle: 'Web 版を使う',
    webDesc: '情報入力後にログインページへ移動し、ブラウザでご利用いただけます。',
    webCta: '今すぐ使う',
    macTitle: 'Mac 版ダウンロード',
    macDesc: 'Apple シリコン搭載 Mac でご利用いただけます。',
    macCta: 'Mac 版をDL',
  },
  hk: {
    eyebrow: '開始使用',
    title: '掃碼關注賬大師公眾號',
    subtitle: '了解試用政策與使用指引，也可以直接在線開始使用。',
    wechatTitle: '關注公眾號',
    wechatDesc: '微信掃碼關注「賬大師」公眾號，了解 360 元/年政策與 7 天體驗，並在手機上開始記賬。',
    wechatNote: '微信掃一掃',
    webTitle: '網頁版立即使用',
    webDesc: '填寫信息後跳轉產品登錄頁，電腦瀏覽器隨時隨地記賬報稅。',
    webCta: '立即使用',
    macTitle: 'Mac 桌面端下載',
    macDesc: '適用於 Apple 芯片 Mac，集中處理財稅工作。',
    macCta: '下載 Mac 版',
  },
} as const

function TouchpointsSection({
  site,
  onTrial,
  dark = false,
  compact = false,
}: {
  site: SiteContent
  onTrial: () => void
  dark?: boolean
  compact?: boolean
}) {
  const t = touchpointCopy[site.code]
  const qr = site.wechat?.qr ?? '/images/wechat-official-qr.png'
  return (
    <section id="start" className={`px-6 ${compact ? 'border-y border-border bg-card py-14 md:py-16' : 'py-20'} ${dark ? '' : ''}`}>
      <div className="mx-auto max-w-[1280px]">
        <FadeInSection visibleOnLoad={compact}>
          <SectionHeading align={compact ? 'left' : 'center'} eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />
        </FadeInSection>
        <div className={`mt-8 grid overflow-hidden rounded-[28px] border border-border ${compact ? 'bg-background' : 'bg-card shadow-[0_16px_42px_rgba(0,0,0,.24)]'} md:grid-cols-[auto_1fr_auto_auto] md:items-center`}>
          <FadeInSection visibleOnLoad={compact}>
            <div className="border-b border-border p-5 md:border-b-0 md:border-r md:p-6">
              <div className="relative mx-auto size-28 overflow-hidden rounded-2xl bg-white p-1.5">
                <Image src={qr} alt={t.wechatNote} fill sizes="112px" className="object-contain p-1.5" />
              </div>
            </div>
          </FadeInSection>
          <FadeInSection delay={80} visibleOnLoad={compact}>
            <div className="p-6 md:p-7">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><MessageSquareText className="size-4" />{t.wechatTitle}</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{t.wechatDesc}</p>
              <p className="mt-4 text-base font-semibold text-foreground">{t.webTitle}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{t.webDesc}</p>
            </div>
          </FadeInSection>
          <FadeInSection delay={120} visibleOnLoad={compact}>
            <div className="px-6 pb-6 md:px-7 md:pb-0">
              <button type="button" onClick={onTrial} className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:w-auto">
                {t.webCta}<ArrowRight className="ml-2 size-4" />
              </button>
            </div>
          </FadeInSection>
          <FadeInSection delay={160} visibleOnLoad={compact}>
            <div className="border-t border-border px-6 py-5 md:border-l md:border-t-0 md:px-7">
              <p className="text-sm font-semibold text-foreground">{t.macTitle}</p>
              <p className="mt-1 max-w-44 text-xs leading-5 text-muted-foreground">{t.macDesc}</p>
              <a href={macDownloadUrl} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                {t.macCta}<ArrowRight className="ml-1.5 size-4" />
              </a>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  )
}

function WeChatFollow({ site }: { site: SiteContent }) {
  const wechat = site.wechat
  if (!wechat) return null
  return (
    <section className="px-6 py-20">
      <div className="relative mx-auto max-w-[1120px] overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#18243D,#2E3B66)] p-8 text-white md:p-12">
        <div className="aurora aurora-1 animate-aurora" style={{ width: 320, height: 320, top: -120, right: -60, opacity: 0.35 }} />
        <div className="aurora aurora-2 animate-aurora-slow" style={{ width: 280, height: 280, bottom: -120, left: -40, opacity: 0.3 }} />
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_auto]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90">
              <MessageSquareText className="size-4" />
              {wechat.eyebrow}
            </p>
            <h2 className="mt-5 text-3xl font-semibold leading-tight md:text-4xl">{wechat.title}</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/70">{wechat.desc}</p>
            <ol className="mt-6 grid gap-3">
              {wechat.steps.map((step, index) => (
                <li key={step} className="flex items-start gap-3 text-sm leading-6 text-white/85">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-semibold">{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <div className="mx-auto w-full max-w-[240px] rounded-[28px] bg-white p-5 text-center text-[#18243D] shadow-2xl">
            <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-2xl">
              <Image src={wechat.qr} alt={wechat.qrNote} fill sizes="240px" className="object-contain" />
            </div>
            <p className="mt-4 text-sm font-medium">{wechat.qrNote}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

type PartnerField = 'name' | 'phone' | 'company' | 'city' | 'role' | 'customerScale' | 'cooperationType' | 'inviteCode' | 'message'

const requiredPartnerFields: PartnerField[] = ['name', 'phone', 'city']

type TrialField = 'contactName' | 'contactPhone' | 'inviteCode'

type OfficialPage = 'home' | 'product' | 'company' | 'partners' | 'join' | 'news' | 'newsDetail' | 'cases'

export default function OfficialSite({
  site,
  page = 'home',
  articleSlug,
  initialArticles,
  initialArticle,
}: {
  site: SiteContent
  page?: OfficialPage
  articleSlug?: string
  initialArticles?: NewsArticle[]
  initialArticle?: NewsArticle
}) {
  const contactHref = `tel:${site.company.contact}`
  const copy = pageCopy[site.code]
  const productIntro = productIntroCopy[site.code]
  const news = newsCopy[site.code]
  const home = homeCopy[site.code]
  const articles = initialArticles ?? newsArticles[site.code]
  const article = initialArticle ?? (articleSlug ? getNewsArticle(site.code, articleSlug) : undefined)
  const trial = trialCopy[site.code]
  const jobs = jobCopy[site.code]
  const ui = uiCopy[site.code]
  const mobileContent = mobileContentCopy[site.code]
  const partnerOptions = partnerOptionCopy[site.code]

  const newsCategories = useMemo(() => {
    const set: string[] = [news.all]
    articles.forEach((item) => {
      if (!set.includes(item.category)) set.push(item.category)
    })
    return set
  }, [articles, news.all])
  const [activeCategory, setActiveCategory] = useState(news.all)
  const filteredArticles = activeCategory === news.all ? articles : articles.filter((item) => item.category === activeCategory)

  const [trialOpen, setTrialOpen] = useState(false)
  const [trialSubmitted, setTrialSubmitted] = useState(false)
  const [trialSubmitting, setTrialSubmitting] = useState(false)
  const [trialApiError, setTrialApiError] = useState('')
  const [trialSuccessMessage, setTrialSuccessMessage] = useState('')
  const [trialForm, setTrialForm] = useState({ contactName: '', contactPhone: '', inviteCode: '' })
  const [trialErrors, setTrialErrors] = useState<Partial<Record<TrialField, string>>>({})
  const [partnerSent, setPartnerSent] = useState(false)
  const [partnerSubmitting, setPartnerSubmitting] = useState(false)
  const [partnerApiError, setPartnerApiError] = useState('')
  const [partnerForm, setPartnerForm] = useState({
    name: '', phone: '', company: '', city: '', role: '', customerScale: '', cooperationType: '', inviteCode: '', message: '',
  })
  const [partnerErrors, setPartnerErrors] = useState<Partial<Record<PartnerField, string>>>({})

  useEffect(() => {
    const inviteCode = new URLSearchParams(window.location.search).get('inviteCode')
    if (inviteCode) {
      setPartnerForm((form) => ({ ...form, inviteCode }))
    }
  }, [])

  function updatePartnerField(field: PartnerField, value: string) {
    setPartnerForm((form) => ({ ...form, [field]: value }))
    if (partnerApiError) setPartnerApiError('')
    if (partnerErrors[field]) setPartnerErrors((errors) => ({ ...errors, [field]: undefined }))
  }

  function updateTrialField(field: TrialField, value: string) {
    setTrialForm((form) => ({ ...form, [field]: value }))
    if (trialApiError) setTrialApiError('')
    if (trialErrors[field]) setTrialErrors((errors) => ({ ...errors, [field]: undefined }))
  }

  function trialFieldClass(field: TrialField) {
    return `rounded-xl border bg-card px-4 font-normal outline-none transition-colors focus:border-primary ${trialErrors[field] ? 'border-red-400' : 'border-border'}`
  }

  function trialFieldError(field: TrialField) {
    return trialErrors[field] ? <p className="text-xs font-normal text-red-500">{trialErrors[field]}</p> : null
  }

  async function submitTrialForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: Partial<Record<TrialField, string>> = {}
    const contactName = trialForm.contactName.trim()
    const contactPhone = trialForm.contactPhone.trim()

    if (!contactName) nextErrors.contactName = ui.requiredError
    else if (contactName.length > trialContactNameMaxLength) nextErrors.contactName = ui.contactNameLengthError
    if (!contactPhone) nextErrors.contactPhone = ui.requiredError
    else if (contactPhone.length > trialContactPhoneMaxLength) nextErrors.contactPhone = ui.contactPhoneLengthError

    if (Object.keys(nextErrors).length > 0) {
      setTrialErrors(nextErrors)
      return
    }

    setTrialErrors({})
    setTrialApiError('')
    setTrialSubmitting(true)

    try {
      const response = await fetch(trialLeadApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName,
          contactPhone,
          ...(trialForm.inviteCode ? { referrerCode: trialForm.inviteCode } : {}),
        }),
      })
      const result = await response.json().catch(() => ({}))
      const message = result?.message || result?.msg || result?.detail

      if (!response.ok) {
        setTrialApiError(message || ui.submitError)
        return
      }

      // 我方信息收集与传输机制不变；提交成功后跳转到产品登录页，立即开始使用
      setTrialSuccessMessage(message || trial.successDesc)
      window.location.href = site.loginUrl
      return
    } catch {
      setTrialApiError(ui.submitError)
    } finally {
      setTrialSubmitting(false)
    }
  }

  function fieldClass(field: PartnerField) {
    return `rounded-xl border bg-card px-4 font-normal outline-none transition-colors focus:border-primary ${partnerErrors[field] ? 'border-red-400' : 'border-border'}`
  }

  function fieldError(field: PartnerField) {
    return partnerErrors[field] ? <p className="text-xs font-normal text-red-500">{partnerErrors[field]}</p> : null
  }

  async function submitPartnerForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: Partial<Record<PartnerField, string>> = {}
    requiredPartnerFields.forEach((field) => {
      if (!partnerForm[field].trim()) nextErrors[field] = ui.requiredError
    })

    if (Object.keys(nextErrors).length > 0) {
      setPartnerErrors(nextErrors)
      return
    }

    setPartnerErrors({})
    setPartnerApiError('')
    setPartnerSubmitting(true)

    const inviteCode =
      partnerForm.inviteCode.trim() || new URLSearchParams(window.location.search).get('inviteCode') || undefined
    const companyName = trimPartnerLeadField(partnerForm.company)
    const position = trimPartnerLeadField(partnerForm.role)
    const city = trimPartnerLeadField(partnerForm.city)
    const cooperationMode = trimPartnerLeadField(partnerForm.cooperationType)
    const customerScale = trimPartnerLeadField(partnerForm.customerScale)
    const remark = partnerForm.message.trim()

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
          ...(customerScale ? { customerScale } : {}),
          ...(inviteCode ? { inviteCode } : {}),
          ...(remark ? { remark } : {}),
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
            <input value={partnerForm.name} onChange={(event) => updatePartnerField('name', event.target.value)} className={`h-12 ${fieldClass('name')}`} placeholder={ui.namePlaceholder} />
            {fieldError('name')}
          </label>
          <label className="grid gap-2 text-sm font-medium">
            <span>{ui.phone} <span className="text-red-500">*</span></span>
            <input value={partnerForm.phone} onChange={(event) => updatePartnerField('phone', event.target.value)} className={`h-12 ${fieldClass('phone')}`} placeholder={ui.phonePlaceholder} />
            {fieldError('phone')}
          </label>
          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            <span>{ui.city} <span className="text-red-500">*</span></span>
            <input value={partnerForm.city} onChange={(event) => updatePartnerField('city', event.target.value)} className={`h-12 ${fieldClass('city')}`} placeholder={ui.cityPlaceholder} maxLength={partnerLeadMaxLength} />
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
            <input value={partnerForm.company} onChange={(event) => updatePartnerField('company', event.target.value)} className={`h-12 ${fieldClass('company')}`} placeholder={ui.companyPlaceholder} maxLength={partnerLeadMaxLength} />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            {ui.role}
            <select value={partnerForm.role} onChange={(event) => updatePartnerField('role', event.target.value)} className={`h-12 ${fieldClass('role')}`}>
              <option value="">{ui.choose}</option>
              {partnerOptions.roleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            {ui.customerScale}
            <select value={partnerForm.customerScale} onChange={(event) => updatePartnerField('customerScale', event.target.value)} className={`h-12 ${fieldClass('customerScale')}`}>
              <option value="">{ui.unsure}</option>
              {partnerOptions.scaleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            {ui.inviteCode}
            <input value={partnerForm.inviteCode} onChange={(event) => updatePartnerField('inviteCode', event.target.value)} className={`h-12 ${fieldClass('inviteCode')}`} placeholder={ui.inviteCodePlaceholder} maxLength={partnerLeadMaxLength} />
          </label>
          <div className="md:col-span-2">
            <p className="text-sm font-medium">{ui.cooperationType}</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {partnerOptions.cooperationOptions.map(([value, desc]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updatePartnerField('cooperationType', value)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${partnerForm.cooperationType === value ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/40'}`}
                >
                  <span className="block text-sm font-semibold">{value}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{desc}</span>
                </button>
              ))}
            </div>
          </div>
          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            {ui.message}
            <textarea value={partnerForm.message} onChange={(event) => updatePartnerField('message', event.target.value)} className={`min-h-28 py-3 ${fieldClass('message')}`} placeholder={ui.messagePlaceholder} />
          </label>
        </div>
        <button type="submit" disabled={partnerSubmitting} className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] px-6 text-sm font-semibold text-white shadow-lg shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-70">
          {partnerSubmitting ? ui.submitting : ui.submit}
          <Send className="ml-2 size-4" />
        </button>
        {partnerApiError && <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">{partnerApiError}</p>}
      </form>
    )
  }

  function renderFeatures() {
    return (
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-[1280px]">
          <FadeInSection>
            <SectionHeading eyebrow="核心功能" title={site.featuresTitle} subtitle={site.featuresSubtitle} />
          </FadeInSection>
          <div className="mt-8 md:hidden">
            <MobileDisclosure title={mobileContent.features} actionLabel={mobileContent.expand}>
              <div className="space-y-3">
                {site.features.map((feature) => (
                  <div key={feature.title} className="rounded-xl bg-secondary p-3">
                    <p className="text-sm font-semibold">{feature.title}</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{feature.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {feature.details.map((detail) => <span key={detail} className="rounded-full bg-card px-2 py-1 text-[11px] text-muted-foreground">{detail}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </MobileDisclosure>
          </div>
          <div className="mt-12 hidden gap-5 md:grid md:grid-cols-2 lg:grid-cols-4">
            {site.features.map((feature, index) => (
              <FadeInSection key={feature.title} delay={index * 50}>
                <div className="group relative h-full overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[0_4px_18px_rgba(38,67,104,.05)] transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_24px_60px_rgba(79,123,255,.16)]">
                  <div className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-primary/5 blur-2xl transition-opacity group-hover:opacity-100" />
                  <IconBox icon={feature.icon} />
                  <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {feature.details.map((detail) => (
                      <span key={detail} className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">{detail}</span>
                    ))}
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>
    )
  }

  function renderRoles() {
    return (
      <section id="roles" className="bg-card px-6 py-20">
        <div className="mx-auto max-w-[1280px]">
          <FadeInSection>
            <SectionHeading eyebrow="适用角色" title={site.rolesTitle} subtitle={site.rolesSubtitle} />
          </FadeInSection>
          <div className="mt-8 lg:hidden">
            <MobileDisclosure title={mobileContent.roles} actionLabel={mobileContent.expand}>
              <div className="space-y-3">
                {site.roles.map((role) => (
                  <details key={role.title} className="rounded-xl bg-secondary px-3 py-2.5">
                    <summary className="cursor-pointer list-none text-sm font-semibold">{role.title}<span className="ml-2 text-xs font-normal text-primary">{role.user}</span></summary>
                    <ol className="mt-3 space-y-2 border-t border-border pt-3">
                      {role.journey.map((item, itemIndex) => <li key={item} className="text-xs leading-5 text-muted-foreground">{itemIndex + 1}. {item}</li>)}
                    </ol>
                    <p className="mt-3 text-xs leading-5 text-muted-foreground">{role.cta}</p>
                  </details>
                ))}
              </div>
            </MobileDisclosure>
          </div>
          <div className="mt-12 hidden gap-5 lg:grid lg:grid-cols-5">
            {site.roles.map((role, index) => (
              <FadeInSection key={role.title} delay={index * 60}>
                <div className="h-full rounded-3xl border border-border bg-background p-5 transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(79,123,255,.14)]">
                  <IconBox icon={role.icon} />
                  <h3 className="mt-5 text-lg font-semibold">{role.title}</h3>
                  <p className="mt-2 text-sm text-primary">{role.user}</p>
                  <ol className="mt-5 space-y-3">
                    {role.journey.map((item, itemIndex) => (
                      <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-card text-xs font-semibold text-primary">{itemIndex + 1}</span>
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
    )
  }

  function renderWorkflow() {
    return (
      <section id="workflow" className="px-6 py-20">
        <div className="mx-auto max-w-[1280px]">
          <FadeInSection>
            <SectionHeading eyebrow="工作流程" title={site.workflowTitle} subtitle={site.workflowSubtitle} />
          </FadeInSection>
          <div className="mt-8 lg:hidden">
            <MobileDisclosure title={mobileContent.workflow} actionLabel={mobileContent.expand}>
              <ol className="space-y-3">
                {site.workflow.map((step) => (
                  <li key={step.step} className="rounded-xl bg-secondary p-3">
                    <p className="text-sm font-semibold text-foreground">{step.step}. {step.title}</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{step.description}</p>
                    <p className="mt-2 text-xs text-primary">{mobileContent.output}：{step.output}</p>
                  </li>
                ))}
              </ol>
            </MobileDisclosure>
          </div>
          <div className="mt-12 hidden gap-4 lg:grid lg:grid-cols-5">
            {site.workflow.map((step, index) => (
              <FadeInSection key={step.step} delay={index * 70}>
                <div className="relative h-full rounded-3xl border border-border bg-card p-5 shadow-[0_4px_18px_rgba(38,67,104,.05)]">
                  {index < site.workflow.length - 1 && (
                    <span className="absolute right-[-10px] top-10 z-10 hidden text-primary/30 lg:block"><ArrowRight className="size-5" /></span>
                  )}
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] text-sm font-semibold text-white shadow-lg shadow-primary/25">{step.step}</div>
                  <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.description}</p>
                  <p className="mt-4 rounded-2xl bg-background p-3 text-xs leading-5 text-muted-foreground">{step.output}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>
    )
  }

  function renderPricing({ dark = false }: { dark?: boolean } = {}) {
    const pricing = site.pricingPlans
    const visibleOnLoad = page === 'home'
    if (!pricing) {
      // jp/hk 回退：沿用单一定价
      return (
        <section id="pricing" className={`${dark ? 'bg-card' : ''} px-6 py-20`}>
          <div className="mx-auto grid max-w-[1120px] items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <FadeInSection visibleOnLoad={visibleOnLoad}>
              <SectionHeading align="left" title={site.pricing.title} subtitle={site.pricing.subtitle} />
            </FadeInSection>
            <FadeInSection delay={120} visibleOnLoad={visibleOnLoad}>
              <div className="rounded-[28px] border border-primary/20 bg-background p-6 shadow-[0_20px_60px_rgba(24,36,61,.12)]">
                <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
                  <div>
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
                        <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-status-online" />{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold">{site.pricing.boundaryTitle}</h3>
                    <ul className="mt-4 space-y-3">
                      {site.pricing.boundaries.map((item) => (
                        <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-status-warning" />{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>
      )
    }
    const purchasePlans = pricing.plans.flatMap((plan) => [
      { ...plan, purchase: 'yearly' as const, key: `${plan.name}-yearly` },
      { ...plan, purchase: 'lifetime' as const, key: `${plan.name}-lifetime` },
    ])
    return (
      <section id="pricing" className={`relative overflow-hidden px-6 py-20 ${dark ? 'bg-card' : ''}`}>
        {!visibleOnLoad && <div className="bg-grid absolute inset-0 -z-10" />}
        <div className="mx-auto max-w-[1120px]">
          <FadeInSection visibleOnLoad={visibleOnLoad}>
            <SectionHeading eyebrow={pricing.eyebrow} title={pricing.title} subtitle={pricing.subtitle} />
          </FadeInSection>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {purchasePlans.map((plan, index) => {
              const lifetime = plan.purchase === 'lifetime'
              const lifetimeCardTone = 'border-[#e2b64f] ring-1 ring-[#f7c65b]/25'
              const lifetimeSurfaceTone = 'border-[#f7c65b]/55 bg-[#fff8e6]'
              const lifetimeTextTone = 'text-[#9b6b06]'
              const lifetimeButtonTone = 'bg-[#f7c65b] text-[#251d08] shadow-lg shadow-[#f7c65b]/20 hover:-translate-y-0.5'
              return (
              <FadeInSection key={plan.key} delay={index * 70} visibleOnLoad={visibleOnLoad}>
                <div className={`relative flex h-full flex-col overflow-hidden rounded-[28px] border bg-card p-6 ${visibleOnLoad ? '' : 'shadow-[0_16px_42px_rgba(20,64,78,.08)]'} ${lifetime ? lifetimeCardTone : 'border-border'}`}>
                  {lifetime && (
                    <span className="absolute right-4 top-4 rounded-full bg-[#f7c65b] px-2.5 py-1 text-[11px] font-semibold text-[#251d08]">永久买断</span>
                  )}
                  <p className="text-lg font-semibold">{plan.name}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.audience}</p>
                  <div className={`mt-6 rounded-2xl border p-4 ${lifetime ? lifetimeSurfaceTone : 'border-border bg-secondary/50'}`}>
                    <span className={`text-xs font-semibold tracking-[0.14em] ${lifetime ? lifetimeTextTone : 'text-primary'}`}>{lifetime ? '一次购买 · 长期使用' : '按年订阅 · 灵活开通'}</span>
                    <div className="mt-2 flex items-end gap-2">
                      <span className={`text-4xl font-bold tracking-tight ${lifetime ? lifetimeTextTone : 'text-foreground'}`}>{lifetime ? plan.lifetime : plan.yearly}</span>
                      <span className={`pb-1.5 text-sm font-semibold ${lifetime ? lifetimeTextTone : 'text-muted-foreground'}`}>{lifetime ? plan.lifetimeNote : plan.yearlyNote}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>{lifetime ? <>年付也可选：<span className="font-semibold text-foreground">{plan.yearly}</span> {plan.yearlyNote}</> : <>长期方案：<span className="font-semibold text-[#9b6b06]">{plan.lifetime}</span> {plan.lifetimeNote}</>}</span>
                    {plan.perDay && <span className="rounded-full bg-secondary px-3 py-1 font-medium text-primary">{plan.perDay}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={() => setTrialOpen(true)}
                    className={`mt-6 inline-flex h-12 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${lifetime ? lifetimeButtonTone : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 size-4" />
                  </button>
                  <ul className="mt-6 space-y-3 border-t border-border pt-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-3 text-sm leading-6 text-muted-foreground"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-status-online" />{feature}</li>
                    ))}
                  </ul>
                </div>
              </FadeInSection>
              )
            })}
          </div>
          {pricing.footnote && <p className="mt-6 text-center text-xs leading-5 text-text-tertiary">{pricing.footnote}</p>}
        </div>
      </section>
    )
  }

  function renderComparison({ dark = false }: { dark?: boolean } = {}) {
    const comparison = site.comparison
    if (!comparison) return null
    return (
      <section id="comparison" className={`px-6 py-20 ${dark ? 'bg-card' : ''}`}>
        <div className="mx-auto max-w-[1120px]">
          <FadeInSection>
            <SectionHeading eyebrow={comparison.eyebrow} title={comparison.title} subtitle={comparison.subtitle} />
          </FadeInSection>
          <FadeInSection delay={100}>
            <div className="mt-10 overflow-x-auto rounded-[28px] border border-border bg-card shadow-[0_18px_54px_rgba(24,36,61,.08)]">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="bg-[linear-gradient(135deg,rgba(79,123,255,.08),rgba(108,92,255,.05))]">
                    {comparison.columns.map((column, index) => (
                      <th key={column} className={`p-4 text-sm font-semibold ${index === 0 ? 'text-foreground' : index === comparison.columns.length - 1 || index === 2 ? 'text-primary' : 'text-muted-foreground'} ${index === 0 ? 'w-[26%]' : ''}`}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.groups.map((group) => (
                    <Fragment key={group.name}>
                      <tr className="bg-secondary/60">
                        <td colSpan={comparison.columns.length} className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-primary">{group.name}</td>
                      </tr>
                      {group.rows.map((row) => (
                        <tr key={row[0]} className="border-t border-border">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className={`p-4 ${cellIndex === 0 ? 'text-sm font-medium text-foreground' : ''}`}>
                              {cellIndex === 0 ? cell : <ComparisonCell value={cell} />}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeInSection>
        </div>
      </section>
    )
  }

  function renderIndustries({ dark = false }: { dark?: boolean } = {}) {
    const industries = site.industries
    if (!industries) return null
    return (
      <section className={`px-6 py-20 ${dark ? 'bg-card' : ''}`}>
        <div className="mx-auto max-w-[1280px]">
          <FadeInSection>
            <SectionHeading eyebrow={industries.eyebrow} title={industries.title} subtitle={industries.subtitle} />
          </FadeInSection>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:mt-12 md:gap-4 lg:grid-cols-4">
            {industries.items.map((item, index) => (
              <FadeInSection key={item.name} delay={(index % 4) * 50}>
                <div className="group flex h-full items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_16px_40px_rgba(79,123,255,.12)]">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] group-hover:text-white">
                    {(() => { const Icon = icons[item.icon]; return <Icon className="size-5" /> })()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.note}</p>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
          {industries.note && <p className="mt-6 text-center text-xs leading-5 text-text-tertiary">{industries.note}</p>}
        </div>
      </section>
    )
  }

  function renderCases({ dark = false }: { dark?: boolean } = {}) {
    const cases = site.cases
    if (!cases) return null
    const distributionTotal = site.caseDistribution?.reduce((total, item) => total + Number(item.count.replace(/,/g, '')), 0) ?? 0
    const distributionCopy = site.code === 'jp'
      ? { eyebrow: '利用シーンの内訳', unit: '社', note: `業種別の合計は ${distributionTotal.toLocaleString('ja-JP')} 社です。現在の利用シーンをもとにした累計です。` }
      : site.code === 'hk'
        ? { eyebrow: '累計服務規模', unit: '企業', note: `行業分布合計 ${distributionTotal.toLocaleString('zh-HK')} 家，以目前服務場景的累計口徑呈現。` }
        : { eyebrow: '累计服务规模', unit: '企业', note: `行业分布合计 ${distributionTotal.toLocaleString('zh-CN')} 家，以当前服务场景的累计口径呈现。` }
    return (
      <section className={`px-6 py-20 ${dark ? 'bg-card' : ''}`}>
        <div className="mx-auto max-w-[1280px]">
          {site.caseDistribution && (
            <div className="rounded-[28px] border border-primary/20 bg-[#eef2ff] p-5 shadow-[0_16px_40px_rgba(79,123,255,.10)] md:p-6">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-primary/15 pb-5">
                <div>
                  <p className="text-xs font-semibold tracking-[0.14em] text-primary">{distributionCopy.eyebrow}</p>
                  <p className="mt-2 text-4xl font-black tracking-tight text-foreground">{distributionTotal.toLocaleString(site.code === 'jp' ? 'ja-JP' : site.code === 'hk' ? 'zh-HK' : 'zh-CN')} <span className="text-base font-medium text-muted-foreground">{distributionCopy.unit}</span></p>
                </div>
                <p className="max-w-md text-xs leading-5 text-muted-foreground">{distributionCopy.note}</p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                {site.caseDistribution.map((item) => (
                  <div key={item.name} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {(() => { const Icon = icons[item.icon]; return <Icon className="size-4" /> })()}
                    </div>
                    <p className="mt-4 text-xl font-bold text-foreground">{item.count}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cases.items.map((item, index) => (
              <FadeInSection key={item.company} delay={(index % 3) * 70}>
                <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(79,123,255,.14)]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">{item.industry}</span>
                    <span className="text-xs text-text-tertiary">匿名反馈</span>
                  </div>
                  <p className="mt-5 flex-1 text-base leading-8 text-muted-foreground">“{item.quote}”</p>
                  {item.person && <p className="mt-4 text-xs font-medium text-text-tertiary">— {item.person}</p>}
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                    {item.tags.map((tag) => <span key={tag} className="rounded-full bg-background px-2.5 py-1 text-[11px] text-muted-foreground">{tag}</span>)}
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>
    )
  }

  function renderPhilosophy({ dark = false }: { dark?: boolean } = {}) {
    const philosophy = site.philosophy
    if (!philosophy) return null
    return (
      <section className={`relative overflow-hidden px-6 py-20 ${dark ? 'bg-card' : ''}`}>
        <div className="aurora aurora-3 animate-aurora-slow" style={{ width: 360, height: 360, top: 40, left: -120 }} />
        <div className="mx-auto max-w-[1280px]">
          <FadeInSection>
            <SectionHeading eyebrow={philosophy.eyebrow} title={philosophy.title} subtitle={philosophy.subtitle} />
          </FadeInSection>
          <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-2 lg:grid-cols-3">
            {philosophy.items.map((item, index) => (
              <FadeInSection key={item.title} delay={(index % 3) * 70}>
                <div className="h-full rounded-3xl border border-border bg-card p-6 shadow-[0_4px_18px_rgba(38,67,104,.05)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(79,123,255,.14)]">
                  <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{item.tag}</span>
                  <h3 className="mt-4 text-xl font-semibold leading-snug">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.body}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>
    )
  }

  function renderFinalCta() {
    return (
      <section className="px-6 py-20">
        <div className="relative mx-auto max-w-[1120px] overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#18243D,#2E3B66)] p-8 text-white md:p-12">
          <div className="aurora aurora-1 animate-aurora" style={{ width: 300, height: 300, top: -120, right: -40, opacity: 0.4 }} />
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
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar site={site} onTrialClick={() => setTrialOpen(true)} />

      <main className={page === 'home' ? 'official-main home-trust' : 'official-main'}>
        {page === 'home' && (
          <>
            <section className="home-trust-hero relative overflow-hidden px-6 py-14 md:py-20">
              <div className="mx-auto grid max-w-[1280px] items-center gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
                <FadeInSection visibleOnLoad>
                  <div>
                    <div className="mb-6 inline-flex items-center gap-2 border-l-2 border-primary pl-3 text-sm font-semibold text-primary">
                      {site.hero.eyebrow}
                    </div>
                    <h1 className="max-w-3xl text-5xl font-black leading-[1.1] tracking-[-0.035em] text-foreground md:text-6xl">
                      <span className="block">{site.hero.title}</span>
                      <span className="mt-2 block text-primary">{site.hero.titleAccent}</span>
                    </h1>
                    <p className="mt-6 max-w-xl text-base leading-8 text-muted-foreground md:text-lg">{site.hero.description}</p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <button type="button" onClick={() => setTrialOpen(true)} className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                        {site.hero.primaryCta}
                        <ArrowRight className="ml-2 size-4" />
                      </button>
                      <a href="#start" className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:border-primary/35 hover:bg-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                        <MessageSquareText className="mr-2 size-4" />
                        {home.followWechat}
                      </a>
                    </div>
                    <div className="mt-10 grid grid-cols-2 border-y border-border sm:grid-cols-4">
                      {site.metrics.map((metric) => (
                        <div key={metric.label} className="border-r border-border py-4 pr-3 last:border-r-0 sm:px-4 sm:first:pl-0">
                          <div className="text-xl font-bold text-foreground">{metric.value}</div>
                          <div className="mt-1 text-sm font-semibold text-foreground">{metric.label}</div>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">{metric.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeInSection>

                <FadeInSection visibleOnLoad>
                  <div className="relative mx-auto max-w-[340px] lg:mr-0">
                    <div className="overflow-hidden rounded-[32px] border border-border bg-card p-2 shadow-[0_20px_56px_rgba(24,36,61,.16)]">
                      <Image
                        src={screenshotSrc[site.code]}
                        alt={productIntro.imageAlt}
                        width={922}
                        height={2048}
                        priority
                        className="h-[540px] w-full rounded-[24px] object-cover object-top"
                      />
                    </div>
                  </div>
                </FadeInSection>
              </div>
            </section>

            <TouchpointsSection site={site} onTrial={() => setTrialOpen(true)} compact />

            {/* 定价（卡片；完整对比表在产品页） */}
            {renderPricing()}
            {site.comparison && (
              <div className="-mt-8 px-6 pb-12 text-center">
                <a href={`${site.path}product/#comparison`} className="inline-flex min-h-11 items-center text-sm font-semibold text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">{home.fullComparison}<ArrowRight className="ml-1 size-4" /></a>
              </div>
            )}

            {/* 客户反馈摘要（不展示不可核验的行业规模数据） */}
            {site.cases && (
              <section className="bg-card px-6 py-20">
                <div className="mx-auto max-w-[1120px]">
                  <FadeInSection visibleOnLoad>
                    <SectionHeading eyebrow="客户案例" title="12,000+ 企业的服务规模，与真实工作场景反馈" subtitle="行业分布合计 12,000 家；反馈均已做匿名处理，不以单个客户的节省金额或效率比例作承诺。" />
                  </FadeInSection>
                  {site.caseDistribution && (
                    <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-6">
                      {site.caseDistribution.map((item) => (
                        <div key={item.name} className="rounded-2xl border border-border bg-background p-4">
                          <p className="text-xl font-bold text-primary">{item.count}</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-8 grid gap-4 md:grid-cols-3">
                    {site.cases.items.slice(0, 3).map((item, index) => (
                      <FadeInSection key={item.company} delay={index * 60} visibleOnLoad>
                        <div className="flex h-full flex-col rounded-2xl border border-border bg-background p-5">
                          <span className="text-xs font-semibold text-primary">{item.industry}</span>
                          <p className="mt-4 flex-1 text-sm leading-7 text-muted-foreground">“{item.quote}”</p>
                          <p className="mt-4 text-xs font-medium text-text-tertiary">{item.person}</p>
                        </div>
                      </FadeInSection>
                    ))}
                  </div>
                  <div className="mt-8 text-center">
                    <a href={`${site.path}cases/`} className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">{home.viewCases}<ArrowRight className="ml-2 size-4" /></a>
                  </div>
                </div>
              </section>
            )}

            {/* 新闻 teaser */}
            <section className="bg-card px-6 py-20">
              <div className="mx-auto max-w-[1280px]">
                <FadeInSection visibleOnLoad>
                  <SectionHeading eyebrow={news.eyebrow} title={news.title} subtitle={home.newsTeaserSub} />
                </FadeInSection>
                <div className="mt-10 grid gap-5 md:grid-cols-3">
                  {articles.slice(0, 3).map((item, index) => (
                    <FadeInSection key={item.slug} delay={index * 70} visibleOnLoad>
                      <a href={`${site.path}news/${item.slug}/`} className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-border bg-background transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(79,123,255,.14)]">
                        <div className="relative aspect-[16/9] bg-secondary">
                          <Image src={item.cover} alt={item.title} fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
                          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">{item.category}</span>
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <span className="text-xs text-text-tertiary">{item.date}</span>
                          <h3 className="mt-2 text-base font-semibold leading-snug">{item.title}</h3>
                          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                        </div>
                      </a>
                    </FadeInSection>
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <a href={`${site.path}news/`} className="inline-flex min-h-11 items-center text-sm font-semibold text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">{home.moreNews}<ArrowRight className="ml-1 size-4" /></a>
                </div>
              </div>
            </section>

            {/* 探索更多 */}
            <section className="px-6 pb-20 pt-4">
              <div className="mx-auto grid max-w-[1280px] gap-3 lg:gap-6 lg:grid-cols-3">
                {home.navCards.map(([title, desc, href]) => (
                  <a key={title} href={`${site.path.replace(/\/$/, '')}${href}`} className="group flex min-h-[160px] flex-col rounded-[28px] border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_24px_60px_rgba(79,123,255,.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:min-h-[200px] lg:p-7">
                    <h2 className="text-2xl font-semibold">{title}</h2>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">{desc}</p>
                    <span className="mt-auto inline-flex items-center pt-6 text-sm font-semibold text-primary">
                      {title}
                      <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </a>
                ))}
              </div>
            </section>

            {renderFinalCta()}
          </>
        )}

        {page === 'product' && (
          <>
            <section className="hero-dark relative overflow-hidden px-6 pb-24 pt-16 text-white md:pb-28 md:pt-24">
              <div className="grid-dark pointer-events-none absolute inset-0" />
              <div className="tech-light-orb -left-24 -top-24" />
              <div className="aurora aurora-1 animate-aurora" style={{ width: 420, height: 420, top: -150, left: '8%' }} />
              <div className="aurora aurora-2 animate-aurora-slow" style={{ width: 360, height: 360, top: -60, right: '4%' }} />
              <div className="relative mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[1fr_480px]">
                <FadeInSection>
                  <div>
                    <div className="pill-neon mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-primary">
                      <Sparkles className="size-4" />
                      {site.hero.eyebrow}
                    </div>
                    <h1 className="max-w-3xl text-5xl font-black leading-[1.08] tracking-tight md:text-7xl">
                      {site.hero.title}
                      <span className="block text-gradient-neon text-glow">{site.hero.titleAccent}</span>
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{site.hero.description}</p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <button type="button" onClick={() => setTrialOpen(true)} className="inline-flex h-12 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] px-6 text-sm font-semibold text-white shadow-[0_10px_36px_rgba(79,123,255,.5)] transition-transform hover:-translate-y-0.5">
                        {site.hero.primaryCta}
                        <ArrowRight className="ml-2 size-4" />
                      </button>
                      <a href="#pricing" className="glass-dark inline-flex h-12 items-center justify-center rounded-xl px-6 text-sm font-semibold text-foreground transition-colors hover:bg-primary/10">
                        {home.seePricing}
                      </a>
                    </div>
                    <div className="mt-8 grid grid-cols-2 gap-3">
                      {site.metrics.map((metric) => (
                        <div key={metric.label} className="glass-dark mobile-compact-card rounded-2xl p-4">
                          <div className="text-2xl font-bold stat-neon">{metric.value}</div>
                          <div className="mt-1 text-sm font-medium text-foreground">{metric.label}</div>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">{metric.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeInSection>

                <FadeInSection delay={120}>
                  <div className="relative">
                    <div className="absolute -inset-5 -z-10 rounded-[44px] bg-[radial-gradient(circle,rgba(79,123,255,.5),transparent_70%)] blur-2xl" />
                    <div className="md:mx-auto md:max-w-[430px] glass-dark scan-beam md:rounded-[34px] md:p-3 md:shadow-[0_40px_100px_rgba(0,0,0,.5)]">
                      <Image
                        src={screenshotSrc[site.code]}
                        alt={productIntro.imageAlt}
                        width={922}
                        height={2048}
                        priority
                        className="-mx-5 h-auto w-[calc(100%+2.5rem)] max-w-none rounded-none md:mx-0 md:h-[700px] md:w-full md:max-w-full md:rounded-[26px] md:object-cover md:object-top"
                      />
                    </div>
                    <div className="absolute -bottom-5 left-1/2 hidden w-[88%] -translate-x-1/2 rounded-2xl border border-white/15 bg-[#0d1330]/85 p-4 shadow-xl backdrop-blur md:block">
                      <div className="flex items-start gap-3">
                        <Bot className="mt-0.5 size-5 text-primary" />
                        <div>
                          <p className="text-sm font-semibold text-white">{productIntro.imageLabel}</p>
                          <p className="mt-1 text-xs leading-5 text-white/60">{productIntro.imageDesc}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeInSection>
              </div>
            </section>

            {/* proof bar */}
            <section className="border-y border-border bg-card px-6 py-6">
              <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-3 md:gap-4 md:grid-cols-4">
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

            {/* product intro card */}
            <section className="bg-card px-6 pb-6 pt-16">
              <div className="mx-auto max-w-[1280px]">
                <FadeInSection>
                  <SectionHeading eyebrow={productIntro.eyebrow} title={productIntro.title} subtitle={productIntro.subtitle} />
                </FadeInSection>
                <FadeInSection delay={100}>
                  <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
                    <div className="gradient-border rounded-[28px] border border-transparent bg-background p-7 shadow-[0_18px_54px_rgba(79,123,255,.10)]">
                      <p className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{productIntro.status}</p>
                      <h2 className="mt-3 text-3xl font-semibold">{productIntro.name}</h2>
                      <p className="mt-4 text-sm leading-7 text-muted-foreground">{productIntro.description}</p>
                      <div className="mt-6 grid grid-cols-2 gap-3">
                        {productIntro.bullets.map((item) => (
                          <div key={item} className="rounded-2xl border border-border bg-card p-3 text-sm font-medium">{item}</div>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {site.proofItems.map((item) => (
                        <div key={item.label} className="rounded-3xl border border-border bg-background p-5">
                          <p className="text-sm text-muted-foreground">{item.label}</p>
                          <p className="mt-2 text-2xl font-bold text-gradient">{item.value}</p>
                          <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeInSection>
              </div>
            </section>

            {/* pains */}
            <section id="product" className="px-6 py-20">
              <div className="mx-auto max-w-[1280px]">
                <FadeInSection>
                  <SectionHeading eyebrow="财税烦恼" title={site.painTitle} subtitle={site.painSubtitle} />
                </FadeInSection>
                <div className="mt-8 grid grid-cols-2 gap-3 md:mt-12 md:gap-5 xl:grid-cols-4">
                  {site.pains.map((pain, index) => (
                    <FadeInSection key={pain.title} delay={index * 60}>
                      <div className="mobile-compact-card h-full rounded-3xl border border-border bg-card p-6 shadow-[0_4px_18px_rgba(38,67,104,.05)]">
                        <IconBox icon={pain.icon} tone="plain" />
                        <h3 className="mt-5 text-lg font-semibold">{pain.title}</h3>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">{pain.description}</p>
                      </div>
                    </FadeInSection>
                  ))}
                </div>
              </div>
            </section>

            {renderFeatures()}
            {renderRoles()}
            {renderWorkflow()}
            {renderPricing({ dark: true })}
            {renderComparison()}

            {/* compliance */}
            <section className="bg-card px-6 py-20">
              <div className="mx-auto max-w-[1280px] rounded-[28px] border border-border bg-background p-6 md:p-10">
                <FadeInSection>
                  <SectionHeading title={site.compliance.title} subtitle={site.compliance.subtitle} />
                </FadeInSection>
                <div className="mt-10 grid gap-5 md:grid-cols-2">
                  <div className="rounded-3xl bg-card p-6">
                    <h3 className="font-semibold">服务亮点</h3>
                    <ul className="mt-4 space-y-3">
                      {site.compliance.safe.map((item) => (
                        <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-status-online" />{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-3xl bg-card p-6">
                    <h3 className="font-semibold">使用提醒</h3>
                    <ul className="mt-4 space-y-3">
                      {site.compliance.limited.map((item) => (
                        <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground"><Lock className="mt-0.5 size-5 shrink-0 text-status-warning" />{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* faq */}
            <section id="faq" className="px-6 py-20">
              <div className="mx-auto max-w-[960px]">
                <FadeInSection>
                  <SectionHeading eyebrow="常见问题" title={site.faqTitle} />
                </FadeInSection>
                <div className="mt-8 divide-y divide-border rounded-3xl border border-border bg-card md:mt-10">
                  {site.faqs.map((faq) => (
                    <div key={faq.q}>
                      <details className="p-4 md:hidden">
                        <summary className="cursor-pointer list-none font-semibold">
                          {faq.q}
                          <span className="float-right text-xs font-normal text-primary">{mobileContent.faqExpand}</span>
                        </summary>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">{faq.a}</p>
                      </details>
                      <div className="hidden p-6 md:block">
                        <h3 className="font-semibold">{faq.q}</h3>
                        <p className="mt-3 text-sm leading-7 text-muted-foreground">{faq.a}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <TouchpointsSection site={site} onTrial={() => setTrialOpen(true)} />
            {renderFinalCta()}
          </>
        )}

        {page === 'cases' && (
          <>
            <section className="home-hero relative overflow-hidden px-6 py-20 text-white md:py-24">
              <div className="grid-dark pointer-events-none absolute inset-0" />
              <div className="tech-light-orb -right-20 -top-24" />
              <div className="relative mx-auto max-w-[1280px]">
                <FadeInSection>
                  <div className="mx-auto max-w-3xl text-center">
                    <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary"><span className="h-1 w-1 rounded-full bg-primary" />{site.casesIntro?.eyebrow}</p>
                    <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-5xl">{site.casesIntro?.title}</h1>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">{site.casesIntro?.subtitle}</p>
                  </div>
                </FadeInSection>
              </div>
            </section>

            {renderCases()}
            <TouchpointsSection site={site} onTrial={() => setTrialOpen(true)} />
            {renderFinalCta()}
          </>
        )}

        {page === 'company' && (
          <>
            <section className="relative overflow-hidden px-6 py-20 md:py-24">
              <div className="bg-grid absolute inset-0 -z-10" />
              <div className="aurora aurora-1 animate-aurora" style={{ width: 380, height: 380, top: -120, left: '6%' }} />
              <div className="aurora aurora-2 animate-aurora-slow" style={{ width: 320, height: 320, top: -40, right: '8%' }} />
              <div className="mx-auto grid max-w-[1280px] items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
                <FadeInSection>
                  <div>
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary"><span className="h-1 w-1 rounded-full bg-primary" />{site.companyIntro.eyebrow}</p>
                    <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">{copy.companyHeroTitle}</h1>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">{copy.companyHeroDesc}</p>
                    <div className="mt-8">
                      <Image
                        src={site.code === 'jp' ? '/images/brand/official-logo-jp.png' : site.code === 'hk' ? '/images/brand/official-logo-hk.png' : '/images/brand/official-logo-cn.png'}
                        alt="账大师 · 360 元 AI 记账"
                        width={720}
                        height={238}
                        className="h-12 w-auto"
                      />
                    </div>
                  </div>
                </FadeInSection>
                <FadeInSection delay={120}>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {site.companyIntro.stats.map((item) => (
                      <div key={item.label} className="mobile-compact-card rounded-3xl border border-border bg-white/70 p-6 backdrop-blur shadow-[0_10px_30px_rgba(24,36,61,.08)]">
                        <p className="text-3xl font-bold text-gradient">{item.value}</p>
                        <p className="mt-2 text-sm font-medium text-foreground">{item.label}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </FadeInSection>
              </div>
            </section>

            {/* milestones timeline */}
            <section className="relative overflow-hidden bg-card px-6 py-20">
              <div className="mx-auto max-w-[1280px]">
                <SectionHeading eyebrow="发展历程" title={site.companyIntro.milestoneTitle} subtitle={site.companyIntro.milestoneSubtitle} />
                <div className="relative mt-12 md:mt-16">
                  {/* center gradient line (desktop) */}
                  <div className="pointer-events-none absolute left-6 top-0 hidden h-full w-px bg-[linear-gradient(to_bottom,transparent,rgba(79,123,255,.5),rgba(108,92,255,.5),transparent)] md:left-1/2 md:block" />
                  {/* left line (mobile) */}
                  <div className="pointer-events-none absolute left-[22px] top-0 h-full w-px bg-[linear-gradient(to_bottom,transparent,rgba(79,123,255,.4),transparent)] md:hidden" />
                  <div className="space-y-6 md:space-y-2">
                    {site.companyIntro.milestones.map((milestone, index) => {
                      const left = index % 2 === 0
                      return (
                        <FadeInSection key={milestone.year} delay={30}>
                          <div className={`relative md:grid md:grid-cols-2 md:gap-10 ${left ? '' : 'md:[&>*:first-child]:col-start-2'}`}>
                            {/* node */}
                            <span className="absolute left-[14px] top-3 z-10 flex size-4 items-center justify-center rounded-full border-2 border-primary bg-card md:left-1/2 md:-translate-x-1/2">
                              <span className="size-1.5 rounded-full bg-primary" />
                            </span>
                            <div className={`pl-12 md:pl-0 ${left ? 'md:pr-12 md:text-right' : 'md:col-start-2 md:pl-12'}`}>
                              <article className="rounded-3xl border border-border bg-background p-5 shadow-[0_4px_18px_rgba(38,67,104,.05)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(79,123,255,.14)]">
                                <span className="inline-flex rounded-full bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] px-3 py-1 text-sm font-bold text-white shadow-lg shadow-primary/25">{milestone.year}</span>
                                <h3 className="mt-3 text-lg font-semibold">{milestone.title}</h3>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">{milestone.focus}</p>
                                <p className={`mt-3 inline-flex flex-wrap gap-x-1 text-xs font-medium text-primary ${left ? 'md:justify-end' : ''}`}>{milestone.capability}</p>
                                <p className="mt-2 text-xs leading-5 text-text-tertiary">{milestone.value}</p>
                              </article>
                            </div>
                          </div>
                        </FadeInSection>
                      )
                    })}
                  </div>
                </div>
              </div>
            </section>

            {renderPhilosophy()}

            {/* brand focus */}
            <section className="bg-card px-6 py-20">
              <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                <FadeInSection>
                  <SectionHeading align="left" eyebrow={copy.professionalEyebrow} title={copy.focusTitle} subtitle={copy.focusSubtitle} />
                </FadeInSection>
                <FadeInSection delay={120}>
                  <div className="grid gap-4">
                    {site.companyIntro.focus.map((item, index) => (
                      <div key={item} className="flex gap-4 rounded-3xl border border-border bg-background p-5">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] text-sm font-semibold text-white">{index + 1}</span>
                        <p className="text-sm leading-7 text-muted-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </FadeInSection>
              </div>
            </section>

            <CompanyImageStream eyebrow={copy.sceneEyebrow} title={copy.sceneTitle} subtitle={copy.sceneSubtitle} />
            <WeChatFollow site={site} />
          </>
        )}

        {page === 'partners' && (
          <>
            <section className="relative overflow-hidden px-6 py-20 md:py-24">
              <div className="bg-grid absolute inset-0 -z-10" />
              <div className="aurora aurora-1 animate-aurora" style={{ width: 360, height: 360, top: -120, left: '8%' }} />
              <div className="mx-auto max-w-[1280px]">
                {site.partnerMarket && (
                  <FadeInSection>
                    <SectionHeading eyebrow={site.partnerMarket.eyebrow} title={site.partnerMarket.title} subtitle={site.partnerMarket.subtitle} level="h1" />
                  </FadeInSection>
                )}
                {site.partnerMarket && (
                  <div className="mt-10 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
                    {site.partnerMarket.stats.map((stat, index) => (
                      <FadeInSection key={stat.label} delay={index * 60}>
                        <div className="rounded-3xl border border-border bg-white/70 p-5 text-center backdrop-blur shadow-[0_10px_30px_rgba(24,36,61,.08)] md:p-6">
                          <p className="text-3xl font-bold text-gradient md:text-4xl">{stat.value}</p>
                          <p className="mt-2 text-sm font-medium text-foreground">{stat.label}</p>
                          {stat.note && <p className="mt-1 text-xs leading-5 text-muted-foreground">{stat.note}</p>}
                        </div>
                      </FadeInSection>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {site.partnerMarket && (
              <section className="bg-card px-6 py-20">
                <div className="mx-auto max-w-[1280px]">
                  <FadeInSection>
                    <SectionHeading eyebrow="为什么值得合作" title="市场大、门槛低、产品好卖、总部扶持" subtitle="账大师把复杂的财税服务变成一款客户听得懂的标准化 AI 产品，让你更容易成交、更容易交付。" />
                  </FadeInSection>
                  <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-2 lg:grid-cols-3">
                    {site.partnerMarket.reasons.map((reason, index) => (
                      <FadeInSection key={reason.title} delay={(index % 3) * 70}>
                        <div className="h-full rounded-3xl border border-border bg-background p-6 transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(79,123,255,.14)]">
                          <IconBox icon={reason.icon} />
                          <h3 className="mt-5 text-lg font-semibold">{reason.title}</h3>
                          <p className="mt-3 text-sm leading-6 text-muted-foreground">{reason.body}</p>
                        </div>
                      </FadeInSection>
                    ))}
                  </div>
                  <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
                    {site.partnerMarket.supports.map((support) => (
                      <div key={support.title} className="rounded-2xl border border-primary/15 bg-primary/5 p-5">
                        <p className="text-sm font-semibold text-primary">{support.title}</p>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">{support.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            <section className="px-6 py-20">
              <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[1fr_1fr]">
                <FadeInSection>
                  <div>
                    <SectionHeading align="left" eyebrow="代理合作意向" title="留下信息，专属对接你的区域与合作节奏" subtitle="你负责客户信任和本地资源，我们提供产品、价格、演示资料、开通方法和服务支持。" level={site.partnerMarket ? 'h2' : 'h1'} />
                    <div className="mt-8 grid gap-3 rounded-[28px] border border-border bg-card p-6 shadow-[0_18px_54px_rgba(24,36,61,.08)] sm:grid-cols-[110px_1fr] sm:items-center">
                      <Image src="/images/wechat-qr.png" alt="姚经理企业微信二维码" width={110} height={110} className="rounded-2xl border border-border" />
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold">{site.company.manager}</p>
                        <a href={contactHref} className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><Phone className="size-4" />{site.company.contact}</a>
                        <a href={`mailto:${site.company.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><Mail className="size-4" />{site.company.email}</a>
                        <p className="text-xs leading-5 text-text-tertiary">{ui.qrNote}</p>
                      </div>
                    </div>
                  </div>
                </FadeInSection>
                <FadeInSection delay={120}>{renderPartnerForm()}</FadeInSection>
              </div>
            </section>
          </>
        )}

        {page === 'news' && (
          <section className="relative overflow-hidden px-6 py-20 md:py-24">
            <div className="bg-grid absolute inset-0 -z-10" />
            <div className="aurora aurora-1 animate-aurora" style={{ width: 360, height: 360, top: -120, left: '10%' }} />
            <div className="mx-auto max-w-[1280px]">
              <FadeInSection>
                <SectionHeading eyebrow={news.eyebrow} title={news.title} subtitle={news.subtitle} level="h1" />
              </FadeInSection>
              <div className="mt-10 flex flex-wrap justify-center gap-2 md:gap-3">
                {newsCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${activeCategory === category ? 'border-transparent bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] text-white shadow-lg shadow-primary/25' : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
                {filteredArticles.map((item, index) => (
                  <FadeInSection key={item.slug} delay={(index % 2) * 100}>
                    <a href={`${site.path}news/${item.slug}/`} className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_18px_54px_rgba(24,36,61,.08)] transition-all hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(79,123,255,.16)]">
                      <div className="relative aspect-[16/9] bg-secondary">
                        <Image src={item.cover} alt={item.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(min-width: 768px) 45vw, 100vw" />
                        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">{item.category}</span>
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <span className="text-xs text-text-tertiary">{item.date}</span>
                        <h2 className="mt-2 text-xl font-semibold leading-snug">{item.title}</h2>
                        <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">{item.summary}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex flex-wrap gap-1.5">
                            {(item.tags ?? []).map((tag) => <span key={tag} className="rounded-full bg-background px-2 py-1 text-[11px] text-muted-foreground">#{tag}</span>)}
                          </div>
                          <span className="inline-flex items-center text-sm font-semibold text-primary">{news.read}<ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" /></span>
                        </div>
                      </div>
                    </a>
                  </FadeInSection>
                ))}
              </div>
            </div>
          </section>
        )}

        {page === 'newsDetail' && article && (
          <section className="relative overflow-hidden px-6 py-16 md:py-24">
            <div className="bg-grid absolute inset-0 -z-10" />
            <article className="mx-auto max-w-4xl">
              <a href={`${site.path}news/`} className="inline-flex items-center text-sm font-semibold text-primary">
                <ArrowRight className="mr-2 size-4 rotate-180" />
                {news.back}
              </a>
              <header className="mt-8">
                <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-primary">
                  <span className="rounded-full bg-primary/10 px-3 py-1">{article.category}</span>
                  <span className="text-muted-foreground">{article.date}</span>
                </div>
                <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight md:text-5xl">{article.title}</h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">{article.lead}</p>
              </header>
              <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-[30px] border border-border bg-secondary shadow-[0_18px_54px_rgba(24,36,61,.10)]">
                <Image src={article.cover} alt={article.title} fill className="object-cover" priority sizes="(min-width: 1024px) 896px, 100vw" />
              </div>
              <div className="mx-auto mt-12 max-w-3xl space-y-12">
                {article.sections.map((section) => (
                  <section key={section.title}>
                    <h2 className="text-2xl font-semibold leading-snug">{section.title}</h2>
                    <div className="mt-5 space-y-4 text-base leading-8 text-muted-foreground">
                      {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                    </div>
                    {section.image && (
                      <figure className="mt-7">
                        {/* CMS images may come from Vercel Blob or another configured object store. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={section.image}
                          alt={section.imageAlt || section.imageCaption || section.title}
                          className="h-auto w-full rounded-2xl object-cover"
                          loading="lazy"
                        />
                        {section.imageCaption && <figcaption className="mt-3 text-sm leading-6 text-muted-foreground">{section.imageCaption}</figcaption>}
                      </figure>
                    )}
                  </section>
                ))}
                <footer className="border-t border-border pt-8 text-base leading-8 text-muted-foreground">
                  {article.closing.map((paragraph) => <p key={paragraph} className="mt-4 first:mt-0">{paragraph}</p>)}
                </footer>
              </div>
            </article>
          </section>
        )}

        {page === 'join' && (
          <section className="relative overflow-hidden px-6 py-20 md:py-24">
            <div className="bg-grid absolute inset-0 -z-10" />
            <div className="aurora aurora-1 animate-aurora" style={{ width: 360, height: 360, top: -120, left: '10%' }} />
            <div className="mx-auto max-w-[1280px]">
              <FadeInSection>
                <SectionHeading eyebrow={jobs.eyebrow} title={jobs.title} subtitle={jobs.subtitle} level="h1" />
              </FadeInSection>
              <div className="mt-12 grid gap-6 lg:grid-cols-2">
                {jobs.jobs.map((job, index) => (
                  <FadeInSection key={job.title} delay={index * 100}>
                    <article className="h-full rounded-[30px] border border-border bg-card p-7 shadow-[0_18px_54px_rgba(24,36,61,.08)]">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-primary">岗位 {index + 1}</p>
                          <h2 className="mt-3 text-2xl font-semibold">{job.title}</h2>
                        </div>
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{job.salary}</span>
                      </div>
                      <div className="mt-6 grid gap-6">
                        <div>
                          <h3 className="text-sm font-semibold">岗位职责</h3>
                          <ul className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                            {job.responsibilities.map((item) => (
                              <li key={item} className="flex gap-3"><CheckCircle2 className="mt-1 size-4 shrink-0 text-status-online" /><span>{item}</span></li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold">任职要求</h3>
                          <ul className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                            {job.requirements.map((item) => (
                              <li key={item} className="flex gap-3"><BadgeCheck className="mt-1 size-4 shrink-0 text-primary" /><span>{item}</span></li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </article>
                  </FadeInSection>
                ))}
              </div>
              <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center justify-center gap-4 rounded-[28px] border border-border bg-card p-6 text-center shadow-[0_18px_54px_rgba(24,36,61,.08)] sm:flex-row sm:justify-between sm:text-left">
                <div>
                  <p className="text-xs font-semibold text-primary">{jobs.manager}</p>
                  <a href={`tel:${jobs.phone}`} className="mt-1 block text-2xl font-semibold text-foreground hover:text-primary">{jobs.phone}</a>
                </div>
                <div className="h-px w-full bg-border sm:h-12 sm:w-px" />
                <div>
                  <p className="text-xs font-semibold text-primary">{jobs.emailLabel}</p>
                  <a href={`mailto:${jobs.email}`} className="mt-1 block break-all text-2xl font-semibold text-foreground hover:text-primary">{jobs.email}</a>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {trialOpen && (
        <div className="fixed inset-0 z-[80] flex min-h-[100dvh] items-start justify-center overflow-y-auto overscroll-contain bg-[#18243D]/45 px-3 py-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
          <div role="dialog" aria-modal="true" aria-labelledby="trial-dialog-title" className="w-full max-w-[620px] overflow-y-auto rounded-3xl bg-card p-5 shadow-[0_24px_80px_rgba(24,36,61,.24)] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[28px] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-primary">{trial.eyebrow}</p>
                <h3 id="trial-dialog-title" className="mt-2 text-xl font-semibold leading-tight sm:text-2xl">{trial.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground sm:leading-7">{trial.desc}</p>
              </div>
              <button type="button" onClick={() => { setTrialOpen(false); setTrialSubmitted(false); setTrialApiError(''); setTrialSuccessMessage('') }} className="rounded-full p-2 text-muted-foreground hover:bg-muted" aria-label="关闭">
                <X className="size-5" />
              </button>
            </div>

            {trialSubmitted ? (
              <div className="mt-6 rounded-3xl bg-background p-6 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><CheckCircle2 className="size-6" /></div>
                <h4 className="mt-4 text-xl font-semibold">{trial.successTitle}</h4>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{trialSuccessMessage || trial.successDesc}</p>
              </div>
            ) : (
              <>
                <div className="mt-5 grid gap-2 sm:mt-6 sm:gap-3">
                  {trial.steps.map(([index, title, desc]) => (
                    <div key={index} className="flex gap-3 rounded-2xl bg-background p-3 sm:p-4">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">{index}</span>
                      <div>
                        <p className="font-semibold">{title}</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <form noValidate onSubmit={submitTrialForm} className="mt-5 grid gap-4 sm:mt-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium">
                      <span className="inline-flex w-fit items-baseline gap-1 whitespace-nowrap">{trial.contactName}<span className="text-red-500">*</span></span>
                      <input value={trialForm.contactName} onChange={(event) => updateTrialField('contactName', event.target.value)} className={`h-12 text-base sm:text-sm ${trialFieldClass('contactName')}`} placeholder={trial.contactNamePlaceholder} maxLength={trialContactNameMaxLength} />
                      {trialFieldError('contactName')}
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      <span className="inline-flex w-fit items-baseline gap-1 whitespace-nowrap">{trial.contactPhone}<span className="text-red-500">*</span></span>
                      <input value={trialForm.contactPhone} onChange={(event) => updateTrialField('contactPhone', event.target.value)} className={`h-12 text-base sm:text-sm ${trialFieldClass('contactPhone')}`} placeholder={trial.contactPhonePlaceholder} maxLength={trialContactPhoneMaxLength} />
                      {trialFieldError('contactPhone')}
                    </label>
                  </div>
                  <label className="grid gap-2 text-sm font-medium">
                    {trial.inviteCode}
                    <input value={trialForm.inviteCode} onChange={(event) => updateTrialField('inviteCode', event.target.value)} className={`h-12 text-base sm:text-sm ${trialFieldClass('inviteCode')}`} placeholder={trial.inviteCodePlaceholder} />
                  </label>
                  {trialApiError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">{trialApiError}</p>}
                  <button type="submit" disabled={trialSubmitting} className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] px-6 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm">
                    {trialSubmitting ? ui.submitting : trial.submit}
                    <Send className="ml-2 size-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {partnerSent && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#18243D]/45 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[520px] rounded-[28px] bg-card p-6 text-center shadow-[0_24px_80px_rgba(24,36,61,.24)]">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Headphones className="size-7" /></div>
            <h3 className="mt-5 text-2xl font-semibold">{ui.partnerReceivedTitle}</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{ui.partnerReceivedDesc}</p>
            <div className="mt-6 grid gap-4 rounded-3xl bg-background p-5 text-left sm:grid-cols-[120px_1fr]">
              <Image src="/images/wechat-qr.png" alt="姚经理企业微信二维码" width={120} height={120} className="rounded-2xl border border-border" />
              <div className="space-y-3 text-sm">
                <p className="font-semibold">{site.company.manager}</p>
                <a href={contactHref} className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><Phone className="size-4" />{site.company.contact}</a>
                <a href={`mailto:${site.company.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground"><Mail className="size-4" />{site.company.email}</a>
                <p className="text-xs leading-5 text-muted-foreground">{ui.qrNote}</p>
              </div>
            </div>
            <button type="button" onClick={() => setPartnerSent(false)} className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-border px-6 text-sm font-semibold hover:bg-secondary">{ui.confirm}</button>
          </div>
        </div>
      )}

      <Footer site={site} />
    </div>
  )
}
