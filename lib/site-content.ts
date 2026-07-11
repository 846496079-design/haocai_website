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
  productNav: { label: string; href: string }[]
  actions: { login: string; trial: string }
  hero: {
    eyebrow: string
    title: string
    titleAccent: string
    description: string
    primaryCta: string
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
  companyIntro: {
    eyebrow: string
    title: string
    description: string
    stats: { value: string; label: string; note: string }[]
    milestoneTitle: string
    milestoneSubtitle: string
    milestoneCapabilityLabel: string
    milestones: { year: string; title: string; focus: string; capability: string; value: string }[]
    focusTitle: string
    focus: string[]
  }
  faqTitle: string
  faqs: { q: string; a: string }[]
  finalCta: {
    title: string
    description: string
    primary: string
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

const jpCompany = {
  ...commonCompany,
  name: '上海尚加澄企業管理有限公司',
  registeredAddress: '上海市宝山区泰和西路3389号',
  headquarters: '上海市閔行区虹橋国際展匯南区 11号棟',
  manager: '姚マネージャー',
  hours: '平日 9:00-18:00',
}

const hkCompany = {
  ...commonCompany,
  name: '上海尚加澄企業管理有限公司',
  registeredAddress: '上海市寶山區泰和西路3389號',
  headquarters: '上海市閔行區虹橋國際展匯南區-11號樓',
  manager: '姚經理',
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
      { label: '首页', href: '/cn/' },
      { label: '产品中心', href: '/cn/product/' },
      { label: '新闻中心', href: '/cn/news/' },
      { label: '公司介绍', href: '/cn/company/' },
      { label: '代理合作', href: '/cn/partners/' },
      { label: '加入我们', href: '/cn/join/' },
    ],
    productNav: [
      { label: '核心功能', href: '#features' },
      { label: '适用角色', href: '#roles' },
      { label: '工作流程', href: '#workflow' },
      { label: '定价', href: '#pricing' },
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
        details: ['姚经理', '企业微信', '邮件沟通', '合作对接'],
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
        '更多自动化服务将持续升级',
      ],
      cta: '开始试用',
    },
    compliance: {
      title: '价值清楚，服务说明也清楚',
      subtitle: '账大师帮助企业提高资料整理、税额测算和报表查看效率，同时保留必要的人工复核与确认。',
      safe: [
        'AI 帮你整理工资、发票、流水和待办。',
        '系统帮你生成税额测算、报表和凭证视图。',
        '专属客服可承接试用、开通和使用咨询。',
      ],
      limited: [
        '企业和会计仍需确认业务真实性、票据完整性和申报结果。',
        '银行、税局等外部系统能力以产品实际开通情况为准。',
        '客户数量、准确率和服务承诺以双方确认的服务内容为准。',
      ],
    },
    companyIntro: {
      eyebrow: '公司介绍',
      title: 'AI 时代企业财务智能化探索者',
      description:
        '账大师（上海）人工智能技术有限公司专注于人工智能、大数据、云计算与企业财务服务融合创新，致力于让企业财务管理更智能、更高效、更易协同。',
      stats: [
        { value: '2014', label: '成立时间', note: '长期关注企业财税服务场景' },
        { value: 'AI', label: '技术方向', note: '大模型、智能 Agent 与自动化工作流' },
        { value: '财税', label: '核心场景', note: '围绕高频财务工作持续打磨产品' },
        { value: '生态', label: '合作理念', note: '与企业服务伙伴共同探索新场景' },
      ],
      milestoneTitle: '沿着企业财税需求，持续完善协同方式',
      milestoneSubtitle: '从场景理解到产品与服务协作，我们把每一次迭代都落在企业更容易使用、更容易协同的日常工作中。',
      milestoneCapabilityLabel: '能力沉淀',
      milestones: [
        { year: '2014', title: '从企业财税场景出发', focus: '聚焦企业日常财税服务中资料分散、沟通重复、结果难追溯的问题。', capability: '沉淀工资、票据、流水、核对与报表等高频任务的场景理解。', value: '让复杂财税工作先有清晰的处理顺序。' },
        { year: '2016', title: '深入一线经营需求', focus: '持续观察小微企业、财务人员与企业服务团队在月度协同中的真实阻塞点。', capability: '将“找资料、催资料、核资料、看结果”拆分为可被产品承接的协同环节。', value: '减少不同角色之间反复解释与信息遗漏。' },
        { year: '2018', title: '推动服务流程产品化', focus: '围绕高频任务梳理标准步骤，让经验型服务逐步具备可复用的流程表达。', capability: '形成资料归集、任务提醒、进度查看与结果复核的基础工作框架。', value: '让企业可以更早了解本期该准备什么、该处理什么。' },
        { year: '2020', title: '加强数据协同与可视化', focus: '将工资、发票、银行流水和经营数据放入更统一的查看与核对链路。', capability: '以数据归集、差异识别和报表视图辅助财务人员完成日常判断。', value: '帮助管理者和财务在同一信息基础上沟通经营状况。' },
        { year: '2022', title: '探索智能化财务工作方式', focus: '把 AI、大数据与自动化思路引入资料整理、异常提示和经营分析等环节。', capability: '围绕智能 Agent、规则协同与自动化工作流持续打磨产品能力。', value: '将重复整理和基础核对留给系统，把关键确认留给人。' },
        { year: '2024', title: '连接企业服务协作网络', focus: '面向企业主、财务人员、代账会计与企业服务伙伴探索更顺畅的协同关系。', capability: '将产品、服务、渠道和使用反馈连接到同一套持续优化的服务闭环。', value: '让不同参与方更容易共享进度、理解边界并协同处理问题。' },
        { year: '2026', title: '面向企业 AI 财务未来', focus: '以账大师为核心，继续探索企业财务管理与经营协同的智能化升级路径。', capability: '持续完善 AI 辅助、流程编排、资料管理和经营信息呈现等能力。', value: '让更多企业以更低的理解与协作成本获得财税工作支持。' },
      ],
      focusTitle: '从高频财务工作，走向更清晰的经营协同',
      focus: [
        '围绕工资、发票、银行流水、数据核对和报表分析等高频场景持续迭代',
        '通过 AI 大模型、智能 Agent 与自动化工作流，减少重复整理与核对成本',
        '为企业管理者、财务人员和企业服务伙伴提供更易理解的协同方式',
        '以产品、技术、服务和渠道协同，探索企业 AI 服务生态的长期价值',
      ],
    },
    faqTitle: '常见问题',
    faqs: [
      {
        q: '领取 7 天体验套餐需要先注册吗？',
        a: '当前官网先介绍试用政策优惠并收集联系人、电话和邀请码或邀请人电话，后续由工作人员对接开通方式和使用范围。',
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
        a: '点击页面中的“开始试用”会弹出 7 天体验套餐说明和留资表单。提交后由工作人员对接试用政策、优惠和开通指引。',
      },
    ],
    finalCta: {
      title: '今天开始，把账管清楚',
      description: '一年 360 元，先从一个企业、一个申报周期开始试。看得懂账、找得到资料、知道下一步该处理什么。',
      primary: '立即免费试用',
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
      { label: 'ホーム', href: '/jp/' },
      { label: '製品センター', href: '/jp/product/' },
      { label: 'ニュース', href: '/jp/news/' },
      { label: '会社紹介', href: '/jp/company/' },
      { label: '代理連携', href: '/jp/partners/' },
      { label: '採用情報', href: '/jp/join/' },
    ],
    productNav: [
      { label: '主な機能', href: '#features' },
      { label: '利用者別', href: '#roles' },
      { label: '業務フロー', href: '#workflow' },
      { label: '料金', href: '#pricing' },
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
    },
    metrics: [
      { value: '360 元', label: '年間料金', note: '低コストで標準フローを体験' },
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
    workflowSubtitle: '給与、発票、銀行明細、照合、申告資料までを一つの流れで管理します。',
    workflow: [
      { step: '01', title: '給与', description: '従業員と給与データを管理します。', output: '給与コストと個税計算の確認。' },
      { step: '02', title: '請求書', description: '売上、仕入、費用関連の請求書を整理します。', output: '金額、税額、状態の確認。' },
      { step: '03', title: '銀行明細', description: '銀行口座と明細を管理します。', output: '入出金と照合待ちの確認。' },
      { step: '04', title: 'データ照合', description: '申告前の不整合を確認します。', output: '確認リストと AI 提案。' },
      { step: '05', title: '申告資料', description: '確認済みデータから資料を作成します。', output: '税額試算と資料プレビュー。' },
    ],
    featuresTitle: '財税管理に必要な機能を、一つの流れに集約',
    featuresSubtitle: '給与、発票、銀行明細、照合、帳票確認をまとめ、経営者と担当者が同じ情報を確認できます。',
    features: [],
    rolesTitle: '利用者別フロー',
    rolesSubtitle: '経営者、財務担当、代行担当者が同じフローで協同します。',
    roles: [],
    proofTitle: '公開可能な表現だけを使用',
    proofSubtitle: '日々の資料整理から月次確認まで、状況を見える化します。',
    proofItems: [],
    pricing: {
      title: '料金',
      subtitle: '年間 360 元で、標準フローを低コストで試せます。',
      price: '360 元',
      period: '/ 年',
      description: '標準フローを先に試すための単一価格です。',
      includedTitle: '含まれる内容',
      included: ['企業管理', '給与、請求書、銀行明細', 'データ照合', 'AI 補助', '資料プレビュー'],
      boundaryTitle: 'サービス説明',
      boundaries: ['申告前の資料整理、税額試算、帳票確認を支援します', '重要な申告内容は企業または担当者による確認をおすすめします'],
      cta: '試用開始',
    },
    compliance: {
      title: '価値と確認事項を分かりやすく',
      subtitle: '日常の財税業務を効率化しながら、重要な確認事項を明確にします。',
      safe: ['補助計算、資料作成、照合支援として説明します。'],
      limited: ['最終確認は利用者側で行う必要があります。'],
    },
    companyIntro: {
      eyebrow: '会社紹介',
      title: 'AI 時代の企業財務インテリジェンスを探求',
      description:
        '账大师（上海）人工智能技术有限公司は、AI、大数据、クラウドと企業財務サービスの融合を探求しています。',
      stats: [
        { value: '2014', label: '設立', note: '企業財税サービス領域への継続的な取り組み' },
        { value: 'AI', label: '技術方向', note: '大模型、智能 Agent、自動化ワークフロー' },
        { value: '財税', label: '主要シーン', note: '高頻度な財務業務を継続的に改善' },
        { value: '協業', label: '理念', note: '企業サービスパートナーと新しい場面を探求' },
      ],
      milestoneTitle: '企業財税の課題に寄り添い、協働の形を磨く',
      milestoneSubtitle: '現場理解から製品とサービスの連携まで、日々の業務を使いやすく、協同しやすくする改善を重ねています。',
      milestoneCapabilityLabel: '蓄積した取り組み',
      milestones: [
        { year: '2014', title: '企業財税の現場から出発', focus: '資料の分散、重複した確認、結果の追跡しにくさといった日常業務の課題に着目。', capability: '給与、発票、銀行流水、照合、帳票に関する高頻度業務への理解を蓄積。', value: '複雑な財税業務に、まず分かりやすい手順をつくる。' },
        { year: '2016', title: '現場の経営課題を深掘り', focus: '小規模企業、財務担当者、企業サービスチームの月次協同における停滞を観察。', capability: '資料収集、確認依頼、照合、結果確認を製品で支援できる工程に整理。', value: '役割間の説明の繰り返しと情報漏れを減らす。' },
        { year: '2018', title: 'サービスフローを製品化', focus: '高頻度業務を標準手順に整理し、経験に依存しがちな作業の再利用性を高める。', capability: '資料収集、タスク通知、進捗確認、結果レビューの基本フレームを整備。', value: '企業が今期に準備すべきことを早めに把握できる。' },
        { year: '2020', title: 'データ協同と可視化を強化', focus: '給与、発票、銀行流水、経営データを一貫した確認と照合の流れへ統合。', capability: 'データ集約、差異把握、帳票ビューで日常判断を支援。', value: '経営者と財務担当者が共通の情報で対話できる。' },
        { year: '2022', title: '財務業務の知能化を探求', focus: 'AI、データ、オートメーションを資料整理、例外提示、経営分析へ取り入れる。', capability: '智能 Agent、ルール連携、自動化ワークフローを継続して改善。', value: '反復作業はシステムへ、重要な判断は人へ。' },
        { year: '2024', title: '企業サービスの協働をつなぐ', focus: '経営者、財務担当者、記帳代行、企業サービスパートナーの円滑な連携を探求。', capability: '製品、サービス、チャネル、利用者フィードバックを改善サイクルへ接続。', value: '進捗と役割の境界を共有しやすくする。' },
        { year: '2026', title: '企業 AI 財務の未来へ', focus: '账大师を中心に、財務管理と経営協同の知能化をさらに探求。', capability: 'AI 支援、フロー編成、資料管理、経営情報の表示を継続して拡張。', value: 'より多くの企業が低い負担で財税業務の支援を得られるようにする。' },
      ],
      focusTitle: '高頻度な財務業務から、経営協同へ',
      focus: [
        '給与、発票、銀行流水、照合、分析などの高頻度業務を整理',
        'AI 大模型、智能 Agent、自動化ワークフローで反復作業を削減',
        '経営者、財務担当者、企業サービスパートナーの協同を支援',
        '製品、技術、サービス、チャネルを連携させて長期価値を探求',
      ],
    },
    faqTitle: 'FAQ',
    faqs: [
      { q: '試用を開始するには登録が必要ですか？', a: 'はい。企業データと試用情報を保存するため、携帯番号で登録またはログインしてから体験フローに進みます。' },
    ],
    finalCta: {
      title: 'まずは標準フローを試す',
      description: 'まずは一社、一つの申告期間から標準フローをお試しください。',
      primary: '試用開始',
    },
    company: jpCompany,
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
      { label: '首頁', href: '/hk/' },
      { label: '產品中心', href: '/hk/product/' },
      { label: '新聞中心', href: '/hk/news/' },
      { label: '公司介紹', href: '/hk/company/' },
      { label: '代理合作', href: '/hk/partners/' },
      { label: '加入我們', href: '/hk/join/' },
    ],
    productNav: [
      { label: '核心功能', href: '#features' },
      { label: '適用角色', href: '#roles' },
      { label: '工作流程', href: '#workflow' },
      { label: '定價', href: '#pricing' },
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
    workflowSubtitle: '由資料整理到報表查看，企業主、財務和服務團隊都能按同一流程協同。',
    workflow: [
      { step: '01', title: '員工工資', description: '維護員工與工資資料。', output: '輸出工資成本和個稅測算。' },
      { step: '02', title: '發票資料', description: '整理收入、成本和費用資料。', output: '輸出金額、稅額和狀態。' },
      { step: '03', title: '銀行流水', description: '維護銀行賬戶與流水。', output: '輸出收支和待匹配資料。' },
      { step: '04', title: '數據核對', description: '檢查申報前異常。', output: '輸出待辦清單。' },
      { step: '05', title: '申報資料', description: '生成測算與資料預覽。', output: '輸出申報前資料。' },
    ],
    featuresTitle: '把財稅管理需要的能力，集中到一套流程',
    featuresSubtitle: '工資、發票、銀行流水、核對與報表集中管理，讓不同角色看到同一套資料。',
    features: [],
    rolesTitle: '角色流程',
    rolesSubtitle: '企業主、財務、代賬和被授權人共用流程。',
    roles: [],
    proofTitle: '以真實能力為邊界',
    proofSubtitle: '日常資料、月度報表和待辦提醒集中呈現。',
    proofItems: [],
    pricing: {
      title: '定價',
      subtitle: '統一定價，低成本先跑通一個標準流程。',
      price: '360 元',
      period: '/ 年',
      description: '用於先試跑一個標準流程。',
      includedTitle: '包含內容',
      included: ['企業管理', '工資、發票、流水', '數據核對', 'AI 輔助', '資料預覽'],
      boundaryTitle: '服務說明',
      boundaries: ['系統協助整理資料、測算稅額和生成報表', '重要申報內容建議由企業或會計最終確認'],
      cta: '開始試用',
    },
    compliance: {
      title: '價值清楚，確認事項也清楚',
      subtitle: '賬大師協助提升資料整理、稅額測算和報表查看效率，同時保留必要人工復核。',
      safe: ['以輔助測算、資料生成和流程核對描述能力。'],
      limited: ['最終申報和資料真實性仍需用戶確認。'],
    },
    companyIntro: {
      eyebrow: '公司介紹',
      title: 'AI 時代企業財務智能化探索者',
      description:
        '賬大師（上海）人工智能技術有限公司專注人工智能、大數據、雲計算與企業財務服務融合創新，致力讓企業財務管理更智能、更高效、更易協同。',
      stats: [
        { value: '2014', label: '成立時間', note: '長期關注企業財稅服務場景' },
        { value: 'AI', label: '技術方向', note: '大模型、智能 Agent 與自動化工作流' },
        { value: '財稅', label: '核心場景', note: '圍繞高頻財務工作持續打磨產品' },
        { value: '生態', label: '合作理念', note: '與企業服務夥伴共同探索新場景' },
      ],
      milestoneTitle: '沿著企業財稅需求，持續完善協同方式',
      milestoneSubtitle: '從場景理解到產品與服務協作，我們把每一次迭代都落在企業更容易使用、更容易協同的日常工作中。',
      milestoneCapabilityLabel: '能力沉澱',
      milestones: [
        { year: '2014', title: '從企業財稅場景出發', focus: '聚焦企業日常財稅服務中資料分散、溝通重複、結果難追溯的問題。', capability: '沉澱工資、票據、流水、核對與報表等高頻任務的場景理解。', value: '讓複雜財稅工作先有清晰的處理順序。' },
        { year: '2016', title: '深入一線經營需求', focus: '持續觀察小微企業、財務人員與企業服務團隊在月度協同中的真實阻塞點。', capability: '將找資料、催資料、核資料、看結果拆分為可由產品承接的協同環節。', value: '減少不同角色之間反覆解釋與資訊遺漏。' },
        { year: '2018', title: '推動服務流程產品化', focus: '圍繞高頻任務梳理標準步驟，讓經驗型服務逐步具備可複用的流程表達。', capability: '形成資料歸集、任務提醒、進度查看與結果覆核的基礎工作框架。', value: '讓企業可以更早了解本期該準備什麼、該處理什麼。' },
        { year: '2020', title: '加強數據協同與可視化', focus: '將工資、發票、銀行流水和經營數據放入更統一的查看與核對鏈路。', capability: '以數據歸集、差異識別和報表視圖協助財務人員完成日常判斷。', value: '協助管理者和財務在同一資訊基礎上溝通經營狀況。' },
        { year: '2022', title: '探索智能化財務工作方式', focus: '把 AI、大數據與自動化思路引入資料整理、異常提示和經營分析等環節。', capability: '圍繞智能 Agent、規則協同與自動化工作流持續打磨產品能力。', value: '將重複整理和基礎核對留給系統，把關鍵確認留給人。' },
        { year: '2024', title: '連接企業服務協作網絡', focus: '面向企業主、財務人員、代賬會計與企業服務夥伴探索更順暢的協同關係。', capability: '將產品、服務、渠道和使用回饋連接到同一套持續優化的服務閉環。', value: '讓不同參與方更容易共享進度、理解邊界並協同處理問題。' },
        { year: '2026', title: '面向企業 AI 財務未來', focus: '以賬大師為核心，繼續探索企業財務管理與經營協同的智能化升級路徑。', capability: '持續完善 AI 輔助、流程編排、資料管理和經營資訊呈現等能力。', value: '讓更多企業以更低的理解與協作成本獲得財稅工作支持。' },
      ],
      focusTitle: '從高頻財務工作，走向更清晰的經營協同',
      focus: [
        '圍繞工資、發票、銀行流水、數據核對和報表分析等高頻場景持續迭代',
        '透過 AI 大模型、智能 Agent 與自動化工作流，減少重複整理與核對成本',
        '為企業管理者、財務人員和企業服務夥伴提供更易理解的協同方式',
        '以產品、技術、服務和渠道協同，探索企業 AI 服務生態的長期價值',
      ],
    },
    faqTitle: '常見問題',
    faqs: [
      { q: '開始試用需要先註冊嗎？', a: '需要。為了保存企業賬套和試用資料，請先用手機號完成註冊或登入，再進入體驗流程。' },
    ],
    finalCta: {
      title: '先試用同一套標準流程',
      description: '從產品登錄頁開始體驗。',
      primary: '開始試用',
    },
    company: hkCompany,
  },
}

