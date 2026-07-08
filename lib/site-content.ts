export type SiteCode = 'cn' | 'jp' | 'hk'

export type IconKey =
  | 'building'
  | 'calculator'
  | 'chart'
  | 'check'
  | 'clock'
  | 'file'
  | 'headphones'
  | 'landmark'
  | 'layers'
  | 'lock'
  | 'message'
  | 'shield'
  | 'spark'
  | 'users'
  | 'wallet'

export interface SiteContent {
  code: SiteCode
  name: string
  localeName: string
  lang: string
  path: string
  loginUrl: string
  trialUrl: string
  nav: { label: string; href: string }[]
  actions: { login: string; trial: string }
  hero: {
    eyebrow: string
    title: string
    titleAccent: string
    description: string
    primaryCta: string
    secondaryCta: string
  }
  metrics: { value: string; label: string; note: string }[]
  painTitle: string
  painSubtitle: string
  pains: { icon: IconKey; title: string; description: string }[]
  workflowTitle: string
  workflowSubtitle: string
  workflow: { step: string; title: string; description: string; output: string }[]
  featuresTitle: string
  featuresSubtitle: string
  features: { icon: IconKey; title: string; description: string; details: string[] }[]
  rolesTitle: string
  rolesSubtitle: string
  roles: { icon: IconKey; title: string; user: string; journey: string[]; cta: string }[]
  proofTitle: string
  proofSubtitle: string
  proofItems: { label: string; value: string; description: string }[]
  pricing: {
    title: string
    subtitle: string
    price: string
    period: string
    description: string
    includedTitle: string
    included: string[]
    boundaryTitle: string
    boundaries: string[]
    cta: string
  }
  compliance: {
    title: string
    subtitle: string
    safe: string[]
    limited: string[]
  }
  faqTitle: string
  faqs: { q: string; a: string }[]
  finalCta: {
    title: string
    description: string
    primary: string
    secondary: string
  }
  company: {
    name: string
    creditCode: string
    registeredAddress: string
    headquarters: string
    contact: string
    manager: string
    email: string
    hours: string
  }
}

const commonCompany = {
  name: '上海尚加澄企业管理有限公司',
  creditCode: '91310113MAK48LTU8M',
  registeredAddress: '上海市宝山区泰和西路3389号',
  headquarters: '上海市闵行区虹桥国际展汇南区-11号楼',
  contact: '17511647049',
  manager: '姚经理',
  email: 'shangjiacheng2@creya.cn',
  hours: '工作日 9:00-18:00',
}

const loginUrl = 'https://finance-ai.haocai360.cn/sign-in'

