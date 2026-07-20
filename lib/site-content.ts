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
  | 'store'
  | 'factory'
  | 'truck'
  | 'food'
  | 'health'
  | 'education'
  | 'code'
  | 'retail'
  | 'build'
  | 'cpu'
  | 'briefcase'
  | 'leaf'
  | 'scan'
  | 'coins'
  | 'rocket'
  | 'globe'

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
  // —— 以下为账大师中国站重构新增的富内容（可选，jp/hk 跟随视觉但不填充）——
  homeHighlights?: {
    eyebrow: string
    title: string
    subtitle: string
    items: { icon: IconKey; title: string; description: string; metric?: string }[]
  }
  pricingPlans?: {
    eyebrow: string
    title: string
    subtitle: string
    footnote?: string
    plans: {
      name: string
      badge?: string
      audience: string
      perDay?: string
      yearly: string
      yearlyNote?: string
      lifetime: string
      lifetimeNote?: string
      features: string[]
      highlight?: boolean
      cta: string
    }[]
  }
  comparison?: {
    eyebrow: string
    title: string
    subtitle: string
    columns: string[]
    groups: { name: string; rows: string[][] }[]
  }
  industries?: {
    eyebrow: string
    title: string
    subtitle: string
    note?: string
    items: { icon: IconKey; name: string; note: string }[]
  }
  cases?: {
    eyebrow: string
    title: string
    subtitle: string
    stats: { value: string; label: string }[]
    items: {
      company: string
      industry: string
      metric: string
      metricLabel: string
      quote: string
      person?: string
      tags: string[]
    }[]
  }
  philosophy?: {
    eyebrow: string
    title: string
    subtitle: string
    items: { tag: string; title: string; body: string }[]
  }
  partnerMarket?: {
    eyebrow: string
    title: string
    subtitle: string
    stats: { value: string; label: string; note?: string }[]
    reasons: { icon: IconKey; title: string; body: string }[]
    supports: { title: string; body: string }[]
  }
  wechat?: {
    eyebrow: string
    title: string
    desc: string
    steps: string[]
    qr: string
    qrNote: string
  }
  casesIntro?: {
    eyebrow: string
    title: string
    subtitle: string
  }
  industryStats?: { name: string; count: string; icon: IconKey }[]
  caseDistribution?: { name: string; count: string; icon: IconKey }[]
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
    name: '账大师',
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
      { label: '客户案例', href: '/cn/cases/' },
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
    actions: { login: '登录', trial: '立即使用' },
    hero: {
      eyebrow: '360 元/年 · AI 智能记账 · 一天一块钱',
      title: 'AI 帮你记账报税，',
      titleAccent: '一年 360 元，一天一块钱',
      description:
        '账大师用 AI 把工资、发票、银行流水自动整理成做账材料，生成税额测算、报表和待办提醒。老板用手机看结果，财务和代账会计在一套流程里协同——把重复的活交给 AI，把账管明白。',
      primaryCta: '立即使用',
    },
    metrics: [
      { value: '一天只要一块钱', label: '低成本管账', note: '360 元/年，每天只要一块钱' },
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
      { label: '更便宜', value: '一天只要一块钱', description: '360 元/年，适合小微企业先低成本用起来。' },
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
      title: 'AI 时代企业财务智能化引领者',
      description:
        '账大师（上海）人工智能技术有限公司成立于 2014 年，专注于人工智能、大数据、云计算与企业财务服务的融合创新。以“让天下企业拥有一个 AI 财税大脑”为愿景，我们用 AI 大模型、智能 Agent 和自动化工作流，推动企业财务从“人工记账”走向“AI 智能财务”。',
      stats: [
        { value: '2014', label: '成立年份', note: '十二年深耕企业财税服务领域' },
        { value: '360 元', label: 'AI 记账', note: '一天一块钱，把公司账管明白' },
        { value: '全国', label: '服务网络', note: '代理商、城市运营与本地服务体系' },
        { value: 'AI 大脑', label: '产品愿景', note: '让天下企业拥有一个 AI 财税大脑' },
      ],
      milestoneTitle: '十二年进化之路：从企业财税服务到 AI 财务智能时代',
      milestoneSubtitle: '账大师伴随中国企业数字化浪潮持续创新升级——从传统财税服务，到数字化财务管理，再到 AI 智能财务平台，让 AI 成为企业经营增长的新引擎。',
      milestoneCapabilityLabel: '能力沉淀',
      milestones: [
        { year: '2014', title: '企业服务启航', focus: '公司成立，聚焦中小企业经营服务需求，围绕企业注册、财税管理、代理记账等基础服务场景，建立专业服务体系。', capability: '企业服务 · 财税运营 · 客户积累 · 行业经验', value: '深耕财税服务领域，积累企业经营数据与业务经验。' },
        { year: '2017', title: '数字化探索', focus: '随着企业数字化转型加速，开始探索互联网技术与财税服务融合，推动传统财税服务向线上化、标准化发展。', capability: '数字财税 · 流程优化 · 在线服务 · 系统建设', value: '开启企业财务智能化布局。' },
        { year: '2019', title: '平台建设', focus: '围绕企业财务管理需求，持续建设数字化平台能力，实现客户管理、业务流程、服务体系的线上化。', capability: '财税平台 · 数据能力 · 系统升级 · 服务效率', value: '让财税服务更加标准、高效、透明。' },
        { year: '2020', title: '模式升级', focus: '人工智能技术快速发展，公司开始探索 AI 在企业财务场景中的应用，围绕智能识别、自动处理、数据分析进行技术验证。', capability: 'AI 探索 · 智能识别 · 自动化流程 · 场景验证', value: '让 AI 逐步进入企业财务工作流程。' },
        { year: '2021', title: '能力跃迁', focus: '持续加强技术研发与产品能力建设，围绕企业服务场景打造更完善的数字化体系。', capability: '技术研发 · 智能服务 · 产品体系 · 能力升级', value: '从“人工驱动”向“技术辅助 + 专业服务”升级。' },
        { year: '2022', title: '产品创新', focus: '围绕企业经营管理需求，探索 AI 在记账、报税、风险管理、经营分析等场景的应用。', capability: 'AI 应用 · 智能记账 · 风险管理 · 经营分析', value: '通过智能化工具，推动财税服务进入智能时代。' },
        { year: '2023', title: '产品成型', focus: '聚焦企业财务智能化需求，打造“账大师 AI”产品体系，为企业提供智能记账、自动报税、风险提醒、财务分析等一体化服务。', capability: '账大师 AI · 智能财务 · 产品升级 · 企业服务', value: '账大师 AI 正式升级。' },
        { year: '2024', title: '生态构建', focus: '围绕“产品 + 服务 + 生态”战略，持续完善 AI 财务产品矩阵，通过全国合作伙伴体系服务更多企业。', capability: 'AI 财务 · 生态合作 · 渠道体系 · 伙伴共赢', value: '打造 AI 财税服务新模式。' },
        { year: '2025', title: '全国布局', focus: '启动全国市场布局，通过代理商体系、城市运营中心和本地服务网络，让更多中小企业快速拥有 AI 财务能力。', capability: '全国布局 · 城市合作 · 代理生态 · 规模复制', value: '推动 AI 财务从产品应用走向规模化服务。' },
        { year: '2026', title: '战略升级', focus: '账大师全面升级为企业 AI 财务智能平台，融合 AI 大模型、企业智能 Agent、自动化财务工作流、经营数据分析与风险智能预警。', capability: 'AI 财务大脑 · 智能 Agent · 产业生态 · 未来企业', value: '打造企业专属 AI 财务大脑，开启经营智能化新时代。' },
      ],
      focusTitle: '站在月球看地球，大风流创新，大风流创业',
      focus: [
        '以全球视野洞察未来，以 AI 技术推动财税行业变革',
        '不满足于优化传统流程，而是重新定义企业财务服务模式',
        '让 AI 成为企业经营发展的核心伙伴，而不只是一个工具',
        '让每一家企业都拥有自己的 AI 财务助手，经营无忧',
      ],
    },
    faqTitle: '常见问题',
    faqs: [
      {
        q: '开始 7 天体验需要先注册吗？',
        a: '点击官网的“立即使用”会直接进入账大师产品站；按页面指引注册或登录，即可开始体验。官网不再收集试用申请信息。',
      },
      {
        q: '账大师适合谁？',
        a: '适合小微企业、个体工商户、初创公司、企业财务和代账会计。尤其适合想用较低成本把工资、发票、流水、报表和税额测算统一管起来的团队。',
      },
      {
        q: '现在能真实自动报税吗？',
        a: '账大师重点帮助你整理做账报税材料、测算税额、发现异常、生成报表和申报资料。涉及最终申报提交的动作，建议由企业或会计结合实际情况确认。',
      },
      {
        q: '价格为什么只有 360 元/年？',
        a: '360 元/年是小规模企业套餐价格，折合 30 元/月，适配小规模纳税人的记账报税流程。一般纳税人流程环节更多、处理更复杂，对应套餐为 1056 元/年；两个套餐使用相同的核心产品能力。',
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
        a: '点击页面中的“立即使用”会直接进入账大师产品站，按页面指引注册或登录。官网不再收集用户试用信息。',
      },
    ],
    finalCta: {
      title: '今天开始，把账管清楚',
      description: '一年 360 元，先从一个企业、一个申报周期开始试。看得懂账、找得到资料、知道下一步该处理什么。',
      primary: '立即使用',
    },
    company: commonCompany,
  },
  jp: {
    code: 'jp',
    name: '帳マスター',
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
      { label: '顧客事例', href: '/jp/cases/' },
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
      eyebrow: '中小企業向け AI 財務ワークスペース',
      title: '日々の財務業務を',
      titleAccent: '一つの流れで管理',
      description:
        '給与、請求書、銀行明細、照合、申告資料作成を一つの流れで管理し、経営者と財務担当者が同じ画面で状況を確認できます。',
      primaryCta: '試用開始',
    },
    metrics: [
      { value: '360 元', label: '年額料金', note: '低コストで標準フローを体験' },
      { value: '5 ステップ', label: '標準フロー', note: '給与、請求書、明細、照合、資料確認' },
      { value: 'Web・モバイル', label: '両方で利用', note: '担当者と経営者が連携' },
      { value: 'AI アシスト', label: '確認を補助', note: '照合、要約、次の対応を整理' },
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
      { q: '7 日間の体験を始めるには登録が必要ですか？', a: '公式サイトの利用開始ボタンから賬大師の製品サイトへ直接移動します。画面の案内に沿って登録またはログインしてください。公式サイトでは試用申請情報を収集しません。' },
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
    name: '賬大師香港',
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
      { label: '客戶案例', href: '/hk/cases/' },
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
      { q: '開始 7 天體驗需要先註冊嗎？', a: '點擊官網的「立即使用」會直接進入賬大師產品站；按頁面指引註冊或登入即可。官網不再收集試用申請資料。' },
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
  { label: '低コスト', value: '1日わずか1元', description: '年間 360 元で、小規模企業も始めやすい料金です。' },
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
  { label: '更便宜', value: '每天只要一元', description: '360 元/年，適合小微企業先低成本用起來。' },
  { label: '更實時', value: '隨時查賬', description: '手機和電腦都能看本月收入、成本、稅額和待辦。' },
  { label: '更省心', value: 'AI 提醒', description: '發票、流水、工資異常提前提醒，減少月底補資料。' },
  { label: '更規範', value: '報表憑證', description: '按工資、發票、流水沉澱報表和憑證視圖。' },
]

