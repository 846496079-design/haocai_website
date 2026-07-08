'use client'

import {
  AlertTriangleIcon,
  BookTextIcon,
  CalculatorIcon,
  FilePlus2Icon,
  FileSpreadsheetIcon,
  FileStackIcon,
  FileWarningIcon,
  LandmarkIcon,
  PercentIcon,
  ReceiptTextIcon,
  RefreshCwIcon,
  ScrollTextIcon,
  SendIcon,
  UploadIcon,
  UsersIcon,
  WalletIcon,
} from 'lucide-react'

import { AIQuickQuestion } from '@/components/tax/ai-quick-question'
import { AIReasonCard } from '@/components/tax/ai-reason-card'
import { AIReferenceCard } from '@/components/tax/ai-reference-card'
import { AITaxChat } from '@/components/tax/ai-tax-chat'
import { BankFlowTable } from '@/components/tax/bank-flow-table'
import { BankMatchCard } from '@/components/tax/bank-match-card'
import { CompanyCard } from '@/components/tax/company-card'
import { DeclarationCard } from '@/components/tax/declaration-card'
import { DeclarationSummaryCard } from '@/components/tax/declaration-summary-card'
import { EmployeeDetailDrawer } from '@/components/tax/employee-detail-drawer'
import { InvoiceOCRPanel } from '@/components/tax/invoice-ocr-panel'
import { InvoiceTable } from '@/components/tax/invoice-table'
import { SalaryTable } from '@/components/tax/salary-table'
import { TaxActionPanel } from '@/components/tax/tax-action-panel'
import { TaxAISuggestionCard } from '@/components/tax/tax-ai-suggestion-card'
import { TaxAuditLog } from '@/components/tax/tax-audit-log'
import { TaxDetailDrawer } from '@/components/tax/tax-detail-drawer'
import { TaxEmptyState } from '@/components/tax/tax-empty-state'
import { TaxFilterBar } from '@/components/tax/tax-filter-bar'
import { TaxImportWizard } from '@/components/tax/tax-import-wizard'
import { TaxOverviewPanel } from '@/components/tax/tax-overview-panel'
import { TaxPreviewPanel } from '@/components/tax/tax-preview-panel'
import { TaxProgressBanner } from '@/components/tax/tax-progress-banner'
import { TaxSidebar } from '@/components/tax/tax-sidebar'
import { TaxStatCard } from '@/components/tax/tax-stat-card'
import { TaxStatisticGroup } from '@/components/tax/tax-statistic-group'
import {
  TaxStepFlow,
  type TaxStep,
} from '@/components/tax/tax-step-flow'
import { TaxStatusBadge } from '@/components/tax/tax-status-badge'
import { TaxTable } from '@/components/tax/tax-table'
import { TaxTimeline } from '@/components/tax/tax-timeline'
import { TaxTodoList } from '@/components/tax/tax-todo-list'
import { TaxToolbar } from '@/components/tax/tax-toolbar'
import { TaxUploadDialog } from '@/components/tax/tax-upload-dialog'
import { VoucherPreview } from '@/components/tax/voucher-preview'
import { Button } from '@/components/ui/button'
import {
  Section,
  SectionHeader,
  ShowcaseBlock,
} from '@/components/workbench/showcase'

const STEPS: TaxStep[] = [
  {
    title: '票据采集',
    description: '自动归集发票、银行流水与薪酬数据',
    icon: ReceiptTextIcon,
    state: 'done',
  },
  {
    title: 'AI 做账',
    description: '智能匹配科目，一键生成记账凭证',
    icon: FileStackIcon,
    state: 'active',
  },
  {
    title: '纳税申报',
    description: '生成申报表，登录税局自动报税',
    icon: LandmarkIcon,
    state: 'todo',
  },
]

const INVOICE_COLUMNS = [
  { key: 'no', header: '发票号码' },
  { key: 'company', header: '往来单位' },
  { key: 'type', header: '类型' },
  { key: 'amount', header: '金额', align: 'right' as const, numeric: true },
  { key: 'tax', header: '税额', align: 'right' as const, numeric: true },
]

