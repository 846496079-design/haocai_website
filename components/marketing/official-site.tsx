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
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import FadeInSection from '@/components/ui/fade-in-section'
import type { IconKey, SiteContent } from '@/lib/site-content'
import { getNewsArticle, newsArticles } from '@/lib/news-content'

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
const trialLeadApiUrl = 'https://hcagent.ai-hc.cn/api/v1/customer-lead-pool-leads/submit'
const partnerLeadMaxLength = 50
const trialContactNameMaxLength = 50
const trialContactPhoneMaxLength = 20

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
    companyHeroTitle: '让天下企业拥有一个 AI 财税大脑',
    companyHeroDesc:
      '账大师（上海）人工智能技术有限公司成立于 2014 年，专注于人工智能、大数据、云计算与企业财务服务的融合创新。我们以账大师为产品载体，持续探索更智能、更高效、更易协同的企业财务管理方式。',
    professionalEyebrow: '专业能力',
    professionalTitle: '以 AI 技术，连接财务流程与经营决策',
    professionalDesc:
      '从资料归集、智能处理、数据核对到经营分析，账大师帮助企业把高频财务工作沉淀为清晰流程，并为管理者提供更及时的经营信息参考。',
    cards: [
      ['AI 财务智能化', '围绕 AI 大模型、智能 Agent 与自动化工作流，探索企业财务服务的新一代产品形态。'],
      ['产品、技术与服务协同', '以产品承接高频场景，以技术持续迭代，以服务支持企业与合作伙伴更好地落地使用。'],
      ['开放合作生态', '与企业服务伙伴保持长期协同，共同探索 AI 在企业经营管理中的更多应用场景。'],
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
    companyHeroTitle: 'すべての企業に AI 財税ブレーンを',
    companyHeroDesc:
      '账大师（上海）人工智能技术有限公司は 2014 年に設立され、AI、大数据、クラウドと企業財務サービスの融合を探求しています。',
    professionalEyebrow: '専門性',
    professionalTitle: 'AI で財務プロセスと経営判断をつなぐ',
    professionalDesc:
      '情報収集、照合、分析までの高頻度な業務を整理し、企業が経営情報をより早く把握できるよう支援します。',
    cards: [
      ['AI 財務の進化', 'AI 大模型、智能 Agent、自動化ワークフローを活用した新しい財務サービスを探求。'],
      ['製品・技術・サービス', '製品、技術、サービスを連携させ、利用定着を支援。'],
      ['協業エコシステム', '企業サービスのパートナーとともに、AI の活用場面を広げます。'],
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
    companyHeroTitle: '讓天下企業擁有一個 AI 財稅大腦',
    companyHeroDesc:
      '賬大師（上海）人工智能技術有限公司成立於 2014 年，專注人工智能、大數據、雲計算與企業財務服務的融合創新，持續探索更智能、更高效、更易協同的企業財務管理方式。',
    professionalEyebrow: '專業能力',
    professionalTitle: '以 AI 技術，連接財務流程與經營決策',
    professionalDesc:
      '從資料歸集、智能處理、數據核對到經營分析，賬大師協助企業把高頻財務工作沉澱為清晰流程，並提供更及時的經營信息參考。',
    cards: [
      ['AI 財務智能化', '圍繞 AI 大模型、智能 Agent 與自動化工作流，探索企業財務服務的新一代產品形態。'],
      ['產品、技術與服務協同', '以產品承接高頻場景，以技術持續迭代，以服務支持企業與合作夥伴落地使用。'],
      ['開放合作生態', '與企業服務夥伴保持長期協同，共同探索 AI 在企業經營管理中的更多應用場景。'],
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

const productSuiteCopy = {
  cn: {
    eyebrow: '产品中心',
    title: '以账大师为核心，构建一站式 B 端企业智能解决方案',
    subtitle:
      '账大师是当前主推产品，围绕财税管理先落地；好财还将逐步推出外呼、客服、内容运营、招聘、渠道管理、桌面自动化和 AI 中台能力，帮助企业把重复工作系统化。',
    primaryProduct: {
      name: '好财账大师',
      shortName: '账大师',
      status: '主推产品',
      description:
        '面向小微企业、财务人员和代账机构，把工资、发票、银行流水、核对、报表和待办提醒统一到一套流程里。',
      bullets: ['360 元/年', 'AI 三步智能记账', '移动端与电脑端协同', '适合财税和代账场景'],
    },
    products: [
      ['好财大模型 AI 语音外呼', '好财 AI 外呼', '用于客户回访、政策触达、线索跟进和标准化电话任务。'],
      ['好财全渠道智能客户服务系统', '好财智服', '统一承接企业微信、电话、网页和工单咨询，沉淀客户服务记录。'],
      ['好财新媒体内容运营管理系统', '好财新媒通', '管理选题、素材、发布、复盘和销售转发，服务企业获客。'],
      ['好财 Future-AI 桌面自动化任务助手软件', '好财桌面助手', '面向桌面端重复任务执行，辅助资料整理、表格处理和流程操作。'],
      ['好财合作伙伴与代理商综合管理系统', '好财渠道通', '管理代理线索、渠道政策、客户资源、开通进度和合作复盘。'],
      ['好财 AI 人才甄选与招聘管理系统', '好财智聘', '支持简历筛选、候选人跟进、面试排期和招聘协同。'],
      ['好财 Future-AI 企业级人工智能中台系统', '好财 AI 中台', '为企业内部系统提供模型能力、Agent 编排和自动化任务支撑。'],
    ],
    solutionTitle: '解决方案不再单独拆页，统一放在产品中心',
    solutionCards: [
      ['财税管理', '账大师承接工资、发票、流水、报表和税额测算，先解决小微企业最频繁的财税协同。'],
      ['客户经营', 'AI 外呼、智能客服和新媒体工作台承接获客、跟进、咨询和内容转化。'],
      ['组织效率', '智能招聘、桌面助手和 AI 中台面向内部效能系统，减少重复劳动。'],
      ['渠道合作', '渠道通与代理合作线索池衔接，帮助合作伙伴管理客户资源和开通进度。'],
    ],
  },
  jp: {
    eyebrow: '製品センター',
    title: '账大师を中心に、B 向け企業智能ソリューションを展開',
    subtitle:
      '账大师は現在の主力製品です。財税管理から始め、外呼、客服、内容運営、採用、チャネル管理、デスクトップ自動化、AI 中台へ段階的に拡張します。',
    primaryProduct: {
      name: '好财账大师',
      shortName: '账大师',
      status: '主力製品',
      description: '給与、発票、銀行流水、照合、帳票、タスク確認を一つのフローにまとめます。',
      bullets: ['360 元/年', 'AI 三步智能記帳', 'Web と Mobile', '財税と代行記帳向け'],
    },
    products: [
      ['好财大模型 AI 语音外呼', '好财 AI 外呼', '顧客フォロー、政策案内、リード追跡、標準電話業務を支援。'],
      ['好财全渠道智能客户服务系统', '好财智服', '複数チャネルの問い合わせとサービス記録を統合。'],
      ['好财新媒体内容运营管理系统', '好财新媒通', '企画、素材、配信、振り返り、営業転送を管理。'],
      ['好财 Future-AI 桌面自动化任务助手软件', '好财桌面助手', 'デスクトップ上の反復作業と資料整理を支援。'],
      ['好财合作伙伴与代理商综合管理系统', '好财渠道通', '代理リード、政策、顧客資源、開通進捗を管理。'],
      ['好财 AI 人才甄选与招聘管理系统', '好财智聘', '履歴書選別、候補者フォロー、面接調整を支援。'],
      ['好财 Future-AI 企业级人工智能中台系统', '好财 AI 中台', 'モデル能力、Agent 編排、自動化タスクの基盤。'],
    ],
    solutionTitle: 'ソリューションは製品センターに統合',
    solutionCards: [
      ['財税管理', '账大师が給与、発票、銀行流水、帳票、税額試算を支援。'],
      ['顧客運営', 'AI 外呼、智能客服、新媒体工作台で獲客と問い合わせを支援。'],
      ['組織効率', '智能招聘、桌面助手、AI 中台で反復作業を削減。'],
      ['チャネル協業', '渠道通と代理リード池で顧客資源と開通進捗を管理。'],
    ],
  },
  hk: {
    eyebrow: '產品中心',
    title: '以賬大師為核心，構建一站式 B 端企業智能解決方案',
    subtitle:
      '賬大師是目前主推產品，圍繞財稅管理先落地；好財將逐步推出外呼、客服、內容運營、招聘、渠道管理、桌面自動化和 AI 中台能力。',
    primaryProduct: {
      name: '好財賬大師',
      shortName: '賬大師',
      status: '主推產品',
      description: '面向小微企業、財務人員和代賬機構，把工資、發票、銀行流水、核對、報表和待辦提醒統一到一套流程裡。',
      bullets: ['360 元/年', 'AI 三步智能記賬', '移動端與電腦端協同', '適合財稅和代賬場景'],
    },
    products: [
      ['好財大模型 AI 語音外呼', '好財 AI 外呼', '用於客戶回訪、政策觸達、線索跟進和標準化電話任務。'],
      ['好財全渠道智能客戶服務系統', '好財智服', '統一承接企業微信、電話、網頁和工單諮詢，沉澱客戶服務記錄。'],
      ['好財新媒體內容運營管理系統', '好財新媒通', '管理選題、素材、發布、復盤和銷售轉發，服務企業獲客。'],
      ['好財 Future-AI 桌面自動化任務助手軟件', '好財桌面助手', '面向桌面端重複任務執行，輔助資料整理、表格處理和流程操作。'],
      ['好財合作夥伴與代理商綜合管理系統', '好財渠道通', '管理代理線索、渠道政策、客戶資源、開通進度和合作復盤。'],
      ['好財 AI 人才甄選與招聘管理系統', '好財智聘', '支持簡歷篩選、候選人跟進、面試排期和招聘協同。'],
      ['好財 Future-AI 企業級人工智能中台系統', '好財 AI 中台', '為企業內部系統提供模型能力、Agent 編排和自動化任務支撐。'],
    ],
    solutionTitle: '解決方案不再單獨拆頁，統一放在產品中心',
    solutionCards: [
      ['財稅管理', '賬大師承接工資、發票、流水、報表和稅額測算，先解決高頻財稅協同。'],
      ['客戶經營', 'AI 外呼、智能客服和新媒體工作台承接獲客、跟進、諮詢和內容轉化。'],
      ['組織效率', '智能招聘、桌面助手和 AI 中台面向內部效能系統，減少重複勞動。'],
      ['渠道合作', '渠道通與代理合作線索池銜接，協助合作夥伴管理客戶資源和開通進度。'],
    ],
  },
}

const newsCopy = {
  cn: {
    eyebrow: '新闻中心',
    title: '好财动态与 AI 财税观察',
    subtitle: '关注好财账大师的产品实践、企业交流与 AI 财税观察。',
    categories: ['公司动态', '产品动态', '行业观察'],
    back: '返回新闻中心',
    read: '阅读全文',
  },
  jp: {
    eyebrow: 'ニュース',
    title: '好财ニュースと AI 財税の観察',
    subtitle: '好财账大师の製品実践、企業交流、AI 財税の取り組みを紹介します。',
    categories: ['会社ニュース', '製品ニュース', '業界情報'],
    back: 'ニュース一覧へ戻る',
    read: '全文を読む',
  },
  hk: {
    eyebrow: '新聞中心',
    title: '好財動態與 AI 財稅觀察',
    subtitle: '關注好財賬大師的產品實踐、企業交流與 AI 財稅觀察。',
    categories: ['公司動態', '產品動態', '行業觀察'],
    back: '返回新聞中心',
    read: '閱讀全文',
  },
}

const homeHookCopy = {
  cn: {
    eyebrow: 'AI 财税从高频痛点开始落地',
    title: ['老板不想等月底', '财务不想反复催资料'],
    description:
      '工资、发票、流水、税额和报表散在不同人手里，月底才开始补材料、对异常、问结果。好财从真实财税工作流切入，用账大师先把小微企业最频繁的记账报税协同做清楚。',
    primary: '看账大师怎么解决',
    news: '查看新闻中心',
    productTitle: '继续看完整产品中心',
    productDesc: '了解账大师主推能力，以及好财即将推出的一站式 B 端企业产品矩阵。',
    productLink: '产品中心',
    joinTitle: '加入我们',
    joinDesc: '财务疑难处理与全栈开发两个方向正在招募，欢迎直接投递简历。',
    joinLink: '加入我们',
  },
  jp: {
    eyebrow: 'AI 財税は高頻度な課題から実装',
    title: ['経営者は月末まで待ちたくない', '財務担当は資料催促を減らしたい'],
    description:
      '給与、発票、銀行流水、税額、帳票が分散すると、月末に資料補完と確認が集中します。好财は実際の財税フローから始め、账大师で小規模企業の記帳協同を整理します。',
    primary: '账大师を見る',
    news: 'ニュースを見る',
    productTitle: '製品センターを見る',
    productDesc: '账大师の主力機能と、好财が展開予定の B 向け製品群を確認できます。',
    productLink: '製品センター',
    joinTitle: '採用情報',
    joinDesc: '財務難題対応とフルスタック開発の二つの方向で募集しています。',
    joinLink: '採用情報',
  },
  hk: {
    eyebrow: 'AI 財稅從高頻痛點開始落地',
    title: ['老闆不想等月底', '財務不想反覆催資料'],
    description:
      '工資、發票、流水、稅額和報表散在不同人手裡，月底才開始補材料、對異常、問結果。好財從真實財稅工作流切入，用賬大師先把小微企業最頻繁的記賬報稅協同做清楚。',
    primary: '看賬大師怎麼解決',
    news: '查看新聞中心',
    productTitle: '繼續看完整產品中心',
    productDesc: '了解賬大師主推能力，以及好財即將推出的一站式 B 端企業產品矩陣。',
    productLink: '產品中心',
    joinTitle: '加入我們',
    joinDesc: '財務疑難處理與全棧開發兩個方向正在招募，歡迎直接投遞簡歷。',
    joinLink: '加入我們',
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
    submit: '提交试用申请',
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
  level = 'h2',
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  level?: 'h1' | 'h2'
}) {
  const HeadingTag = level
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold text-primary">{eyebrow}</p>
      )}
      <HeadingTag className="text-3xl font-semibold leading-tight text-foreground md:text-4xl">
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
  | 'inviteCode'
  | 'message'

const requiredPartnerFields: PartnerField[] = ['name', 'phone', 'city']

type TrialField = 'contactName' | 'contactPhone' | 'inviteCode'

type OfficialPage = 'home' | 'product' | 'company' | 'partners' | 'join' | 'news' | 'newsDetail'

export default function OfficialSite({
  site,
  page = 'home',
  articleSlug,
}: {
  site: SiteContent
  page?: OfficialPage
  articleSlug?: string
}) {
  const contactHref = `tel:${site.company.contact}`
  const copy = pageCopy[site.code]
  const productSuite = productSuiteCopy[site.code]
  const news = newsCopy[site.code]
  const articles = newsArticles[site.code]
  const article = articleSlug ? getNewsArticle(site.code, articleSlug) : undefined
  const homeHook = homeHookCopy[site.code]
  const trial = trialCopy[site.code]
  const jobs = jobCopy[site.code]
  const ui = uiCopy[site.code]
  const partnerOptions = partnerOptionCopy[site.code]
  const [trialOpen, setTrialOpen] = useState(false)
  const [trialSubmitted, setTrialSubmitted] = useState(false)
  const [trialSubmitting, setTrialSubmitting] = useState(false)
  const [trialApiError, setTrialApiError] = useState('')
  const [trialSuccessMessage, setTrialSuccessMessage] = useState('')
  const [trialForm, setTrialForm] = useState({
    contactName: '',
    contactPhone: '',
    inviteCode: '',
  })
  const [trialErrors, setTrialErrors] = useState<Partial<Record<TrialField, string>>>({})
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
    inviteCode: '',
    message: '',
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
    if (partnerApiError) {
      setPartnerApiError('')
    }
    if (partnerErrors[field]) {
      setPartnerErrors((errors) => ({ ...errors, [field]: undefined }))
    }
  }

  function updateTrialField(field: TrialField, value: string) {
    setTrialForm((form) => ({ ...form, [field]: value }))
    if (trialApiError) {
      setTrialApiError('')
    }
    if (trialErrors[field]) {
      setTrialErrors((errors) => ({ ...errors, [field]: undefined }))
    }
  }

  function trialFieldClass(field: TrialField) {
    return `rounded-xl border bg-card px-4 font-normal outline-none transition-colors focus:border-primary ${
      trialErrors[field] ? 'border-red-400' : 'border-border'
    }`
  }

  function trialFieldError(field: TrialField) {
    return trialErrors[field] ? (
      <p className="text-xs font-normal text-red-500">{trialErrors[field]}</p>
    ) : null
  }

  async function submitTrialForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: Partial<Record<TrialField, string>> = {}
    const contactName = trialForm.contactName.trim()
    const contactPhone = trialForm.contactPhone.trim()

    if (!contactName) {
      nextErrors.contactName = ui.requiredError
    } else if (contactName.length > trialContactNameMaxLength) {
      nextErrors.contactName = ui.contactNameLengthError
    }
    if (!contactPhone) {
      nextErrors.contactPhone = ui.requiredError
    } else if (contactPhone.length > trialContactPhoneMaxLength) {
      nextErrors.contactPhone = ui.contactPhoneLengthError
    }

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

      setTrialSuccessMessage(message || trial.successDesc)
      setTrialSubmitted(true)
    } catch {
      setTrialApiError(ui.submitError)
    } finally {
      setTrialSubmitting(false)
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

    const inviteCode =
      partnerForm.inviteCode.trim() ||
      new URLSearchParams(window.location.search).get('inviteCode') ||
      undefined
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
          <label className="grid gap-2 text-sm font-medium md:col-span-2">
            {ui.inviteCode}
            <input
              value={partnerForm.inviteCode}
              onChange={(event) => updatePartnerField('inviteCode', event.target.value)}
              className={`h-12 ${fieldClass('inviteCode')}`}
              placeholder={ui.inviteCodePlaceholder}
              maxLength={partnerLeadMaxLength}
            />
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
      <Navbar site={site} onTrialClick={() => setTrialOpen(true)} />

      <main className={page === 'product' ? 'xl:pl-44' : undefined}>
        {page === 'home' && (
          <>
            <section className="relative overflow-hidden px-6 py-20 md:py-28">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_0%,rgba(91,108,255,0.16),transparent_34%),radial-gradient(circle_at_82%_10%,rgba(34,197,94,0.10),transparent_28%)]" />
              <div className="mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[1fr_480px]">
                <FadeInSection>
                  <div>
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-[0_4px_18px_rgba(38,67,104,.05)]">
                      <span className="size-2 rounded-full bg-status-online" />
                      {homeHook.eyebrow}
                    </div>
                    <h1 className="max-w-4xl text-4xl font-semibold leading-[1.12] tracking-tight text-foreground md:text-6xl">
                      <span className="block">{homeHook.title[0]}</span>
                      <span className="mt-2 block text-primary">{homeHook.title[1]}</span>
                    </h1>
                    <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
                      {homeHook.description}
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <a href={`${site.path}product/`} className="inline-flex h-12 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] px-6 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
                        {homeHook.primary}
                        <ArrowRight className="ml-2 size-4" />
                      </a>
                      <a href={`${site.path}news/`} className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-secondary">
                        {homeHook.news}
                      </a>
                    </div>
                  </div>
                </FadeInSection>
                <FadeInSection delay={120}>
                  <div className="rounded-[32px] border border-border bg-card p-5 shadow-[0_24px_70px_rgba(24,36,61,.12)]">
                    <Image
                      src="/images/brand/haocai-zds-logo-horizontal.png"
                      alt="好财集团 账大师"
                      width={520}
                      height={124}
                      className="h-14 w-auto"
                      priority
                    />
                    <div className="mt-6 rounded-3xl bg-background p-5">
                      <p className="text-sm font-semibold text-primary">{productSuite.primaryProduct.status}</p>
                      <h2 className="mt-2 text-3xl font-semibold">{productSuite.primaryProduct.name}</h2>
                      <p className="mt-4 text-sm leading-7 text-muted-foreground">{productSuite.primaryProduct.description}</p>
                      <div className="mt-5 grid gap-2 sm:grid-cols-2">
                        {productSuite.primaryProduct.bullets.map((item) => (
                          <span key={item} className="rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                    <a href={`${site.path}product/`} className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-sm font-semibold text-primary">
                      进入产品中心
                      <ArrowRight className="ml-2 size-4" />
                    </a>
                  </div>
                </FadeInSection>
              </div>
            </section>

            <section className="px-6 py-20">
              <div className="mx-auto max-w-[1280px]">
                <SectionHeading title={site.painTitle} subtitle={site.painSubtitle} />
                <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                  {site.pains.map((pain) => (
                    <div key={pain.title} className="h-full rounded-3xl border border-border bg-card p-6">
                      <IconBox icon={pain.icon} />
                      <h3 className="mt-5 text-lg font-semibold">{pain.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{pain.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-card px-6 py-20">
              <div className="mx-auto max-w-[1280px]">
                <SectionHeading title={productSuite.title} subtitle={productSuite.subtitle} />
                <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                  {productSuite.products.slice(0, 4).map(([fullName, shortName, desc]) => (
                    <div key={shortName} className="rounded-3xl border border-border bg-background p-6">
                      <p className="text-xs font-semibold text-primary">{shortName}</p>
                      <h3 className="mt-3 text-lg font-semibold">{fullName}</h3>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="px-6 py-20">
              <div className="mx-auto grid max-w-[1280px] gap-6 lg:grid-cols-3">
                <div className="flex min-h-[264px] flex-col rounded-[28px] border border-border bg-card p-7">
                  <h2 className="text-2xl font-semibold">{homeHook.productTitle}</h2>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{homeHook.productDesc}</p>
                  <a href={`${site.path}product/`} className="mt-auto inline-flex pt-6 text-sm font-semibold text-primary">
                    {homeHook.productLink}
                    <ArrowRight className="ml-2 size-4" />
                  </a>
                </div>
                <div className="flex min-h-[264px] flex-col rounded-[28px] border border-border bg-card p-7">
                  <h2 className="text-2xl font-semibold">{news.title}</h2>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{news.subtitle}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {news.categories.map((item) => (
                      <span key={item} className="rounded-full bg-background px-3 py-1 text-xs text-muted-foreground">{item}</span>
                    ))}
                  </div>
                  <a href={`${site.path}news/`} className="mt-auto inline-flex pt-6 text-sm font-semibold text-primary">
                    新闻中心
                    <ArrowRight className="ml-2 size-4" />
                  </a>
                </div>
                <div className="flex min-h-[264px] flex-col rounded-[28px] border border-border bg-card p-7">
                  <h2 className="text-2xl font-semibold">{homeHook.joinTitle}</h2>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{homeHook.joinDesc}</p>
                  <a href={`${site.path}join/`} className="mt-auto inline-flex pt-6 text-sm font-semibold text-primary">
                    {homeHook.joinLink}
                    <ArrowRight className="ml-2 size-4" />
                  </a>
                </div>
              </div>
            </section>
          </>
        )}

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

        <section className="bg-card px-6 py-20">
          <div className="mx-auto max-w-[1280px]">
            <SectionHeading
              eyebrow={productSuite.eyebrow}
              title={productSuite.title}
              subtitle={productSuite.subtitle}
            />
            <div className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_1.35fr]">
              <div className="rounded-[28px] border border-primary/20 bg-background p-7 shadow-[0_18px_54px_rgba(24,36,61,.08)]">
                <p className="text-sm font-semibold text-primary">{productSuite.primaryProduct.status}</p>
                <h2 className="mt-3 text-3xl font-semibold">{productSuite.primaryProduct.name}</h2>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{productSuite.primaryProduct.description}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {productSuite.primaryProduct.bullets.map((item) => (
                    <div key={item} className="rounded-2xl border border-border bg-card p-4 text-sm font-medium">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {productSuite.products.map(([fullName, shortName, desc]) => (
                  <div key={shortName} className="rounded-3xl border border-border bg-background p-5">
                    <p className="text-xs font-semibold text-primary">{shortName}</p>
                    <h3 className="mt-2 text-base font-semibold">{fullName}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-12">
              <SectionHeading title={productSuite.solutionTitle} />
              <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {productSuite.solutionCards.map(([title, desc]) => (
                  <div key={title} className="rounded-3xl border border-border bg-background p-6">
                    <IconBox icon="layers" />
                    <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
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
                    level="h1"
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

        {page === 'news' && (
          <section className="relative overflow-hidden px-6 py-20 md:py-24">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_0%,rgba(91,108,255,0.14),transparent_34%),radial-gradient(circle_at_86%_12%,rgba(34,197,94,0.10),transparent_28%)]" />
            <div className="mx-auto max-w-[1280px]">
              <FadeInSection>
                <SectionHeading
                  eyebrow={news.eyebrow}
                  title={news.title}
                  subtitle={news.subtitle}
                  level="h1"
                />
              </FadeInSection>
              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {news.categories.map((category) => (
                  <span key={category} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground">
                    {category}
                  </span>
                ))}
              </div>
              <div className="mx-auto mt-12 grid max-w-4xl gap-6">
                {articles.map((item, index) => (
                  <FadeInSection key={item.slug} delay={index * 100}>
                    <article className="overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_18px_54px_rgba(24,36,61,.08)] md:grid md:grid-cols-[0.9fr_1.1fr]">
                      <div className="relative min-h-64 bg-secondary">
                        <Image src={item.cover} alt={item.title} fill className="object-cover" sizes="(min-width: 768px) 40vw, 100vw" />
                      </div>
                      <div className="flex min-h-64 flex-col p-7 md:p-9">
                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-primary">
                          <span>{item.category}</span>
                          <span className="text-muted-foreground">{item.date}</span>
                        </div>
                        <h2 className="mt-4 text-2xl font-semibold leading-snug">{item.title}</h2>
                        <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.summary}</p>
                        <a href={`${site.path}news/${item.slug}/`} className="mt-auto inline-flex pt-6 text-sm font-semibold text-primary">
                          {news.read}
                          <ArrowRight className="ml-2 size-4" />
                        </a>
                      </div>
                    </article>
                  </FadeInSection>
                ))}
              </div>
            </div>
          </section>
        )}

        {page === 'newsDetail' && article && (
          <section className="relative overflow-hidden px-6 py-16 md:py-24">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_0%,rgba(91,108,255,0.14),transparent_34%),radial-gradient(circle_at_86%_12%,rgba(34,197,94,0.10),transparent_28%)]" />
            <article className="mx-auto max-w-4xl">
              <a href={`${site.path}news/`} className="inline-flex items-center text-sm font-semibold text-primary">
                <ArrowRight className="mr-2 size-4 rotate-180" />
                {news.back}
              </a>
              <header className="mt-8">
                <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-primary">
                  <span>{article.category}</span>
                  <span className="text-muted-foreground">{article.date}</span>
                </div>
                <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">{article.title}</h1>
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
                      <figure className="relative mt-7 aspect-[16/10] overflow-hidden rounded-3xl border border-border bg-secondary">
                        <Image src={section.image} alt={section.title} fill className="object-cover" sizes="(min-width: 1024px) 768px, 100vw" />
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
          <>
            <section className="relative overflow-hidden px-6 py-20 md:py-24">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_0%,rgba(91,108,255,0.14),transparent_34%),radial-gradient(circle_at_86%_12%,rgba(34,197,94,0.10),transparent_28%)]" />
              <div className="mx-auto max-w-[1280px]">
                <FadeInSection>
                  <SectionHeading
                    eyebrow={jobs.eyebrow}
                    title={jobs.title}
                    subtitle={jobs.subtitle}
                    level="h1"
                  />
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
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            {job.salary}
                          </span>
                        </div>
                        <div className="mt-6 grid gap-6">
                          <div>
                            <h3 className="text-sm font-semibold">岗位职责</h3>
                            <ul className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                              {job.responsibilities.map((item) => (
                                <li key={item} className="flex gap-3">
                                  <CheckCircle2 className="mt-1 size-4 shrink-0 text-status-online" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold">任职要求</h3>
                            <ul className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                              {job.requirements.map((item) => (
                                <li key={item} className="flex gap-3">
                                  <BadgeCheck className="mt-1 size-4 shrink-0 text-primary" />
                                  <span>{item}</span>
                                </li>
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
                    <a href={`tel:${jobs.phone}`} className="mt-1 block text-2xl font-semibold text-foreground hover:text-primary">
                      {jobs.phone}
                    </a>
                  </div>
                  <div className="h-px w-full bg-border sm:h-12 sm:w-px" />
                  <div>
                    <p className="text-xs font-semibold text-primary">{jobs.emailLabel}</p>
                    <a href={`mailto:${jobs.email}`} className="mt-1 block break-all text-2xl font-semibold text-foreground hover:text-primary">
                      {jobs.email}
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

      </main>

      {trialOpen && (
        <div className="fixed inset-0 z-[80] flex min-h-[100dvh] items-start justify-center overflow-y-auto overscroll-contain bg-[#18243D]/45 px-3 py-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="trial-dialog-title"
            className="w-full max-w-[620px] overflow-y-auto rounded-3xl bg-card p-5 shadow-[0_24px_80px_rgba(24,36,61,.24)] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[28px] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-primary">{trial.eyebrow}</p>
                <h3 id="trial-dialog-title" className="mt-2 text-xl font-semibold leading-tight sm:text-2xl">{trial.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground sm:leading-7">
                  {trial.desc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTrialOpen(false)
                  setTrialSubmitted(false)
                  setTrialApiError('')
                  setTrialSuccessMessage('')
                }}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                aria-label="关闭"
              >
                <X className="size-5" />
              </button>
            </div>

            {trialSubmitted ? (
              <div className="mt-6 rounded-3xl bg-background p-6 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CheckCircle2 className="size-6" />
                </div>
                <h4 className="mt-4 text-xl font-semibold">{trial.successTitle}</h4>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {trialSuccessMessage || trial.successDesc}
                </p>
              </div>
            ) : (
              <>
                <div className="mt-5 grid gap-2 sm:mt-6 sm:gap-3">
                  {trial.steps.map(([index, title, desc]) => (
                    <div key={index} className="flex gap-3 rounded-2xl bg-background p-3 sm:p-4">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                        {index}
                      </span>
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
                      <span className="inline-flex w-fit items-baseline gap-1 whitespace-nowrap">
                        {trial.contactName}
                        <span className="text-red-500">*</span>
                      </span>
                      <input
                        value={trialForm.contactName}
                        onChange={(event) => updateTrialField('contactName', event.target.value)}
                        className={`h-12 text-base sm:text-sm ${trialFieldClass('contactName')}`}
                        placeholder={trial.contactNamePlaceholder}
                        maxLength={trialContactNameMaxLength}
                      />
                      {trialFieldError('contactName')}
                    </label>
                    <label className="grid gap-2 text-sm font-medium">
                      <span className="inline-flex w-fit items-baseline gap-1 whitespace-nowrap">
                        {trial.contactPhone}
                        <span className="text-red-500">*</span>
                      </span>
                      <input
                        value={trialForm.contactPhone}
                        onChange={(event) => updateTrialField('contactPhone', event.target.value)}
                        className={`h-12 text-base sm:text-sm ${trialFieldClass('contactPhone')}`}
                        placeholder={trial.contactPhonePlaceholder}
                        maxLength={trialContactPhoneMaxLength}
                      />
                      {trialFieldError('contactPhone')}
                    </label>
                  </div>
                  <label className="grid gap-2 text-sm font-medium">
                    {trial.inviteCode}
                    <input
                      value={trialForm.inviteCode}
                      onChange={(event) => updateTrialField('inviteCode', event.target.value)}
                      className={`h-12 text-base sm:text-sm ${trialFieldClass('inviteCode')}`}
                      placeholder={trial.inviteCodePlaceholder}
                    />
                  </label>
                  {trialApiError && (
                    <p className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
                      {trialApiError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={trialSubmitting}
                    className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] px-6 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 sm:text-sm"
                  >
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