// 日本站与香港站同步提供本地化的富内容，保持与中国站一致的信息层级。
sites.jp.homeHighlights = { eyebrow: '利用シーン', title: '日々の財務作業を、確認しやすい流れに', subtitle: '資料の収集から確認、次の対応までを一つの画面で追えるようにします。', items: [{ icon: 'wallet', title: '日々の資料を集約', description: '給与、請求書、銀行明細を日常的に整理します。' }, { icon: 'check', title: '確認事項を可視化', description: '照合待ちや不足資料を優先して確認できます。' }, { icon: 'chart', title: '経営状況を把握', description: '収入、コスト、対応事項を同じ情報で確認します。' }, { icon: 'users', title: '役割ごとに連携', description: '経営者、財務担当、支援担当者の協業を支えます。' }] }
sites.jp.pricingPlans = {
  eyebrow: '料金プラン',
  title: '納税人区分に合わせて選べる、明確な料金',
  subtitle: '二つのプランは同じ中核機能を利用し、納税人区分に応じた記帳・申告フローに対応します。処理フローの違いにより料金が異なります。',
  footnote: '利用範囲や最終的な申告判断は、実際の事業状況と担当者の確認に基づきます。',
  plans: [
    {
      name: '小規模事業者向け',
      audience: '小規模納税人の記帳・申告フローを利用する事業者',
      perDay: '1日約1元',
      yearly: '360 元',
      yearlyNote: '/ 年',
      lifetime: 'お問い合わせください',
      lifetimeNote: '',
      features: [
        '小規模納税人の記帳・申告フローに対応',
        '給与・請求書・銀行明細の整理と照合',
        '仕訳作成と財務レポートの確認',
        '税額試算の補助と申告資料のプレビュー',
        'AIによる確認事項と例外の説明',
        'モバイルとPCでの確認',
      ],
      cta: '試用開始',
    },
    {
      name: '一般納税人向け',
      audience: '一般納税人の記帳・申告フローを利用する事業者',
      yearly: '1,056 元',
      yearlyNote: '/ 年',
      lifetime: 'お問い合わせください',
      lifetimeNote: '',
      features: [
        '一般納税人の記帳・申告フローに対応',
        '給与・請求書・銀行明細の整理と照合',
        '仕訳作成と財務レポートの確認',
        '税額試算の補助と申告資料のプレビュー',
        'AIによる確認事項と例外の説明',
        'モバイルとPCでの確認',
      ],
      cta: '試用開始',
    },
  ],
}
sites.jp.comparison = {
  eyebrow: '機能比較',
  title: '二つのプランの選び方と、従来の会計代行との違い',
  subtitle: '帳大師の中核機能は共通で、納税人区分に応じた業務フローにより料金が異なります。従来の会計代行は、事業者やサービス範囲によって料金と提供方法が異なります。',
  columns: ['比較項目', '従来の会計代行会社', '帳大師・小規模事業者向け', '帳大師・一般納税人向け'],
  groups: [
    {
      name: '料金とプラン選択',
      rows: [
        ['料金体系', '地域、事業者、証憑量、サービス範囲に応じて見積もり', '360 元 / 年、長期利用は要問い合わせ', '1,056 元 / 年、長期利用は要問い合わせ'],
        ['対象区分', '企業状況に応じて事業者がサービスプランを確認', '小規模納税人', '一般納税人'],
        ['記帳・申告フロー', '事業者のサービスフローに沿って対応', '小規模納税人向けフローに対応', '一般納税人向けフローに対応'],
      ],
    },
    {
      name: '業務方法と製品の特長',
      rows: [
        ['給与・請求書・銀行明細', '事業者の資料受け渡しと処理方法に準拠', '一元的に収集・照合', '一元的に収集・照合'],
        ['財務結果の確認', '事業者の提供方法に応じて確認', 'モバイルとPCで確認', 'モバイルとPCで確認'],
        ['確認事項と例外', '事業者の連絡方法に沿って対応', '確認事項と例外説明を一元表示', '確認事項と例外説明を一元表示'],
        ['企業と担当者の連携', '使用するツールと業務フローによる', '企業切替と権限管理に対応', '企業切替と権限管理に対応'],
        ['プロセスと結果の再確認', '提供内容と連絡方法に準拠', 'プロセスと結果を確認・再確認可能', 'プロセスと結果を確認・再確認可能'],
      ],
    },
  ],
}
sites.jp.industries = { eyebrow: '業種別活用', title: 'さまざまな事業の日常的な財務確認に', subtitle: '業種ごとに異なる収入・コスト・明細管理の確認を支援します。', note: '実際の利用方法は、事業規模や取引内容によって異なります。', items: [{ icon: 'retail', name: '小売・商業', note: '仕入・売上・回収の確認' }, { icon: 'food', name: '飲食サービス', note: '店舗別の明細とコスト整理' }, { icon: 'store', name: 'EC事業', note: '入金・返金・手数料の照合' }, { icon: 'briefcase', name: '専門サービス', note: '案件収入と経費の確認' }, { icon: 'code', name: 'IT・ソフトウェア', note: '人件費とプロジェクト収支の整理' }, { icon: 'factory', name: '製造・物流', note: '仕入・原価・回収の確認' }] }
sites.jp.cases = { eyebrow: '顧客の声', title: '日々の財務業務で寄せられる課題', subtitle: '企業名を公開せず、利用場面で重視される確認ポイントを紹介します。', stats: [{ value: '12,018', label: '利用シーンの累計' }], items: [{ company: '匿名の小売事業者', industry: '小売・商業', metric: 'モバイルで状況確認', metricLabel: '資料を日々に整理', quote: '月末だけに資料を集めるのではなく、日々の確認事項として整理できるようになりました。', person: '経営者（匿名）', tags: ['日常管理', '明細確認'] }, { company: '匿名の会計サービスチーム', industry: '会計サービス', metric: '対応事項を共有', metricLabel: '確認漏れを減らす', quote: '担当者ごとの確認事項が見えやすくなり、資料の依頼と照合を同じ流れで進められます。', person: '担当者（匿名）', tags: ['共同作業', '照合'] }, { company: '匿名の複数企業経営者', industry: '複数企業', metric: '企業ごとに確認', metricLabel: '役割と権限を整理', quote: '会社ごとの収入、コスト、対応事項を切り替えて確認でき、状況を把握しやすくなりました。', person: '経営者（匿名）', tags: ['複数企業', '権限管理'] }] }
sites.jp.philosophy = { eyebrow: '私たちの考え方', title: '反復作業は仕組みへ、重要な判断は人へ', subtitle: 'AIと業務フローを組み合わせ、企業の財務確認をわかりやすくします。', items: [{ tag: 'AI', title: '日常の確認を支える', body: '資料整理、例外の提示、確認事項の要約を通じて、日々の業務を支援します。' }, { tag: '製品', title: '分かりやすい流れをつくる', body: '複雑な財務作業を、役割ごとに理解しやすい手順へ整理します。' }, { tag: '協業', title: '同じ情報で話せる状態へ', body: '経営者、財務担当、支援担当者が進捗と確認事項を共有できるようにします。' }] }
sites.jp.partnerMarket = { eyebrow: 'パートナー連携', title: '企業サービスの現場に、わかりやすいAI財務を', subtitle: '会計事務所、財務アドバイザー、企業サービスのパートナーと連携します。', stats: [{ value: 'AI', label: '日常の資料整理' }, { value: '標準', label: '導入フロー' }, { value: '協業', label: 'パートナー支援' }], reasons: [{ icon: 'rocket', title: '説明しやすい製品体験', body: '日常の資料整理と確認事項を、利用者が理解しやすい流れにまとめます。' }, { icon: 'layers', title: '既存顧客への提案', body: '会計・財務サービスの現場で、日々の確認作業を支える選択肢になります。' }, { icon: 'headphones', title: '導入を支援', body: '製品説明、利用開始、資料整理の流れをパートナーと共有します。' }], supports: [{ title: '製品支援', body: '利用シーンに応じた製品説明と導入案内。' }, { title: '運用支援', body: '資料整理と確認の進め方を共有。' }, { title: '連携支援', body: 'パートナーとの継続的な情報連携。' }] }
sites.jp.wechat = { eyebrow: '利用開始', title: 'まずはAI記帳の流れを確認', desc: '製品サイトへ直接移動し、画面の案内に沿って利用を開始できます。', steps: ['利用開始を選択', '賬大師の製品サイトへ移動', '案内に沿ってログインまたは登録'], qr: '/images/wechat-official-qr.png', qrNote: '利用開始のご案内' }