export const sites: Record<SiteCode, SiteContent> = {
  cn: {
    code: 'cn',
    name: '好财账大师',
    localeName: '中国站',
    lang: 'zh-CN',
    path: '/cn/',
    loginUrl,
    trialUrl: `${loginUrl}?trial=7d&utm_source=official_site&utm_campaign=trial_package`,
    nav: [
      { label: '核心功能', href: '#features' },
      { label: '适用角色', href: '#roles' },
      { label: '工作流程', href: '#workflow' },
      { label: '定价', href: '#pricing' },
      { label: '代理合作', href: '#partners' },
      { label: '常见问题', href: '#faq' },
    ],
    actions: { login: '登录', trial: '开始试用' },
    hero: {
      eyebrow: '用手机也能看懂账，用 AI 帮你做账报税',
      title: '好财账大师',
      titleAccent: '一年 360 元，把财税管清楚',
      description:
        '不用被复杂表格和月底催资料拖住。好财账大师帮你归集工资、发票、流水，自动整理做账材料，生成税额测算、报表和待办提醒，让老板、财务、代账会计都能在一套流程里协同。',
      primaryCta: '立即免费试用',
      secondaryCta: '咨询专属客服',
    },
    metrics: [
      { value: '0.98 元/天', label: '低成本管账', note: '360 元/年，折合每天不到 1 元' },
      { value: '3 步上手', label: '资料到报表', note: '录工资、收发票、对流水' },
      { value: '随时查账', label: '手机和电脑都能看', note: '老板看结果，财务处理细节' },
      { value: '专属客服', label: '有人承接咨询', note: '试用、开通、使用问题都能沟通' },
    ],
    painTitle: '你是否也遇到这些财税烦恼？',
    painSubtitle: '小企业最怕的不是做账本身，而是资料散、时间紧、看不懂、问不到人。账大师把重复整理工作交给系统，把关键结果讲清楚。',
    pains: [
      {
        icon: 'file',
        title: '月底才发现资料缺一堆',
        description: '工资、发票、银行流水分散在不同人手里，月底补资料、补说明，既慢又容易漏。',
      },
      {
        icon: 'calculator',
        title: '老板看不懂账，财务解释很累',
        description: '收入、成本、税额、现金流没有放在一起看，每次沟通都要重新翻表格。',
      },
      {
        icon: 'clock',
        title: '怕漏报、错报、逾期',
        description: '发票待确认、流水待匹配、无票支出没说明，往往到最后才变成风险。',
      },
      {
        icon: 'users',
        title: '代账和多公司管理很琐碎',
        description: '一个会计管多家公司，一个老板管多个主体，待办分散就很难判断先处理什么。',
      },
    ],
    workflowTitle: '三步整理资料，自动生成本月财税结果',
    workflowSubtitle: '像伽玛账一样强调“简单上手”，但更适合 B 端代账和多企业协同：先把资料收齐，再让系统做核对、测算和报表。',
    workflow: [
      {
        step: '01',
        title: '录入工资',
        description: '维护员工、工资、社保公积金和专项扣除，系统自动算个人所得税。',
        output: '老板能看到人工成本，财务能看到个税测算。',
      },
      {
        step: '02',
        title: '整理发票',
        description: '把销项、进项、费用票、无票支出统一归档，收入成本更清楚。',
        output: '系统汇总金额、税额、异常和待确认事项。',
      },
      {
        step: '03',
        title: '核对流水',
        description: '管理多个银行账户和收支流水，辅助匹配发票与业务往来。',
        output: '回款、付款、待匹配流水一目了然。',
      },
      {
        step: '04',
        title: 'AI 提醒',
        description: '系统检查工资、发票、流水之间的不一致，提醒先处理关键问题。',
        output: '减少月底临时补资料和反复沟通。',
      },
      {
        step: '05',
        title: '生成报表',
        description: '形成税额测算、财务报表、凭证视图和申报材料预览。',
        output: '老板能看结果，会计能复核明细。',
      },
    ],
    featuresTitle: '软件核心：更便宜、更实时、更省心、更规范',
    featuresSubtitle: '面向客户讲结果：少花钱、少补资料、少解释、少漏项，同时让老板、财务和代账团队都能看到同一套数据。',
    features: [
      {
        icon: 'building',
        title: '一个账号管多家公司',
        description: '适合老板多主体经营、代账会计多客户管理，企业切换和授权协同更清楚。',
        details: ['多企业切换', '授权协同', '客户待办', '服务有效期'],
      },
      {
        icon: 'calculator',
        title: '工资个税自动算',
        description: '录入工资和五险一金，系统自动测算个税，减少手工公式和重复核对。',
        details: ['员工工资', '五险一金', '个税测算', '工资历史'],
      },
      {
        icon: 'file',
        title: '发票费用统一管',
        description: '收入票、成本票、费用票、无票支出放在一起，老板能看懂钱从哪里来、花到哪里去。',
        details: ['销项进项', '费用票', '无票支出', '异常提醒'],
      },
      {
        icon: 'landmark',
        title: '流水回款看得清',
        description: '银行流水和发票、费用关联起来，收入支出不再只靠月底翻账单。',
        details: ['多银行账户', '回款核对', '付款记录', '待匹配提醒'],
      },
      {
        icon: 'shield',
        title: '风险提醒先处理',
        description: '把影响做账报税的事项提前列出来，减少漏项、错项和逾期风险。',
        details: ['发票待确认', '流水待匹配', '成本缺口', 'AI 建议'],
      },
      {
        icon: 'chart',
        title: '报表税额随时看',
        description: '自动汇总税额测算、资产负债表、利润表和凭证视图，老板不等月底才知道结果。',
        details: ['税额测算', '利润表', '资产负债表', '凭证视图'],
      },
      {
        icon: 'message',
        title: 'AI 财税助手随时问',
        description: '看不懂税额、异常、成本构成时，直接问 AI，让系统先给出解释和处理建议。',
        details: ['税额解释', '异常定位', '待办总结', '处理建议'],
      },
      {
        icon: 'headphones',
        title: '专属客服有人管',
        description: '试用、开通、使用问题都有客服承接，企业不用自己摸索所有流程。',
        details: ['姚经理', '电话咨询', '企业微信', '邮件沟通'],
      },
    ],
    rolesTitle: '不同角色，都能找到自己的入口',
    rolesSubtitle: '老板看结果，财务管过程，代账会计管客户。每个人看到的价值不同，但流程是一套。',
    roles: [
      {
        icon: 'wallet',
        title: '小微企业主',
        user: '关心少花钱、少操心、能看懂',
        journey: ['一年 360 元', '手机看进度', '查看税额和报表', '有问题找客服'],
        cta: '不用懂复杂财务，也能掌握企业账本。',
      },
      {
        icon: 'calculator',
        title: '企业财务/出纳',
        user: '关心少录表、少核对、少解释',
        journey: ['维护工资', '整理发票', '核对流水', '生成报表和材料'],
        cta: '把重复整理工作交给系统，把时间留给复核。',
      },
      {
        icon: 'layers',
        title: '代账会计',
        user: '关心多客户管理和服务效率',
        journey: ['切换客户', '查看待办', '批量处理异常', '统一沉淀报表凭证'],
        cta: '一个入口服务多家企业，降低重复沟通成本。',
      },
      {
        icon: 'chart',
        title: '老板/经营者',
        user: '关心现金流、税额和经营结果',
        journey: ['查看收入成本', '查看预计税额', '查看待办提醒', '需要时转给财务'],
        cta: '不用进复杂后台，也能知道企业经营状态。',
      },
      {
        icon: 'users',
        title: '被授权人',
        user: '关心授权清楚、协作方便',
        journey: ['接受授权', '进入对应企业', '处理指定资料', '协同完成本月任务'],
        cta: '不用共用账号，协同更清楚。',
      },
    ],
    proofTitle: '随时随地查账，本月情况一眼看懂',
    proofSubtitle: '老板不再等会计月底发报表，财务也不用反复解释同一批数据。',
    proofItems: [
      { label: '更便宜', value: '0.98 元/天', description: '360 元/年，适合小微企业先低成本用起来。' },
      { label: '更实时', value: '随时查账', description: '手机和电脑都能看本月收入、成本、税额和待办。' },
      { label: '更省心', value: 'AI 提醒', description: '发票、流水、工资异常提前提醒，减少月底补资料。' },
      { label: '更规范', value: '报表凭证', description: '按工资、发票、流水沉淀报表和凭证视图。' },
    ],
    pricing: {
      title: '360 元/年，低至每天不到 1 元',
      subtitle: '价格直接、服务清楚，小微企业和代账场景都能先低成本试起来。',
      price: '360 元',
      period: '/ 年',
      description: '适合小规模企业、初创公司、个体工商户和需要管理多家客户的代账会计。',
      includedTitle: '你能获得',
      included: [
        '手机和电脑随时查账',
        '工资、发票、银行流水统一管理',
        'AI 待办提醒和异常说明',
        '税额测算、报表和凭证视图',
        '多企业账套和授权协同',
        '专属客服咨询承接',
      ],
      boundaryTitle: '服务说明',
      boundaries: [
        '系统帮助整理材料、测算税额和生成报表',
        '重要财税结果建议由企业或会计最终确认',
        '需要人工服务时可联系专属客服',
        '后续自动化能力会随产品迭代逐步开放',
      ],
      cta: '开始试用',
    },
    compliance: {
      title: '既敢宣传价值，也把服务讲清楚',
      subtitle: '我们大胆讲省钱、省心、效率和服务，但不把企业的最终财税责任模糊掉。',
      safe: [
        'AI 帮你整理工资、发票、流水和待办。',
        '系统帮你生成税额测算、报表和凭证视图。',
        '专属客服可承接试用、开通和使用咨询。',
      ],
      limited: [
        '企业和会计仍需确认业务真实性、票据完整性和申报结果。',
        '银行、税局等外部系统能力以产品实际开通情况为准。',
        '页面不使用无法证明的客户数量、准确率和赔付承诺。',
      ],
    },
    faqTitle: '常见问题',
    faqs: [
      {
        q: '领取 7 天体验套餐需要先注册吗？',
        a: '需要。为了给企业创建独立账套并保存试用数据，用户需要先用手机号完成注册或登录。完成后进入企业创建和 7 天体验套餐领取流程。',
      },
      {
        q: '好财账大师适合谁？',
        a: '适合小微企业、个体工商户、初创公司、企业财务和代账会计。尤其适合想用较低成本把工资、发票、流水、报表和税额测算统一管起来的团队。',
      },
      {
        q: '现在能真实自动报税吗？',
        a: '账大师重点帮助你整理做账报税材料、测算税额、发现异常、生成报表和申报资料。涉及最终申报提交的动作，建议由企业或会计结合实际情况确认。',
      },
      {
        q: '价格为什么只有 360 元/年？',
        a: '我们希望先让小微企业用最低决策成本试起来。360 元/年折合每天不到 1 元，比传统人工代账更适合先跑通标准流程。',
      },
      {
        q: 'AI 财税助手能做什么？',
        a: '它可以基于当前企业、申报期、工资、发票、流水和核对结果，辅助解释税额构成、异常原因和处理顺序。',
      },
      {
        q: '能不能少请一个会计？',
        a: '账大师可以减少大量重复整理、核对和解释工作，但企业仍需要对业务真实性和最终申报结果负责。对小微企业来说，它更适合作为老板、财务和代账会计的效率工具。',
      },
      {
        q: '如何开始试用？',
        a: '点击页面中的“开始试用”或“登录”即可进入产品。需要人工沟通可联系姚经理，电话 17511647049，邮箱 shangjiacheng2@creya.cn。',
      },
    ],
    finalCta: {
      title: '今天开始，把账管清楚',
      description: '一年 360 元，先从一个企业、一个申报周期开始试。看得懂账、找得到资料、知道下一步该处理什么。',
      primary: '立即免费试用',
      secondary: '电话咨询姚经理',
    },
    company: commonCompany,
  },
  jp: {
    code: 'jp',
    name: '账大师 Japan',
    localeName: '日本站',
    lang: 'ja-JP',
    path: '/jp/',
    loginUrl,
    trialUrl: `${loginUrl}?trial=7d&utm_source=official_site&utm_campaign=trial_package_jp`,
    nav: [
      { label: '主な機能', href: '#features' },
      { label: '利用者別', href: '#roles' },
      { label: '業務フロー', href: '#workflow' },
      { label: '料金', href: '#pricing' },
      { label: '代理連携', href: '#partners' },
      { label: 'FAQ', href: '#faq' },
    ],
    actions: { login: 'ログイン', trial: '試用開始' },
    hero: {
      eyebrow: '中国企業向け AI 財税ワークスペース',
      title: '財税業務を',
      titleAccent: '標準フローで管理',
      description:
        '給与、請求書、銀行明細、照合、申告資料作成を一つの流れで管理し、経営者と財務担当者が同じ画面で状況を確認できます。',
      primaryCta: '試用開始',
      secondaryCta: '問い合わせ',
    },
    metrics: [
      { value: '360 元', label: '年間料金', note: '中国站と同一の試用入口' },
      { value: '5 Step', label: '標準フロー', note: '給与、請求書、銀行、照合、申告資料' },
      { value: 'Web + Mobile', label: '両端対応', note: '担当者と経営者の協同' },
      { value: 'AI Assist', label: '補助説明', note: '照合、要約、次の対応' },
    ],
    painTitle: '海外展開企業にも、分かりやすい財税フローが必要です',
    painSubtitle: '資料整理、税額確認、担当者間の連携を一つの流れにまとめます。',
    pains: [
      { icon: 'file', title: '資料が分散', description: '給与、請求書、銀行明細が別々に管理されがちです。' },
      { icon: 'calculator', title: '計算根拠が見えにくい', description: '税額の構成と元データを追いにくい状態を改善します。' },
      { icon: 'clock', title: '締切前に集中', description: '申告前の確認事項を日常タスクとして管理します。' },
      { icon: 'users', title: '複数会社の協同', description: '複数企業、担当者、権限の整理を支援します。' },
    ],
    workflowTitle: '5 Step の標準フロー',
    workflowSubtitle: '中国站と同一の業務構造を利用します。',
    workflow: [
      { step: '01', title: '給与', description: '従業員と給与データを管理します。', output: '給与コストと個税計算の確認。' },
      { step: '02', title: '請求書', description: '売上、仕入、費用関連の請求書を整理します。', output: '金額、税額、状態の確認。' },
      { step: '03', title: '銀行明細', description: '銀行口座と明細を管理します。', output: '入出金と照合待ちの確認。' },
      { step: '04', title: 'データ照合', description: '申告前の不整合を確認します。', output: '確認リストと AI 提案。' },
      { step: '05', title: '申告資料', description: '確認済みデータから資料を作成します。', output: '税額試算と資料プレビュー。' },
    ],
    featuresTitle: '同じ機能、同じ構造',
    featuresSubtitle: '価格、効率、リスク確認、サービス対応を分かりやすく伝えます。',
    features: [],
    rolesTitle: '利用者別フロー',
    rolesSubtitle: '経営者、財務担当、代行担当者が同じフローで協同します。',
    roles: [],
    proofTitle: '公開可能な表現だけを使用',
    proofSubtitle: '日々の資料整理から月次確認まで、状況を見える化します。',
    proofItems: [],
    pricing: {
      title: '料金',
      subtitle: '現在は中国站と同じ試用入口を利用します。',
      price: '360 元',
      period: '/ 年',
      description: '標準フローを先に試すための単一価格です。',
      includedTitle: '含まれる内容',
      included: ['企業管理', '給与、請求書、銀行明細', 'データ照合', 'AI 補助', '資料プレビュー'],
      boundaryTitle: '現在の制限',
      boundaries: ['税務局への自動提出は宣伝しません', '銀行直連と OCR は計画能力として扱います'],
      cta: '試用開始',
    },
    compliance: {
      title: 'コンプライアンス表現',
      subtitle: '過度な自動化表現を避けます。',
      safe: ['補助計算、資料作成、照合支援として説明します。'],
      limited: ['最終確認は利用者側で行う必要があります。'],
    },
    faqTitle: 'FAQ',
    faqs: [
      { q: '日本站は独立実装ですか？', a: 'いいえ。同じコンポーネントと内容構造を利用し、言語と地域説明のみを差し替えます。' },
    ],
    finalCta: {
      title: 'まずは標準フローを試す',
      description: '同一入口から製品試用を開始できます。',
      primary: '試用開始',
      secondary: '問い合わせ',
    },
    company: commonCompany,
  },
  hk: {
    code: 'hk',
    name: '账大师香港',
    localeName: '香港站',
    lang: 'zh-HK',
    path: '/hk/',
    loginUrl,
    trialUrl: `${loginUrl}?trial=7d&utm_source=official_site&utm_campaign=trial_package_hk`,
    nav: [
      { label: '核心功能', href: '#features' },
      { label: '適用角色', href: '#roles' },
      { label: '工作流程', href: '#workflow' },
      { label: '定價', href: '#pricing' },
      { label: '代理合作', href: '#partners' },
      { label: '常見問題', href: '#faq' },
    ],
    actions: { login: '登入', trial: '開始試用' },
    hero: {
      eyebrow: '面向企業服務場景的 AI 財稅工作台',
      title: '用同一套流程',
      titleAccent: '管理多地財稅工作',
      description:
        '把工資、發票、銀行流水、核對和報表資料放進同一套流程，讓企業主、財務和服務團隊都能看清楚進度。',
      primaryCta: '開始試用',
      secondaryCta: '聯繫我們',
    },
    metrics: [
      { value: '360 元', label: '年費', note: '首期沿用統一定價' },
      { value: '5 步', label: '標準流程', note: '工資、發票、流水、核對、資料' },
      { value: '雙端', label: 'PC 與移動端', note: '不同角色協同' },
      { value: 'AI 輔助', label: '解釋與建議', note: '不替代最終確認' },
    ],
    painTitle: '跨地區服務更需要標準流程',
    painSubtitle: '資料分散、口徑不清、待辦滯後，是企業財稅服務最常見的效率問題。',
    pains: [
      { icon: 'file', title: '資料分散', description: '業務、財務和管理者看到的信息不一致。' },
      { icon: 'calculator', title: '口徑不清', description: '測算和報表需要回到來源資料。' },
      { icon: 'clock', title: '待辦滯後', description: '申報前才發現缺口會增加溝通成本。' },
      { icon: 'users', title: '協同複雜', description: '多公司、多角色需要清晰權限。' },
    ],
    workflowTitle: '五步標準流程',
    workflowSubtitle: '與中國站共用同一套組件和字段。',
    workflow: [
      { step: '01', title: '員工工資', description: '維護員工與工資資料。', output: '輸出工資成本和個稅測算。' },
      { step: '02', title: '發票資料', description: '整理收入、成本和費用資料。', output: '輸出金額、稅額和狀態。' },
      { step: '03', title: '銀行流水', description: '維護銀行賬戶與流水。', output: '輸出收支和待匹配資料。' },
      { step: '04', title: '數據核對', description: '檢查申報前異常。', output: '輸出待辦清單。' },
      { step: '05', title: '申報資料', description: '生成測算與資料預覽。', output: '輸出申報前資料。' },
    ],
    featuresTitle: '同一套功能結構',
    featuresSubtitle: '價格、效率、風險提醒和客服承接都說清楚。',
    features: [],
    rolesTitle: '角色流程',
    rolesSubtitle: '企業主、財務、代賬和被授權人共用流程。',
    roles: [],
    proofTitle: '以真實能力為邊界',
    proofSubtitle: '日常資料、月度報表和待辦提醒集中呈現。',
    proofItems: [],
    pricing: {
      title: '定價',
      subtitle: '首期僅展示一個價格。',
      price: '360 元',
      period: '/ 年',
      description: '用於先試跑一個標準流程。',
      includedTitle: '包含內容',
      included: ['企業管理', '工資、發票、流水', '數據核對', 'AI 輔助', '資料預覽'],
      boundaryTitle: '目前不承諾',
      boundaries: ['不宣傳自動提交稅局', '銀行直連與 OCR 按規劃能力處理'],
      cta: '開始試用',
    },
    compliance: {
      title: '合規說明',
      subtitle: '避免過度承諾。',
      safe: ['以輔助測算、資料生成和流程核對描述能力。'],
      limited: ['最終申報和資料真實性仍需用戶確認。'],
    },
    faqTitle: '常見問題',
    faqs: [
      { q: '香港站是否重新開發？', a: '不是。香港站復用中國站母版，只替換語言、地區化字段和合規說明。' },
    ],
    finalCta: {
      title: '先試用同一套標準流程',
      description: '從產品登錄頁開始體驗。',
      primary: '開始試用',
      secondary: '電話諮詢',
    },
    company: commonCompany,
  },
}

for (const code of ['jp', 'hk'] as const) {
  sites[code].features = sites.cn.features
  sites[code].roles = sites.cn.roles
  sites[code].proofItems = sites.cn.proofItems
}

export function getSiteContent(code: SiteCode) {
  return sites[code]
}
