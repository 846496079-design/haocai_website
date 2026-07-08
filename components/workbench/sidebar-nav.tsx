'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

export const NAV_GROUPS = [
  {
    label: '设计基础',
    items: [{ id: 'foundations', en: 'Foundations', zh: '色彩与字体' }],
  },
  {
    label: 'AI 产品组件',
    items: [
      { id: 'ai-prompt-input', en: 'AiPromptInput', zh: '智能输入框' },
      { id: 'workflow-node', en: 'WorkflowNode', zh: '工作流节点' },
      { id: 'model-switcher', en: 'ModelSwitcher', zh: '模型切换器' },
      { id: 'task-card', en: 'TaskCard', zh: '任务卡片' },
      { id: 'agent-chip', en: 'AgentChip', zh: '代理标签' },
      { id: 'employee-card', en: 'EmployeeCard', zh: '数字员工卡片' },
      { id: 'plugin-card', en: 'PluginCard', zh: '插件卡片' },
      { id: 'automation-builder', en: 'AutomationBuilder', zh: '自动化编排器' },
    ],
  },
  {
    label: 'AI 工作空间组件',
    items: [
      { id: 'topbar', en: 'Topbar', zh: '顶栏导航' },
      { id: 'metric-card', en: 'MetricCard', zh: '指标卡片' },
      { id: 'chat-bubble', en: 'ChatBubble', zh: '对话气泡' },
      { id: 'thinking-panel', en: 'ThinkingPanel', zh: '推理过程' },
      { id: 'file-card', en: 'FileCard', zh: '文件卡片' },
      { id: 'app-card', en: 'AppCard', zh: '应用卡片' },
      { id: 'automation-card', en: 'AutomationCard', zh: '自动化卡片' },
      {
        id: 'employee-profile-dialog',
        en: 'EmployeeProfileDialog',
        zh: '员工档案对话框',
      },
    ],
  },
  {
    label: '组件',
    items: [
      { id: 'accordion', en: 'Accordion', zh: '手风琴' },
      { id: 'alert', en: 'Alert', zh: '警告提示' },
      { id: 'alert-dialog', en: 'Alert Dialog', zh: '确认弹窗' },
      { id: 'aspect-ratio', en: 'Aspect Ratio', zh: '宽高比' },
      { id: 'avatar', en: 'Avatar', zh: '头像' },
      { id: 'badge', en: 'Badge', zh: '徽标' },
      { id: 'breadcrumb', en: 'Breadcrumb', zh: '面包屑' },
      { id: 'button', en: 'Button', zh: '按钮' },
      { id: 'button-group', en: 'Button Group', zh: '按钮组' },
      { id: 'calendar', en: 'Calendar', zh: '日历' },
      { id: 'card', en: 'Card', zh: '卡片' },
      { id: 'carousel', en: 'Carousel', zh: '走马灯' },
      { id: 'chart', en: 'Chart', zh: '图表' },
      { id: 'checkbox', en: 'Checkbox', zh: '复选框' },
      { id: 'collapsible', en: 'Collapsible', zh: '折叠面板' },
      { id: 'combobox', en: 'Combobox', zh: '组合选择框' },
      { id: 'command', en: 'Command', zh: '命令面板' },
    ],
  },
  {
    label: '浮层与导航',
    items: [
      { id: 'dialog', en: 'Dialog', zh: '对话框' },
      { id: 'sheet', en: 'Sheet', zh: '侧边面板' },
      { id: 'drawer', en: 'Drawer', zh: '抽屉' },
      { id: 'dropdown-menu', en: 'Dropdown Menu', zh: '下拉菜单' },
      { id: 'context-menu', en: 'Context Menu', zh: '右键菜单' },
      { id: 'menubar', en: 'Menubar', zh: '菜单栏' },
      { id: 'navigation-menu', en: 'Navigation Menu', zh: '导航菜单' },
      { id: 'popover', en: 'Popover · Hover · Tooltip', zh: '浮层提示' },
    ],
  },
  {
    label: '表单控件',
    items: [
      { id: 'input', en: 'Input · Textarea · Field', zh: '输入与字段' },
      { id: 'input-group', en: 'Input Group · OTP', zh: '输入组合' },
      { id: 'select', en: 'Select · Radio · Switch', zh: '选择与开关' },
      { id: 'slider', en: 'Slider · Toggle', zh: '滑块与切换' },
    ],
  },
  {
    label: '数据展示',
    items: [
      { id: 'table', en: 'Table', zh: '表格' },
      { id: 'data-table', en: 'Data Table', zh: '数据表格' },
      { id: 'progress', en: 'Progress · Skeleton', zh: '进度与占位' },
      { id: 'item', en: 'Item · Kbd', zh: '列表项与快捷键' },
      { id: 'empty', en: 'Empty · Separator', zh: '空状态与分隔' },
      { id: 'typography', en: 'Typography', zh: '排版' },
    ],
  },
  {
    label: '布局与反馈',
    items: [
      { id: 'tabs', en: 'Tabs', zh: '标签页' },
      { id: 'resizable', en: 'Resizable · Scroll', zh: '分栏与滚动' },
      { id: 'sidebar', en: 'Sidebar', zh: '侧边栏' },
      { id: 'date-picker', en: 'Date Picker · Direction', zh: '日期与方向' },
      { id: 'sonner', en: 'Sonner · Toast', zh: '通知' },
    ],
  },
  {
    label: '完整页面',
    items: [{ id: 'homepage-demo', en: 'Homepage', zh: '工作空间首页' }],
  },
  {
    label: '财税工作台组件',
    items: [
      { id: 'tax-step-flow', en: 'TaxStepFlow', zh: '三步报税流程' },
      { id: 'tax-stat-card', en: 'TaxStatCard', zh: '财税指标卡' },
      { id: 'declaration-card', en: 'DeclarationCard', zh: '申报卡片' },
      { id: 'company-card', en: 'CompanyCard', zh: '企业切换卡' },
      { id: 'tax-table', en: 'TaxTable', zh: '财税数据表' },
      { id: 'tax-status-badge', en: 'TaxStatusBadge', zh: '状态徽标' },
      { id: 'tax-sidebar', en: 'TaxSidebar', zh: '财税侧边导航' },
      { id: 'tax-overview-panel', en: 'TaxOverviewPanel', zh: '财税总览面板' },
      { id: 'tax-todo-list', en: 'TaxTodoList', zh: '待处理事项' },
      {
        id: 'tax-ai-suggestion-card',
        en: 'TaxAISuggestionCard',
        zh: 'AI 核对建议',
      },
      { id: 'salary-table', en: 'SalaryTable', zh: '工资明细表' },
      {
        id: 'employee-detail-drawer',
        en: 'EmployeeDetailDrawer',
        zh: '员工详情抽屉',
      },
      { id: 'invoice-table', en: 'InvoiceTable', zh: '发票数据表' },
      { id: 'invoice-ocr-panel', en: 'InvoiceOCRPanel', zh: '发票识别面板' },
      { id: 'bank-flow-table', en: 'BankFlowTable', zh: '银行流水表' },
      { id: 'bank-match-card', en: 'BankMatchCard', zh: '流水匹配卡' },
      {
        id: 'declaration-summary-card',
        en: 'DeclarationSummaryCard',
        zh: '申报汇总卡',
      },
      { id: 'voucher-preview', en: 'VoucherPreview', zh: '凭证预览' },
      { id: 'ai-tax-chat', en: 'AITaxChat', zh: 'AI 财税对话' },
      { id: 'tax-toolbar', en: 'TaxToolbar', zh: '页面工具栏' },
      { id: 'tax-filter-bar', en: 'TaxFilterBar', zh: '筛选栏' },
      { id: 'tax-empty-state', en: 'TaxEmptyState', zh: '空状态' },
      { id: 'tax-upload-dialog', en: 'TaxUploadDialog', zh: '上传弹窗' },
      { id: 'tax-import-wizard', en: 'TaxImportWizard', zh: '导入向导' },
      { id: 'tax-statistic-group', en: 'TaxStatisticGroup', zh: '指标卡组' },
      { id: 'tax-progress-banner', en: 'TaxProgressBanner', zh: '进度横幅' },
      { id: 'tax-action-panel', en: 'TaxActionPanel', zh: '操作面板' },
      { id: 'tax-detail-drawer', en: 'TaxDetailDrawer', zh: '详情抽屉' },
      { id: 'tax-preview-panel', en: 'TaxPreviewPanel', zh: '预览面板' },
      { id: 'ai-reason-card', en: 'AIReasonCard', zh: 'AI 推理过程' },
      { id: 'ai-reference-card', en: 'AIReferenceCard', zh: '引用依据' },
      { id: 'ai-quick-question', en: 'AIQuickQuestion', zh: '快捷提问' },
      { id: 'tax-timeline', en: 'TaxTimeline', zh: '财税时间线' },
      { id: 'tax-audit-log', en: 'TaxAuditLog', zh: '操作日志' },
    ],
  },
]

const ALL_IDS = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.id))

export function SidebarNav() {
  const [active, setActive] = useState<string>('foundations')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    )
    ALL_IDS.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <nav className="flex flex-col gap-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-1.5">
          <p className="px-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {group.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const isActive = active === item.id
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={cn(
                      'flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors',
                      isActive
                        ? 'bg-secondary font-medium text-secondary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <span>{item.en}</span>
                    <span className="text-xs text-text-tertiary">
                      {item.zh}
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