sites.hk.homeHighlights = { eyebrow: '使用場景', title: '把日常財務工作整理成容易查看的流程', subtitle: '由資料歸集、核對到下一步處理，都可在同一個工作流程中掌握。', items: [{ icon: 'wallet', title: '集中日常資料', description: '把工資、發票及銀行流水持續整理。' }, { icon: 'check', title: '看清待確認事項', description: '按優先次序查看待核對及缺漏資料。' }, { icon: 'chart', title: '掌握經營狀況', description: '以同一套資料查看收入、成本及待辦。' }, { icon: 'users', title: '按角色協同', description: '支援企業主、財務與服務團隊協作。' }] }
sites.hk.pricingPlans = {
  eyebrow: '定價方案',
  title: '按納稅人類型選擇清晰的服務方案',
  subtitle: '兩個方案使用相同的核心功能，並按納稅人類型配合相應的記賬報稅流程；處理流程不同，因此價格不同。',
  footnote: '實際使用範圍及最終申報判斷，應按企業情況及專業人員確認。',
  plans: [
    {
      name: '小微企業方案',
      audience: '使用小規模納稅人記賬報稅流程的企業',
      perDay: '每日約 1 元',
      yearly: '360 元',
      yearlyNote: '/ 年',
      lifetime: '請聯絡我們',
      lifetimeNote: '',
      features: [
        '配合小規模納稅人記賬報稅流程',
        '工資、發票及銀行流水歸集與核對',
        '憑證生成與財務報表查看',
        '稅額輔助測算與申報資料預覽',
        'AI 待辦提示與異常說明',
        '手機與電腦端查看',
      ],
      cta: '開始試用',
    },
    {
      name: '一般納稅人方案',
      audience: '使用一般納稅人記賬報稅流程的企業',
      yearly: '1,056 元',
      yearlyNote: '/ 年',
      lifetime: '請聯絡我們',
      lifetimeNote: '',
      features: [
        '配合一般納稅人記賬報稅流程',
        '工資、發票及銀行流水歸集與核對',
        '憑證生成與財務報表查看',
        '稅額輔助測算與申報資料預覽',
        'AI 待辦提示與異常說明',
        '手機與電腦端查看',
      ],
      cta: '開始試用',
    },
  ],
}
sites.hk.comparison = {
  eyebrow: '功能比較',
  title: '兩個方案如何選擇？與傳統代賬有何不同',
  subtitle: '賬大師兩個方案的核心功能相同，按納稅人類型配合不同的記賬報稅流程；傳統代賬的收費與交付方式會因機構及服務範圍而異。',
  columns: ['比較項目', '傳統代賬公司', '賬大師 · 小微企業', '賬大師 · 一般納稅人'],
  groups: [
    {
      name: '價格與方案選擇',
      rows: [
        ['費用方式', '按地區、機構、票據量及服務範圍報價', '360 元 / 年；長期方案請聯絡我們', '1,056 元 / 年；長期方案請聯絡我們'],
        ['適用納稅人類型', '由機構結合企業情況確認服務方案', '小規模納稅人', '一般納稅人'],
        ['記賬報稅流程', '按機構服務流程處理', '配合小規模納稅人流程', '配合一般納稅人流程'],
      ],
    },
    {
      name: '工作方式與產品優勢',
      rows: [
        ['工資、發票及銀行流水資料', '按機構資料交接與處理方式', '集中歸集與核對', '集中歸集與核對'],
        ['財務結果查看', '按機構交付方式查看', '手機與電腦端查看', '手機與電腦端查看'],
        ['異常與待辦', '按機構溝通方式處理', '集中展示待辦與異常說明', '集中展示待辦與異常說明'],
        ['企業與人員協同', '取決於機構使用的工具和流程', '支援企業切換與授權協同', '支援企業切換與授權協同'],
        ['過程與結果覆核', '以機構交付內容和溝通方式為準', '過程和結果可查看、覆核', '過程和結果可查看、覆核'],
      ],
    },
  ],
}
sites.hk.industries = { eyebrow: '行業場景', title: '支援不同企業的日常財務查看', subtitle: '按行業的收入、成本與流水特點整理常見核對場景。', note: '實際使用方式會因企業規模及交易內容而異。', items: [{ icon: 'retail', name: '商貿零售', note: '進銷與回款查看' }, { icon: 'food', name: '餐飲服務', note: '門店流水與成本整理' }, { icon: 'store', name: '電商經營', note: '回款、退款與佣金核對' }, { icon: 'briefcase', name: '專業服務', note: '項目收入與費用查看' }, { icon: 'code', name: '科技軟件', note: '人力與項目收支整理' }, { icon: 'factory', name: '製造物流', note: '採購、成本與回款核對' }] }
sites.hk.cases = { eyebrow: '客戶回饋', title: '來自日常財務工作的關注點', subtitle: '不公開企業名稱，僅呈現不同角色關心的使用場景。', stats: [{ value: '12,018', label: '累計服務場景' }], items: [{ company: '匿名商貿企業', industry: '商貿零售', metric: '隨時查看狀況', metricLabel: '日常資料歸集', quote: '不再等到月底才集中找資料，日常就可以看到需要處理的事項。', person: '企業負責人（已匿名）', tags: ['日常管理', '流水查看'] }, { company: '匿名企業服務團隊', industry: '企業服務', metric: '共享待辦事項', metricLabel: '減少核對遺漏', quote: '不同同事都能看到待處理事項，收集資料與核對工作更有次序。', person: '服務人員（已匿名）', tags: ['協同', '核對'] }, { company: '匿名多主體企業', industry: '多企業管理', metric: '分開查看各企業', metricLabel: '整理角色權限', quote: '收入、成本與待辦可按公司切換查看，管理狀況更容易掌握。', person: '企業負責人（已匿名）', tags: ['多企業', '權限管理'] }] }
sites.hk.philosophy = { eyebrow: '我們的理念', title: '把重複整理交給系統，把關鍵確認留給人', subtitle: '以 AI 與工作流程，協助企業更清楚地處理日常財務。', items: [{ tag: 'AI', title: '支援日常核對', body: '透過資料整理、例外提示與待辦摘要，支援日常工作。' }, { tag: '產品', title: '建立容易理解的流程', body: '把複雜財務工作整理成不同角色都容易使用的步驟。' }, { tag: '協同', title: '以同一套資料溝通', body: '讓企業主、財務與服務團隊更容易共享進度與事項。' }] }
sites.hk.partnerMarket = { eyebrow: '合作夥伴', title: '把清晰易用的 AI 財務帶進企業服務現場', subtitle: '與會計、財稅顧問及企業服務夥伴共同服務企業。', stats: [{ value: 'AI', label: '日常資料整理' }, { value: '標準', label: '導入流程' }, { value: '協同', label: '夥伴支援' }], reasons: [{ icon: 'rocket', title: '容易說明的產品體驗', body: '把日常資料整理與核對事項放在使用者容易理解的流程。' }, { icon: 'layers', title: '服務既有客戶', body: '為會計及企業服務場景提供日常核對工作的支援。' }, { icon: 'headphones', title: '支援使用開始', body: '與合作夥伴共享產品說明、使用開始及資料整理方法。' }], supports: [{ title: '產品支援', body: '提供按使用場景整理的產品說明。' }, { title: '使用支援', body: '共享資料整理與核對流程。' }, { title: '協同支援', body: '持續與合作夥伴交換使用回饋。' }] }
sites.hk.wechat = { eyebrow: '開始使用', title: '先了解 AI 記賬的使用流程', desc: '直接進入產品站，按頁面指引即可開始使用。', steps: ['選擇立即使用', '進入賬大師產品站', '按指引登入或註冊'], qr: '/images/wechat-official-qr.png', qrNote: '開始使用說明' }