sites.jp.features = [
  {
    icon: 'building',
    title: '複数企業を一つの入口で管理',
    description: '経営者の複数主体、代行担当者の複数顧客管理に対応し、切り替えと権限を分かりやすくします。',
    details: ['複数企業', '権限管理', '顧客タスク', 'サービス期間'],
  },
  {
    icon: 'calculator',
    title: '給与と個税を整理',
    description: '給与、社会保険、公積金などの情報を整理し、個税試算と確認作業を支援します。',
    details: ['従業員給与', '社会保険', '個税試算', '履歴管理'],
  },
  {
    icon: 'file',
    title: '発票と費用をまとめて管理',
    description: '売上、仕入、費用、未発票支出を同じ画面で確認し、収入とコストを把握しやすくします。',
    details: ['売上発票', '仕入発票', '費用管理', '確認事項'],
  },
  {
    icon: 'landmark',
    title: '銀行明細を見える化',
    description: '銀行口座と入出金明細を管理し、発票や費用との照合を進めやすくします。',
    details: ['複数口座', '入金確認', '支払記録', '照合待ち'],
  },
  {
    icon: 'shield',
    title: '確認事項を先に提示',
    description: '申告前に影響しやすい発票、明細、コストの確認事項を早めに提示します。',
    details: ['発票確認', '明細照合', 'コスト確認', 'AI 提案'],
  },
  {
    icon: 'chart',
    title: '帳票と税額を随時確認',
    description: '税額試算、損益、貸借、凭证ビューをまとめて確認できます。',
    details: ['税額試算', '損益表', '貸借対照表', '凭证ビュー'],
  },
  {
    icon: 'message',
    title: 'AI 財税アシスタント',
    description: '税額、異常、コスト構成が分かりにくい時に、説明と処理順序の確認を支援します。',
    details: ['税額説明', '異常確認', 'タスク要約', '処理提案'],
  },
  {
    icon: 'headphones',
    title: '専任サポート',
    description: '試用、開通、利用中の問い合わせを担当者がサポートします。',
    details: ['担当者対応', '企業微信', 'メール', '協業相談'],
  },
]