const INVOICE_ROWS = [
  {
    cells: {
      no: 'INV-202606-001',
      company: '北京星河科技有限公司',
      type: '销项',
      amount: '¥86,000',
      tax: '¥5,160',
    },
    status: { tone: 'success' as const, label: '已入账' },
  },
  {
    cells: {
      no: 'INV-202606-014',
      company: '上海云帆信息技术有限公司',
      type: '进项',
      amount: '¥42,600',
      tax: '¥2,556',
    },
    status: { tone: 'warning' as const, label: '待认证' },
  },
  {
    cells: {
      no: 'INV-202606-039',
      company: '深圳智造供应链有限公司',
      type: '进项',
      amount: '¥78,000',
      tax: '¥10,140',
    },
    status: { tone: 'success' as const, label: '已入账' },
  },
  {
    cells: {
      no: 'INV-202606-077',
      company: '杭州旅宿酒店有限公司',
      type: '费用',
      amount: '¥6,200',
      tax: '¥372',
    },
    status: { tone: 'error' as const, label: '异常' },
  },
]

export function TaxGallery() {
  return (
    <Section id="tax-system">
      <SectionHeader
        index="09"
        title="财税工作台组件"
        description="面向「好财账大师 · AI 三步做账报税」的企业级财税组件，全部复用现有设计令牌，未新增任何颜色。"
      />

      <ShowcaseBlock
        id="tax-step-flow"
        title="TaxStepFlow · 三步报税流程"
        caption="采集 → 做账 → 申报，含已完成 / 进行中 / 待办三种状态。"
      >
        <TaxStepFlow steps={STEPS} />
      </ShowcaseBlock>

      <ShowcaseBlock
        id="tax-stat-card"
        title="TaxStatCard · 财税指标卡"
        caption="关键税务与经营指标，含趋势与状态色图标。"
      >
        <div className="flex flex-wrap gap-4">
          <TaxStatCard
            label="本月应纳税额"
            value="¥18.7"
            unit="万"
            icon={LandmarkIcon}
            tone="processing"
            trend={{ value: '12.4%', direction: 'up', positive: false }}
            hint="较上月"
          />
          <TaxStatCard
            label="待认证进项"
            value="9"
            unit="张"
            icon={ReceiptTextIcon}
            tone="warning"
            hint="需在本月内认证"
          />
          <TaxStatCard
            label="已入账凭证"
            value="146"
            unit="笔"
            icon={FileStackIcon}
            tone="success"
            trend={{ value: '8.1%', direction: 'up' }}
            hint="本期"
          />
          <TaxStatCard
            label="异常流水"
            value="3"
            unit="笔"
            icon={WalletIcon}
            tone="error"
            hint="待人工复核"
          />
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock
        id="declaration-card"
        title="DeclarationCard · 申报卡片"
        caption="按税种聚合的申报入口，含税期、应纳税额、截止日与申报状态。"
      >
        <div className="flex flex-wrap gap-4">
          <DeclarationCard
            name="增值税及附加"
            abbr="VAT"
            icon={PercentIcon}
            period="2026-06"
            deadline="07-15"
            amount="¥12,840.00"
            statusTone="warning"
            statusLabel="待提交"
          />
          <DeclarationCard
            name="企业所得税"
            abbr="CIT"
            icon={ScrollTextIcon}
            period="2026 Q2"
            deadline="07-15"
            amount="¥48,200.00"
            statusTone="processing"
            statusLabel="计算中"
          />
          <DeclarationCard
            name="个人所得税"
            abbr="PIT"
            icon={UsersIcon}
            period="2026-06"
            deadline="07-15"
            amount="¥6,100.00"
            statusTone="success"
            statusLabel="已申报"
          />
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock
        id="company-card"
        title="CompanyCard · 企业切换卡"
        caption="多企业代账场景，含纳税人类型、税号与报税状态。"
      >
        <div className="flex flex-wrap gap-4">
          <CompanyCard
            name="北京好财科技有限公司"
            taxNo="91110108MA01HC8P2X"
            taxpayerType="一般纳税人"
            statusTone="warning"
            statusLabel="待提交"
            active
          />
          <CompanyCard
            name="上海好财咨询有限公司"
            taxNo="91310115MA1H9A6K7Q"
            taxpayerType="小规模"
            statusTone="processing"
            statusLabel="待创建批次"
          />
          <CompanyCard
            name="深圳好财数字科技有限公司"
            taxNo="91440300MA5F8K2N6R"
            taxpayerType="一般纳税人"
            statusTone="success"
            statusLabel="已申报"
          />
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock
        id="tax-table"
        title="TaxTable · 财税数据表"
        caption="发票 / 流水 / 薪酬通用数据表，末列为状态徽标。"
      >
        <TaxTable columns={INVOICE_COLUMNS} rows={INVOICE_ROWS} statusHeader="入账状态" />
      </ShowcaseBlock>

      <ShowcaseBlock
        id="tax-status-badge"
        title="TaxStatusBadge · 状态徽标"
        caption="基于现有状态令牌的财税状态标识，覆盖 5 种语义。"
      >
        <div className="flex flex-wrap items-center gap-3">
          <TaxStatusBadge tone="success">已申报</TaxStatusBadge>
          <TaxStatusBadge tone="processing">申报中</TaxStatusBadge>
          <TaxStatusBadge tone="warning">待提交</TaxStatusBadge>
          <TaxStatusBadge tone="error">申报异常</TaxStatusBadge>
          <TaxStatusBadge tone="neutral">未开始</TaxStatusBadge>
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock
        id="tax-sidebar"
        title="TaxSidebar · 财税侧边导航"
        caption="白底浅色侧边栏，支持一级点击高亮与二级展开/收起。点击「三步报税」可展开员工工资 / 发票管理 / 银行流水。"
      >
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="flex h-[620px]">
            <TaxSidebar />
            <div className="flex flex-1 items-center justify-center bg-background p-6 text-sm text-muted-foreground">
              主内容区域
            </div>
          </div>
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock
        id="tax-overview-panel"
        title="TaxOverviewPanel · 财税总览面板"
        caption="展示申报期、企业状态、整体进度、关键指标与 AI 建议。"
      >
        <TaxOverviewPanel
          period="2026 年 06 月"
          company="北京好财科技有限公司"
          statusTone="processing"
          statusLabel="申报中"
          progress={68}
          metrics={[
            { label: '应缴税额', value: '¥6.1', unit: '万', icon: LandmarkIcon },
            { label: '待认证进项', value: '9', unit: '张', icon: ReceiptTextIcon },
            { label: '待匹配流水', value: '4', unit: '笔', icon: WalletIcon },
            { label: '异常发票', value: '1', unit: '张', icon: AlertTriangleIcon },
          ]}
          suggestion="检测到 1 张费用票金额与银行流水不一致，且本期有 4 笔流水未匹配，建议在申报前优先核对，以降低申报风险。"
        />
      </ShowcaseBlock>

      <ShowcaseBlock
        id="tax-todo-list"
        title="TaxTodoList · 待处理事项"
        caption="异常发票、未匹配流水、无票支出、待确认工资等任务入口。"
      >
        <div className="max-w-xl">
          <TaxTodoList
            items={[
              {
                title: '异常发票待处理',
                description: '金额与流水不一致，需人工复核',
                count: 1,
                icon: AlertTriangleIcon,
                tone: 'error',
              },
              {
                title: '未匹配银行流水',
                description: '尚未关联发票或费用凭证',
                count: 4,
                icon: WalletIcon,
                tone: 'warning',
              },
              {
                title: '无票支出待登记',
                description: '需确认税前扣除限额',
                count: 2,
                icon: FileWarningIcon,
                tone: 'warning',
              },
              {
                title: '待确认工资条',
                description: '员工工资需主管确认后计税',
                count: 6,
                icon: UsersIcon,
                tone: 'processing',
              },
            ]}
          />
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock
        id="tax-ai-suggestion-card"
        title="TaxAISuggestionCard · AI 核对建议"
        caption="AI 识别的风险、建议与下一步操作，附置信度标签。"
      >
        <div className="max-w-xl">
          <TaxAISuggestionCard
            confidence="高"
            confidenceTone="success"
            suggestions={[
              {
                category: '风险',
                categoryTone: 'error',
                title: '费用票金额异常',
                detail:
                  '发票 INV-202606-077（¥6,200）与对应银行流水（¥5,800）金额不一致，可能存在折扣或录入错误。',
                action: '去处理异常发票',
              },
              {
                category: '建议',
                categoryTone: 'processing',
                title: '尽快认证进项发票',
                detail:
                  '本期有 9 张进项发票待认证，认证后可抵扣进项税额约 ¥3,200，建议在征期内完成。',
                action: '去认证发票',
              },
            ]}
          />
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock
        id="salary-table"
        title="SalaryTable · 工资明细表"
        caption="员工工资、社保、公积金、预计个税与状态，支持行内编辑。"
      >
        <SalaryTable
          rows={[
            {
              name: '王思远',
              idNo: '1101**********0018',
              phone: '138 0013 8000',
              gross: '¥24,000',
              social: '¥1,920',
              fund: '¥2,880',
              tax: '¥1,243',
              status: { tone: 'success', label: '已确认' },
            },
            {
              name: '李文静',
              idNo: '3101**********2046',
              phone: '139 0021 6677',
              gross: '¥16,500',
              social: '¥1,320',
              fund: '¥1,980',
              tax: '¥528',
              status: { tone: 'warning', label: '待确认' },
            },
            {
              name: '陈嘉豪',
              idNo: '4403**********6135',
              phone: '137 8890 1234',
              gross: '¥12,800',
              social: '¥1,024',
              fund: '¥1,536',
              tax: '¥204',
              status: { tone: 'processing', label: '计算中' },
            },
          ]}
        />
      </ShowcaseBlock>

      <ShowcaseBlock
        id="employee-detail-drawer"
        title="EmployeeDetailDrawer · 员工详情抽屉"
        caption="右侧抽屉表单，分组维护基础、证件、入职与岗位信息。"
      >
        <EmployeeDetailDrawer
          trigger={<Button variant="outline">编辑员工信息</Button>}
        />
      </ShowcaseBlock>

      <ShowcaseBlock
        id="invoice-table"
        title="InvoiceTable · 发票数据表"
        caption="含筛选标签，展示往来方、类型、金额、税额、认证与入账状态。"
      >
        <InvoiceTable
          rows={[
            {
              no: 'INV-202606-001',
              date: '2026-06-03',
              counterparty: '北京星河科技有限公司',
              type: '销项',
              amount: '¥86,000',
              tax: '¥5,160',
              certify: { tone: 'success', label: '已认证' },
              booking: { tone: 'success', label: '已入账' },
            },
            {
              no: 'INV-202606-014',
              date: '2026-06-09',
              counterparty: '上海云帆信息技术有限公司',
              type: '进项',
              amount: '¥42,600',
              tax: '¥2,556',
              certify: { tone: 'warning', label: '待认证' },
              booking: { tone: 'warning', label: '待入账' },
            },
            {
              no: 'INV-202606-077',
              date: '2026-06-21',
              counterparty: '杭州旅宿酒店有限公司',
              type: '费用',
              amount: '¥6,200',
              tax: '¥372',
              certify: { tone: 'error', label: '异常' },
              booking: { tone: 'error', label: '异常' },
            },
          ]}
        />
      </ShowcaseBlock>

      <ShowcaseBlock
        id="invoice-ocr-panel"
        title="InvoiceOCRPanel · 发票识别面板"
        caption="左侧发票影像，右侧为 AI OCR 识别字段与整体置信度。"
      >
        <InvoiceOCRPanel
          fileName="电子发票_202606_001.pdf"
          confidence="98.6%"
          fields={[
            { label: '发票代码', value: '011002200211' },
            { label: '发票号码', value: 'INV-202606-001' },
            { label: '开票日期', value: '2026-06-03' },
            { label: '购买方', value: '北京好财科技有限公司' },
            { label: '金额', value: '¥86,000.00' },
            { label: '税额', value: '¥5,160.00' },
          ]}
        />
      </ShowcaseBlock>

      <ShowcaseBlock
        id="bank-flow-table"
        title="BankFlowTable · 银行流水表"
        caption="交易日期、账户、对方户名、收支、摘要、匹配发票与状态。"
      >
        <BankFlowTable
          rows={[
            {
              date: '2026-06-12',
              account: '工行 ****6688',
              counterparty: '北京星河科技有限公司',
              income: '¥86,000',
              summary: '货款',
              matched: 'INV-202606-001',
              status: { tone: 'success', label: '已匹配' },
            },
            {
              date: '2026-06-18',
              account: '工行 ****6688',
              counterparty: '杭州旅宿酒店有限公司',
              expense: '¥5,800',
              summary: '差旅费',
              matched: '—',
              status: { tone: 'warning', label: '待匹配' },
            },
            {
              date: '2026-06-25',
              account: '招行 ****2031',
              counterparty: '员工工资代发',
              expense: '¥53,300',
              summary: '工资',
              matched: '工资表 06',
              status: { tone: 'success', label: '已匹配' },
            },
          ]}
        />
      </ShowcaseBlock>

      <ShowcaseBlock
        id="bank-match-card"
        title="BankMatchCard · 流水匹配卡"
        caption="展示银行流水与发票 / 工资 / 费用之间的匹配关系与置信度。"
      >
        <div className="flex flex-wrap gap-4">
          <BankMatchCard
            flow={{
              label: '银行流水',
              title: '06-12 收款 · 工行 ****6688',
              amount: '¥86,000',
              icon: WalletIcon,
            }}
            target={{
              label: '销项发票',
              title: 'INV-202606-001',
              amount: '¥86,000',
              icon: ReceiptTextIcon,
            }}
            matchTone="success"
            matchLabel="已匹配"
            confidence="99%"
          />
          <BankMatchCard
            flow={{
              label: '银行流水',
              title: '06-18 付款 · 工行 ****6688',
              amount: '¥5,800',
              icon: WalletIcon,
            }}
            target={{
              label: '费用发票',
              title: 'INV-202606-077',
              amount: '¥6,200',
              icon: ReceiptTextIcon,
            }}
            matchTone="warning"
            matchLabel="金额不符"
            confidence="62%"
          />
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock
        id="declaration-summary-card"
        title="DeclarationSummaryCard · 申报汇总卡"
        caption="增值税、企业所得税、个税结果汇总与一键申报操作。"
      >
        <div className="max-w-xl">
          <DeclarationSummaryCard
            period="2026 年 06 月"
            lines={[
              {
                name: '增值税及附加',
                abbr: 'VAT',
                amount: '¥6,120',
                status: { tone: 'warning', label: '待申报' },
              },
              {
                name: '企业所得税',
                abbr: 'CIT',
                amount: '¥0',
                status: { tone: 'neutral', label: '预缴期' },
              },
              {
                name: '个人所得税',
                abbr: 'PIT',
                amount: '¥1,975',
                status: { tone: 'processing', label: '计算中' },
              },
            ]}
            total="¥8,095"
          />
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock
        id="voucher-preview"
        title="VoucherPreview · 凭证预览"
        caption="自动生成的记账凭证，含借贷分录与合计校验。"
      >
        <div className="max-w-xl">
          <VoucherPreview
            voucherNo="记-2026-06-018"
            date="2026-06-12"
            summary="收到北京星河科技货款"
            entries={[
              { account: '银行存款', debit: '¥86,000.00' },
              { account: '主营业务收入', credit: '¥80,840.00' },
              { account: '应交税费—应交增值税（销项）', credit: '¥5,160.00' },
            ]}
            totalDebit="¥86,000.00"
            totalCredit="¥86,000.00"
            statusTone="success"
            statusLabel="已生成"
          />
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock
        id="ai-tax-chat"
        title="AITaxChat · AI 财税对话"
        caption="财税问答、申报解释与风险分析，复用 ChatBubble，含思考过程、数据引用与操作建议。"
      >
        <div className="max-w-2xl">
          <AITaxChat />
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock
        id="tax-toolbar"
        title="TaxToolbar · 页面工具栏"
        caption="页面级标题、描述与操作按钮，统一各业务页头部样式。"
      >
        <TaxToolbar
          title="发票管理"
          description="集中管理本期销项与进项发票，支持上传、认证与入账。"
          actions={
            <>
              <Button variant="outline" size="sm">
                <RefreshCwIcon className="size-4" />
                刷新
              </Button>
              <Button size="sm">
                <UploadIcon className="size-4" />
                上传发票
              </Button>
            </>
          }
        />
      </ShowcaseBlock>

      <ShowcaseBlock
        id="tax-filter-bar"
        title="TaxFilterBar · 筛选栏"
        caption="搜索框、下拉筛选与可点选筛选标签的组合。"
      >
        <TaxFilterBar
          searchPlaceholder="搜索发票号 / 往来方…"
          selects={[
            {
              id: 'fb-type',
              placeholder: '发票类型',
              options: [
                { value: 'sale', label: '销项' },
                { value: 'input', label: '进项' },
                { value: 'expense', label: '费用' },
              ],
            },
            {
              id: 'fb-month',
              placeholder: '所属月份',
              options: [
                { value: '06', label: '2026-06' },
                { value: '05', label: '2026-05' },
              ],
            },
          ]}
          chips={[
            { value: 'all', label: '全部' },
            { value: 'pending', label: '待认证' },
            { value: 'booked', label: '已入账' },
            { value: 'error', label: '异常' },
          ]}
        />
      </ShowcaseBlock>

      <ShowcaseBlock
        id="tax-empty-state"
        title="TaxEmptyState · 空状态"
        caption="复用 Empty 组件，用于无数据 / 无结果场景，可附操作。"
      >
        <TaxEmptyState
          icon={ReceiptTextIcon}
          title="本期暂无发票"
          description="尚未采集任何发票数据，可上传文件或连接开票系统自动同步。"
          actions={
            <>
              <Button size="sm" variant="outline">
                连接开票系统
              </Button>
              <Button size="sm">上传发票</Button>
            </>
          }
        />
      </ShowcaseBlock>

      <ShowcaseBlock
        id="tax-upload-dialog"
        title="TaxUploadDialog · 上传弹窗"
        caption="拖拽上传区、格式与大小提示，以及已就绪文件列表。"
      >
        <TaxUploadDialog
          trigger={
            <Button>
              <UploadIcon className="size-4" />
              上传发票 / 流水
            </Button>
          }
          sampleFiles={['电子发票_202606_001.pdf', '招行流水_202606.xlsx']}
        />
      </ShowcaseBlock>

      <ShowcaseBlock
        id="tax-import-wizard"
        title="TaxImportWizard · 导入向导"
        caption="多步骤数据导入流程，含步骤指示器与上一步 / 下一步切换。"
      >
        <TaxImportWizard
          steps={[
            {
              title: '上传文件',
              description: '上传银行流水或发票文件，支持 Excel 与 PDF。',
              content: (
                <p className="text-sm text-muted-foreground">
                  已选择「招行流水_202606.xlsx」，共 328 条记录待导入。
                </p>
              ),
            },
            {
              title: '字段映射',
              description: '确认文件列与系统字段的对应关系。',
              content: (
                <p className="text-sm text-muted-foreground">
                  已自动匹配「交易日期 / 对方户名 / 收入 / 支出」共 4 个字段。
                </p>
              ),
            },
            {
              title: '预览校验',
              description: '预览导入结果并处理异常行。',
              content: (
                <p className="text-sm text-muted-foreground">
                  324 条校验通过，4 条金额异常需人工确认。
                </p>
              ),
            },
            {
              title: '完成导入',
              description: '确认无误后写入本期流水数据。',
              content: (
                <p className="text-sm text-muted-foreground">
                  点击「完成导入」后将生成 324 条银行流水记录。
                </p>
              ),
            },
          ]}
        />
      </ShowcaseBlock>

      <ShowcaseBlock
        id="tax-statistic-group"
        title="TaxStatisticGroup · 指标卡组"
        caption="复用 TaxStatCard，按列数自适应排布的关键指标看板。"
      >
        <TaxStatisticGroup
          items={[
            {
              label: '应缴税额',
              value: '¥42,610',
              icon: LandmarkIcon,
              tone: 'processing',
              trend: { value: '8.6%', direction: 'up', positive: false },
              hint: '较上期',
            },
            {
              label: '销项发票',
              value: '46',
              unit: '张',
              icon: ReceiptTextIcon,
              tone: 'success',
            },
            {
              label: '进项发票',
              value: '58',
              unit: '张',
              icon: FilePlus2Icon,
              tone: 'neutral',
            },
            {
              label: '异常票据',
              value: '3',
              unit: '张',
              icon: AlertTriangleIcon,
              tone: 'error',
            },
          ]}
        />
      </ShowcaseBlock>

      <ShowcaseBlock
        id="tax-progress-banner"
        title="TaxProgressBanner · 进度横幅"
        caption="带进度条与操作按钮的横幅，用于展示本期整体完成度。"
      >
        <TaxProgressBanner
          title="本期报税进度"
          description="员工工资、发票、银行流水完成后，可进入数据核对并生成申报数据。"
          value={72}
          tone="processing"
          actions={
            <Button size="sm">
              <CalculatorIcon className="size-4" />
              继续核对
            </Button>
          }
        />
      </ShowcaseBlock>

      <ShowcaseBlock
        id="tax-action-panel"
        title="TaxActionPanel · 操作面板"
        caption="主操作 + 次级操作列表，承载常用财税快捷入口。"
      >
        <div className="max-w-xl">
          <TaxActionPanel
            primaryLabel="开始三步报税"
            actions={[
              {
                title: '采集员工工资',
                description: '导入工资表并测算个税',
                icon: UsersIcon,
                tone: 'processing',
              },
              {
                title: '上传发票',
                description: '批量识别销项与进项发票',
                icon: ReceiptTextIcon,
                tone: 'success',
              },
              {
                title: '导入银行流水',
                description: '匹配发票与费用凭证',
                icon: WalletIcon,
                tone: 'neutral',
              },
              {
                title: '生成申报数据',
                description: '一键计算三大税种',
                icon: SendIcon,
                tone: 'warning',
              },
            ]}
          />
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock
        id="tax-detail-drawer"
        title="TaxDetailDrawer · 详情抽屉"
        caption="右侧只读详情抽屉，分组展示键值信息与状态徽标。"
      >
        <TaxDetailDrawer
          trigger={<Button variant="outline">查看发票详情</Button>}
          title="INV-202606-001"
          description="北京星河科技有限公司 · 销项发票"
          status={{ tone: 'success', label: '已入账' }}
          groups={[
            {
              legend: '基础信息',
              items: [
                { label: '发票代码', value: '011002200211' },
                { label: '发票号码', value: 'INV-202606-001' },
                { label: '开票日期', value: '2026-06-03' },
                { label: '发票类型', value: '增值税专用发票' },
              ],
            },
            {
              legend: '金额信息',
              items: [
                { label: '金额', value: '¥80,840.00' },
                { label: '税率', value: '6%' },
                { label: '税额', value: '¥5,160.00' },
                { label: '价税合计', value: '¥86,000.00' },
              ],
            },
          ]}
        />
      </ShowcaseBlock>

      <ShowcaseBlock
        id="tax-preview-panel"
        title="TaxPreviewPanel · 预览面板"
        caption="左侧文件影像预览与缩放，右侧识别字段，用于发票 / 凭证核对。"
      >
        <TaxPreviewPanel
          fileName="电子发票_202606_001.pdf"
          fields={[
            { label: '发票号码', value: 'INV-202606-001' },
            { label: '开票日期', value: '2026-06-03' },
            { label: '购买方', value: '北京好财科技有限公司' },
            { label: '金额', value: '¥80,840.00' },
            { label: '税额', value: '¥5,160.00' },
            { label: '价税合计', value: '¥86,000.00' },
          ]}
          footer={
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline">
                标记异常
              </Button>
              <Button size="sm">确认入账</Button>
            </div>
          }
        />
      </ShowcaseBlock>

      <ShowcaseBlock
        id="ai-reason-card"
        title="AIReasonCard · AI 推理过程"
        caption="编号化展示 AI 的分步推理过程与最终结论，附置信度。"
      >
        <div className="max-w-xl">
          <AIReasonCard
            confidence="高"
            confidenceTone="success"
            steps={[
              {
                title: '识别收款流水',
                detail:
                  '检测到 06-12 工行账户收款 ¥86,000，摘要为「货款」。',
              },
              {
                title: '匹配销项发票',
                detail:
                  '与发票 INV-202606-001（¥86,000）金额、往来方完全一致。',
              },
              {
                title: '校验税率与科目',
                detail:
                  '适用 6% 现代服务业税率，建议计入「主营业务收入」。',
              },
            ]}
            conclusion="该笔流水可与 INV-202606-001 自动匹配并生成记账凭证，无需人工干预。"
          />
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock
        id="ai-reference-card"
        title="AIReferenceCard · 引用依据"
        caption="展示 AI 结论所依据的政策、票据与流水等来源。"
      >
        <div className="max-w-xl">
          <AIReferenceCard
            references={[
              {
                type: '政策',
                title: '增值税现代服务业税率适用规定',
                source: '财税〔2016〕36 号',
                icon: BookTextIcon,
              },
              {
                type: '票据',
                title: 'INV-202606-001 销项发票',
                source: '北京星河科技有限公司 · ¥86,000',
                icon: ReceiptTextIcon,
              },
              {
                type: '流水',
                title: '工行 ****6688 收款流水',
                source: '2026-06-12 · ¥86,000',
                icon: WalletIcon,
              },
            ]}
          />
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock
        id="ai-quick-question"
        title="AIQuickQuestion · 快捷提问"
        caption="预设常见财税问题标签，点击即可向 AI 助手提问。"
      >
        <AIQuickQuestion
          questions={[
            '本期增值税要交多少？',
            '有哪些异常票据需要处理？',
            '小规模和一般纳税人怎么选？',
            '研发费用可以加计扣除吗？',
            '社保基数如何调整？',
          ]}
        />
      </ShowcaseBlock>

      <ShowcaseBlock
        id="tax-timeline"
        title="TaxTimeline · 财税时间线"
        caption="带状态色节点的事件流，用于申报进度与流程追踪。"
      >
        <div className="max-w-lg">
          <TaxTimeline
            items={[
              {
                time: '2026-06-25 09:20',
                title: '生成增值税申报表',
                description: 'AI 已根据本期销项与进项数据生成申报表。',
                tone: 'success',
              },
              {
                time: '2026-06-24 16:40',
                title: '完成数据核对',
                description: '8 项核对通过，2 项已人工确认。',
                tone: 'success',
              },
              {
                time: '2026-06-23 14:10',
                title: '银行流水匹配中',
                description: '328 条流水中 4 条待匹配。',
                tone: 'processing',
              },
              {
                time: '2026-06-20 10:00',
                title: '待提交税务局',
                description: '真实申报通道暂未接入，本版用于流程展示。',
                tone: 'neutral',
              },
            ]}
          />
        </div>
      </ShowcaseBlock>

      <ShowcaseBlock
        id="tax-audit-log"
        title="TaxAuditLog · 操作日志"
        caption="操作人、动作、对象与时间的审计记录，附状态标签。"
      >
        <div className="max-w-xl">
          <TaxAuditLog
            entries={[
              {
                operator: '王会计',
                action: '确认了',
                target: '6 月员工工资',
                time: '2026-06-25 09:32',
                tag: { tone: 'success', label: '已确认' },
              },
              {
                operator: '李助理',
                action: '上传了',
                target: '招行流水_202606.xlsx',
                time: '2026-06-24 17:08',
                tag: { tone: 'processing', label: '导入中' },
              },
              {
                operator: 'AI 助手',
                action: '标记了',
                target: 'INV-202606-077 为异常',
                time: '2026-06-24 15:50',
                tag: { tone: 'error', label: '异常' },
              },
              {
                operator: '王会计',
                action: '生成了',
                target: '增值税申报表',
                time: '2026-06-23 11:20',
              },
            ]}
          />
        </div>
      </ShowcaseBlock>
    </Section>
  )
}