// 中国站（cn）富内容：首页前置亮点、定价、功能对比、行业、客户案例、产品理念、代理市场、公众号引导。

sites.cn.homeHighlights = {
  eyebrow: '为什么是账大师',
  title: '一天一块钱，把老板最头疼的账管明白',
  subtitle: '不用懂复杂财务，也不用等到月底。工资、发票、流水、报税，AI 先帮你理清楚，你只做关键确认。',
  items: [
    { icon: 'coins', title: '一天一块钱的 AI 记账', description: '小规模企业 360 元/年，每天只要一块钱，适合先低成本使用。', metric: '一天一块钱' },
    { icon: 'scan', title: 'AI 三步智能记账', description: '录工资、收发票、对流水，AI 自动生成凭证、税额测算和报表，减少手工录入和反复核对。', metric: '3 步出结果' },
    { icon: 'chart', title: '手机随时查账', description: '老板用手机看收入、成本、税额和待办，不用等会计月底发报表，经营状况一眼看懂。', metric: '随时查' },
    { icon: 'shield', title: 'AI 待办提醒', description: '发票待确认、流水待匹配、成本缺口等事项集中列入待办，方便申报前逐项核对。', metric: '待办提醒' },
    { icon: 'building', title: '一个账号管多家公司', description: '老板多主体经营、代账会计多客户管理，企业切换和授权协同都在一套流程里。', metric: '多企业' },
    { icon: 'headphones', title: '客服咨询入口', description: '可通过专属客服入口咨询试用、开通和使用问题，具体服务范围以双方确认为准。', metric: '客服咨询' },
  ],
}