sites.jp.roles = [
  {
    icon: 'wallet',
    title: '小規模企業の経営者',
    user: 'コストを抑え、状況を分かりやすく確認したい',
    journey: ['年間 360 元', 'スマートフォンで進捗確認', '税額と帳票を確認', '必要時にサポートへ相談'],
    cta: '複雑な財務知識がなくても、企業の帳務状況を把握できます。',
  },
  {
    icon: 'calculator',
    title: '財務/出納担当',
    user: '入力、照合、説明の負担を減らしたい',
    journey: ['給与を管理', '発票を整理', '銀行明細を照合', '帳票と資料を出力'],
    cta: '反復作業を減らし、確認に時間を使えます。',
  },
  {
    icon: 'layers',
    title: '代行記帳担当',
    user: '複数顧客の進捗とタスクを管理したい',
    journey: ['顧客を切り替え', 'タスクを確認', '異常を処理', '帳票と凭证を蓄積'],
    cta: '一つの入口で複数企業を管理し、コミュニケーションコストを下げます。',
  },
  {
    icon: 'chart',
    title: '経営管理者',
    user: '資金、税額、経営結果を確認したい',
    journey: ['収入とコストを確認', '税額見込みを確認', 'タスクを把握', '必要時に担当者へ共有'],
    cta: '管理画面に詳しくなくても、経営状況を把握できます。',
  },
  {
    icon: 'users',
    title: '権限付与された担当者',
    user: '担当範囲を明確にして協同したい',
    journey: ['権限を受ける', '対象企業へ入る', '指定資料を処理', '月次タスクを完了'],
    cta: 'アカウント共有を減らし、協同を明確にします。',
  },
]