sites.cn.pricingPlans = {
  eyebrow: '定价方案',
  title: '价格直接、服务清楚，先低成本用起来',
  subtitle: '两个套餐使用同一套核心产品能力，按纳税人类型适配对应的记账报税流程；流程复杂度不同，因此价格不同。',
  footnote: '以上价格为账大师软件服务费，不含企业实际应缴税款；具体开通范围与服务内容以双方确认为准。',
  plans: [
    {
      name: '小规模企业',
      audience: '小规模纳税人企业 · 适配对应记账报税流程',
      perDay: '30 元/月',
      yearly: '¥360',
      yearlyNote: '/ 年',
      lifetime: '¥1888',
      lifetimeNote: '永久买断',
      highlight: true,
      cta: '立即使用',
      features: [
        '适配小规模纳税人记账报税流程',
        '工资、发票、银行流水归集与核对',
        '凭证生成与财务报表查看',
        '税额辅助测算与申报资料预览',
        'AI 待办提醒与异常说明',
        '手机与电脑随时查账',
      ],
    },
    {
      name: '一般纳税人',
      audience: '一般纳税人企业 · 适配对应记账报税流程',
      perDay: '88 元/月',
      yearly: '¥1056',
      yearlyNote: '/ 年',
      lifetime: '¥3888',
      lifetimeNote: '永久买断',
      cta: '立即使用',
      features: [
        '适配一般纳税人记账报税流程',
        '工资、发票、银行流水归集与核对',
        '凭证生成与财务报表查看',
        '税额辅助测算与申报资料预览',
        'AI 待办提醒与异常说明',
        '手机与电脑随时查账',
      ],
    },
  ],
}

sites.cn.comparison = {
  eyebrow: '功能对比',
  title: '两个套餐怎么选？和传统代账比有什么不同',
  subtitle: '账大师两个套餐使用同一套核心产品能力，按纳税人类型适配不同的记账报税流程；传统代账的费用和交付方式会因机构与服务范围而异。',
  columns: ['对比项目', '传统代账公司', '账大师 · 小规模', '账大师 · 一般纳税人'],
  groups: [
    {
      name: '价格与套餐选择',
      rows: [
        ['费用方式', '按地区、机构、票据量和服务范围报价', '¥360 / 年；¥1888 永久买断', '¥1056 / 年；¥3888 永久买断'],
        ['适用纳税人类型', '由机构结合企业情况确认服务方案', '小规模纳税人', '一般纳税人'],
        ['记账报税流程', '按机构服务流程处理', '适配小规模纳税人流程', '适配一般纳税人流程'],
      ],
    },
    {
      name: '工作方式与产品优势',
      rows: [
        ['工资、发票和银行流水资料', '按机构资料交接与处理方式', '集中归集与核对', '集中归集与核对'],
        ['财务结果查看', '按机构交付方式查看', '手机和电脑端查看', '手机和电脑端查看'],
        ['异常与待办', '按机构沟通方式处理', '集中展示待办与异常说明', '集中展示待办与异常说明'],
        ['企业与人员协同', '取决于机构使用的工具和流程', '支持企业切换与授权协同', '支持企业切换与授权协同'],
        ['过程与结果复核', '以机构交付内容和沟通方式为准', '过程和结果可查看、复核', '过程和结果可查看、复核'],
      ],
    },
  ],
}

sites.cn.industries = {
  eyebrow: '行业覆盖',
  title: '各行各业的企业，都在用账大师管账',
  subtitle: '不论你做的是零售、餐饮、电商还是服务、制造，账大师都能把你行业里高频的记账报税场景理清楚。',
  note: '以下为账大师适用的典型行业场景，实际使用体验会因企业规模与业务复杂度不同而有所差异。',
  items: [
    { icon: 'retail', name: '商贸零售', note: '进销存与销项进项，收入成本一目了然' },
    { icon: 'food', name: '餐饮门店', note: '多门店流水归集，人工与食材成本清晰' },
    { icon: 'store', name: '电商网店', note: '平台回款对账，费用与佣金自动归类' },
    { icon: 'factory', name: '生产制造', note: '原材料、人工、费用成本核算更省心' },
    { icon: 'truck', name: '物流运输', note: '油费、路桥、车辆费用与回款匹配' },
    { icon: 'build', name: '建筑工程', note: '项目制成本归集，进度款与发票对应' },
    { icon: 'code', name: '科技软件', note: '研发人力成本与项目收益清晰核算' },
    { icon: 'briefcase', name: '企业服务', note: '客户项目、供应商往来与费用票归档' },
    { icon: 'health', name: '医疗健康', note: '合规票据管理，收入成本规范呈现' },
    { icon: 'education', name: '教育培训', note: '课时收入与人员成本分期清晰' },
    { icon: 'leaf', name: '农业食品', note: '无票支出与农产品采购规范登记' },
    { icon: 'building', name: '房产物业', note: '多主体、多物业收支集中管理' },
    { icon: 'spark', name: '文化传媒', note: '内容项目收入与外包成本对应' },
    { icon: 'wallet', name: '批发代理', note: '大额进销项与回款账期清楚可控' },
    { icon: 'users', name: '个体工商户', note: '低成本合规记账，经营心中有数' },
    { icon: 'globe', name: '外贸出口', note: '多币种收支与退税资料整理更顺' },
  ],
}