sites.jp.proofItems = [
  { label: '低コスト', value: '0.98 元/日', description: '年間 360 元で、小規模企業も始めやすい料金です。' },
  { label: '随時確認', value: 'いつでも帳務確認', description: 'スマートフォンと PC で収入、コスト、税額、タスクを確認できます。' },
  { label: '効率向上', value: 'AI リマインド', description: '発票、銀行明細、給与の確認事項を早めに提示します。' },
  { label: '標準化', value: '帳票と凭证', description: '給与、発票、銀行明細から帳票と凭证ビューを整理します。' },
]

sites.hk.features = [
  {
    icon: 'building',
    title: '一個賬號管理多家公司',
    description: '適合老闆多主體經營、代賬會計多客戶管理，企業切換和授權協同更清楚。',
    details: ['多企業切換', '授權協同', '客戶待辦', '服務有效期'],
  },
  {
    icon: 'calculator',
    title: '工資個稅輔助測算',
    description: '錄入工資和五險一金，系統輔助測算個稅，減少手工公式和重複核對。',
    details: ['員工工資', '五險一金', '個稅測算', '工資歷史'],
  },
  {
    icon: 'file',
    title: '發票費用統一管理',
    description: '收入票、成本票、費用票、無票支出放在一起，收入成本更清晰。',
    details: ['銷項進項', '費用票', '無票支出', '異常提醒'],
  },
  {
    icon: 'landmark',
    title: '銀行流水看得清',
    description: '銀行流水和發票、費用關聯起來，收入支出不再只靠月底翻賬單。',
    details: ['多銀行賬戶', '回款核對', '付款記錄', '待匹配提醒'],
  },
  {
    icon: 'shield',
    title: '風險提醒先處理',
    description: '把影響做賬報稅的事項提前列出來，減少漏項、錯項和逾期風險。',
    details: ['發票待確認', '流水待匹配', '成本缺口', 'AI 建議'],
  },
  {
    icon: 'chart',
    title: '報表稅額隨時看',
    description: '匯總稅額測算、資產負債表、利潤表和憑證視圖，讓經營結果更直觀。',
    details: ['稅額測算', '利潤表', '資產負債表', '憑證視圖'],
  },
  {
    icon: 'message',
    title: 'AI 財稅助手',
    description: '看不懂稅額、異常、成本構成時，可先獲得解釋和處理建議。',
    details: ['稅額解釋', '異常定位', '待辦總結', '處理建議'],
  },
  {
    icon: 'headphones',
    title: '專屬客服承接',
    description: '試用、開通、使用問題都有客服承接，企業不用自己摸索全部流程。',
    details: ['姚經理', '企業微信', '郵件溝通', '合作對接'],
  },
]