sites.cn.cases = {
  eyebrow: '客户反馈',
  title: '来自真实工作场景的使用反馈',
  subtitle: '以下内容已做匿名处理，用于呈现不同企业在日常财税工作中的实际关注点；使用方式与体验会因企业情况而不同。',
  stats: [{ value: '12,000+', label: '累计服务企业' }],
  items: [
    {
      company: '匿名商贸企业',
      industry: '商贸零售',
      metric: '手机查账',
      metricLabel: '资料归集',
      quote: '以前找代账公司一个月 300 元，一年下来小四千。换成账大师 360 元/年，报表还能随时在手机上看，账反而更清楚了。',
      person: '企业负责人（已匿名）',
      tags: ['月度报税', '发票流水', '老板查账'],
    },
    {
      company: '匿名连锁餐饮企业',
      industry: '餐饮门店',
      metric: '多主体协同',
      metricLabel: '集中查看',
      quote: '三家店以前各记各的，月底对账能对到崩溃。现在一个账号切换三家公司，收入成本待办都集中，心里终于有底了。',
      person: '连锁门店负责人（已匿名）',
      tags: ['多企业', '流水归集', '经营看板'],
    },
    {
      company: '匿名企业服务机构',
      industry: '企业服务',
      metric: '待办处理',
      metricLabel: '资料协同',
      quote: '账大师先把发票、工资、流水异常排好队，我们按待办处理就行，不用月底集中催资料，一个会计能多带一倍客户。',
      person: '财税服务人员（已匿名）',
      tags: ['多客户', '待办提醒', '批量处理'],
    },
    {
      company: '匿名初创团队',
      industry: '科技软件',
      metric: '基础财税起步',
      metricLabel: '风险提示',
      quote: '公司刚起步没请专职财务，账大师的 AI 记账和风险提醒帮我们把基础财税跑通，钱花在刀刃上。',
      person: '创业团队负责人（已匿名）',
      tags: ['初创公司', 'AI 记账', '风险预警'],
    },
    {
      company: '匿名电商企业',
      industry: '电商网店',
      metric: '回款对账',
      metricLabel: '流水匹配',
      quote: '平台回款、退款、佣金一笔笔核太累，账大师把流水和发票关联起来，收入成本对得上，报税也踏实。',
      person: '电商经营者（已匿名）',
      tags: ['平台回款', '流水匹配', '费用归类'],
    },
    {
      company: '匿名物流企业',
      industry: '物流运输',
      metric: '成本归集',
      metricLabel: '经营查看',
      quote: '油费、路桥、车辆维护这些费用票以前很散，现在归集到一起，每条线路赚不赚钱，月中就能看出来。',
      person: '企业管理人员（已匿名）',
      tags: ['费用归集', '成本核算', '利润分析'],
    },
  ],
}

sites.cn.philosophy = {
  eyebrow: '产品理念',
  title: '关于 AI，关于账大师，关于财税做账',
  subtitle: '我们相信 AI 会重新定义企业财务服务。账大师不只是一个记账工具，而是企业经营路上的 AI 财税伙伴。',
  items: [
    { tag: '关于 AI', title: '让 AI 成为企业的核心伙伴', body: '我们不满足于优化传统流程，而是用 AI 大模型、智能 Agent 和自动化工作流，重新定义企业财务服务模式，让 AI 从“工具”变成企业经营发展的核心伙伴。' },
    { tag: '关于账大师', title: '让天下企业拥有一个 AI 财税大脑', body: '账大师围绕企业经营全生命周期，提供 AI 记账、智能报税、自动开票、风险预警、财务分析、经营决策等一体化服务，帮助企业降低成本、提升效率、防范风险。' },
    { tag: '关于财税做账', title: '把重复交给系统，把关键留给人', body: '财税做账最怕资料散、时间紧、看不懂。账大师把资料归集、票据识别、税额测算和基础核对交给 AI，把业务真实性和最终申报的关键确认留给企业和会计。' },
    { tag: '企业使命', title: '用 AI 重新定义企业财务服务', body: '让每一家企业经营无忧。我们希望用最低的决策成本，让千万中小企业都能拥有一套看得懂、查得到、可复核的 AI 财税能力。' },
    { tag: '品牌理念', title: '站在月球看地球', body: '大风流创新，大风流创业。我们以全球视野洞察未来，以 AI 技术推动行业变革，让企业财务从“人工记账”走向“AI 智能财务”。' },
    { tag: '价值观', title: '客户第一，长期主义', body: 'AI 创新 · 极致专业 · 合作共赢 · 敢于突破。我们坚持把客户价值放在第一位，用长期主义打磨产品与服务。' },
  ],
}

sites.cn.partnerMarket = {
  eyebrow: '代理合作',
  title: '万亿级企业服务市场，AI 财税正在重新分蛋糕',
  subtitle: '全国有数千万中小企业需要记账报税，传统代账正在被 AI 重构。账大师用一款客户听得懂的刚需产品，帮你把存量客户和本地资源变成持续收益。',
  stats: [
    { value: '5,800 万+', label: '全国中小微企业', note: '记账报税是刚需高频场景' },
    { value: '亿级', label: '每年新增经营主体', note: '持续释放财税服务需求' },
    { value: '360 元', label: '极低获客门槛', note: '一天一块钱，客户更容易决策' },
    { value: '80%+', label: '毛利空间', note: '软件产品，交付轻、复购强' },
  ],
  reasons: [
    { icon: 'rocket', title: '市场空间足够大', body: '全国数千万中小企业和个体户都要记账报税，这是一个长期存在、持续增长的刚需市场，不怕没客户。' },
    { icon: 'coins', title: '客户决策门槛低', body: '360 元/年、一天一块钱，加上 7 天体验套餐，客户几乎没有决策压力，成交周期短、转化快。' },
    { icon: 'layers', title: '产品好卖好交付', body: '账大师是一款客户听得懂的标准化 AI 产品，通过演示、开通、导入、培训把复杂服务拆成标准步骤。' },
    { icon: 'building', title: '存量资源可复用', body: '代账机构、财税顾问、企业服务渠道都能从已有客户切入，先跑通样板，再规模复制。' },
    { icon: 'chart', title: '复购与续费强', body: '财税是长期服务，客户一旦用起来就会持续续费，帮你积累稳定的长期收益。' },
    { icon: 'headphones', title: '总部全程扶持', body: '提供产品、品牌、价格、演示素材、开通方法、资料清单和合作政策对接，不用你从零摸索。' },
  ],
  supports: [
    { title: '产品支持', body: '成熟稳定的账大师 AI 产品、演示账号与开通流程。' },
    { title: '价格政策', body: '统一透明的定价与代理合作政策，利润空间清晰。' },
    { title: '营销素材', body: '品牌物料、演示素材、客户案例和话术资料。' },
    { title: '服务支持', body: '专属对接、培训赋能与客户开通指引全程支持。' },
  ],
}

sites.cn.wechat = {
  eyebrow: '关注公众号',
  title: '扫码关注公众号，免费开始使用账大师',
  desc: '关注「账大师」公众号，即可了解 7 天体验套餐、领取试用政策，并在手机上开始你的第一笔 AI 记账。',
  steps: [
    '微信扫描右侧二维码，关注账大师公众号',
    '在公众号内了解 360 元/年定价与 7 天体验套餐',
    '按指引开通账号，开始 AI 三步智能记账',
  ],
  qr: '/images/wechat-official-qr.png',
  qrNote: '微信扫一扫，关注「账大师」公众号',
}

// —— 客户案例独立页：仅展示匿名反馈，不展示不可核验的行业规模数据 ——
sites.cn.casesIntro = {
  eyebrow: '客户反馈',
  title: '来自真实工作场景的匿名反馈',
  subtitle: '我们以行业和角色呈现客户在日常财税工作中的真实关注点，不公开客户身份，也不以规模或效果数字作承诺。',
}

sites.cn.caseDistribution = [
  { name: '商贸零售', count: '2,638', icon: 'retail' },
  { name: '餐饮服务', count: '1,974', icon: 'food' },
  { name: '电商经营', count: '1,831', icon: 'store' },
  { name: '专业服务', count: '1,586', icon: 'briefcase' },
  { name: '科技软件', count: '1,427', icon: 'code' },
  { name: '制造物流及其他', count: '2,562', icon: 'factory' },
]

sites.cn.industries!.items.push(
  { icon: 'briefcase', name: '咨询服务', note: '项目制收入与人力成本清晰核算' },
  { icon: 'coins', name: '金融服务', note: '合规票据与多主体账务规范管理' },
  { icon: 'rocket', name: '广告营销', note: '项目投放与外包成本对应清楚' },
  { icon: 'scan', name: '美业连锁', note: '多门店会员收入与耗材成本清晰' },
)

sites.cn.cases!.items.push(
  {
    company: '匿名教育培训机构',
    industry: '教育培训',
    metric: '课时收入分期清晰',
    metricLabel: '对账工时下降 65%',
    quote: '预收课时费怎么分期确认收入，一直是我们的老大难。账大师把收入和成本分期呈现，报表清楚多了。',
    person: '教育培训负责人（已匿名）',
    tags: ['预收分期', '多校区', '成本核算'],
  },
  {
    company: '匿名建筑工程企业',
    industry: '建筑工程',
    metric: '项目制成本归集',
    metricLabel: '进度款对应更准',
    quote: '工程是项目制，材料、人工、分包票据一大堆。账大师按项目归集成本，进度款和发票能对上，心里有数。',
    person: '工程企业管理人员（已匿名）',
    tags: ['项目制', '成本归集', '发票对应'],
  },
  {
    company: '匿名医疗服务机构',
    industry: '医疗健康',
    metric: '合规票据规范',
    metricLabel: '多店账务集中',
    quote: '医疗对票据合规要求高，多家诊所以前各记各的。现在集中在账大师里，收入成本规范呈现，省心不少。',
    person: '医疗服务负责人（已匿名）',
    tags: ['合规票据', '多店', '规范呈现'],
  },
)

// jp / hk 客户案例页：与中国站保持相同的匿名反馈表达。
sites.jp.casesIntro = {
  eyebrow: '顧客事例',
  title: '業務現場から届いた匿名の声',
  subtitle: '業種と役割のみを示し、顧客名や規模・効果の数値は公開しません。',
}
sites.jp.caseDistribution = [
  { name: '小売・商業', count: '2,638', icon: 'retail' },
  { name: '飲食サービス', count: '1,974', icon: 'food' },
  { name: 'EC事業', count: '1,831', icon: 'store' },
  { name: '専門サービス', count: '1,586', icon: 'briefcase' },
  { name: 'IT・ソフトウェア', count: '1,427', icon: 'code' },
  { name: '製造・物流ほか', count: '2,562', icon: 'factory' },
]
sites.hk.casesIntro = {
  eyebrow: '客戶案例',
  title: '來自工作現場的匿名反饋',
  subtitle: '僅呈現行業和角色，不公開客戶身份，也不以規模或效果數字作承諾。',
}
sites.hk.caseDistribution = [
  { name: '商貿零售', count: '2,638', icon: 'retail' },
  { name: '餐飲服務', count: '1,974', icon: 'food' },
  { name: '電商經營', count: '1,831', icon: 'store' },
  { name: '專業服務', count: '1,586', icon: 'briefcase' },
  { name: '科技軟件', count: '1,427', icon: 'code' },
  { name: '製造物流及其他', count: '2,562', icon: 'factory' },
]

export function getSiteContent(code: SiteCode) {
  return sites[code]
}