sites.hk.roles = [
  {
    icon: 'wallet',
    title: '小微企業主',
    user: '關心少花錢、少操心、看得懂',
    journey: ['一年 360 元', '手機看進度', '查看稅額和報表', '有問題找客服'],
    cta: '不用懂複雜財務，也能掌握企業賬本。',
  },
  {
    icon: 'calculator',
    title: '企業財務/出納',
    user: '關心少錄表、少核對、少解釋',
    journey: ['維護工資', '整理發票', '核對流水', '生成報表和資料'],
    cta: '把重複整理工作交給系統，把時間留給復核。',
  },
  {
    icon: 'layers',
    title: '代賬會計',
    user: '關心多客戶管理和服務效率',
    journey: ['切換客戶', '查看待辦', '處理異常', '沉澱報表憑證'],
    cta: '一個入口服務多家企業，降低重複溝通成本。',
  },
  {
    icon: 'chart',
    title: '老闆/經營者',
    user: '關心現金流、稅額和經營結果',
    journey: ['查看收入成本', '查看預計稅額', '查看待辦提醒', '需要時轉給財務'],
    cta: '不用進複雜後台，也能知道企業經營狀態。',
  },
  {
    icon: 'users',
    title: '被授權人',
    user: '關心授權清楚、協作方便',
    journey: ['接受授權', '進入對應企業', '處理指定資料', '協同完成本月任務'],
    cta: '不用共用賬號，協同更清楚。',
  },
]

sites.hk.proofItems = [
  { label: '更便宜', value: '0.98 元/天', description: '360 元/年，適合小微企業先低成本用起來。' },
  { label: '更實時', value: '隨時查賬', description: '手機和電腦都能看本月收入、成本、稅額和待辦。' },
  { label: '更省心', value: 'AI 提醒', description: '發票、流水、工資異常提前提醒，減少月底補資料。' },
  { label: '更規範', value: '報表憑證', description: '按工資、發票、流水沉澱報表和憑證視圖。' },
]

export function getSiteContent(code: SiteCode) {
  return sites[code]
}
