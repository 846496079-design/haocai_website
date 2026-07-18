import { getLeadDatabase } from './store'
import {
  parseLeadQueryPlan,
  resolveLeadQueryPeriods,
  type LeadQueryGroup,
  type LeadQueryPlan,
  type ResolvedLeadQueryPeriod,
} from '@/lib/feishu/query-plan'

export type LeadAnalyticsRow = {
  dimensions: Partial<Record<LeadQueryGroup, string>>
  count: number
}

export type LeadAnalyticsPeriodResult = ResolvedLeadQueryPeriod & {
  total: number
  rows: LeadAnalyticsRow[]
}

export type LeadAnalyticsResult = {
  intent: LeadQueryPlan['intent']
  generatedAt: string
  periods: LeadAnalyticsPeriodResult[]
  comparison?: { current: number; baseline: number; difference: number; changeRate: number | null }
  peak?: { dimensions: Partial<Record<LeadQueryGroup, string>>; count: number } | null
  helpMessage?: string
}

const groupExpression: Record<LeadQueryGroup, string> = {
  KIND: 'kind',
  STATUS: 'status',
  DAY: "strftime('%Y-%m-%d', datetime(created_at, '+8 hours'))",
  WEEK: "date(datetime(created_at, '+8 hours'), printf('-%d days', (CAST(strftime('%w', datetime(created_at, '+8 hours')) AS INTEGER) + 6) % 7))",
}

const groupLabel: Record<string, string> = {
  TRIAL: '用户线索',
  PARTNER: '代理商线索',
  PENDING: '待发送',
  DELIVERED: '已送达',
  PAUSED: '已暂停',
}

function placeholders(count: number) {
  return Array.from({ length: count }, () => '?').join(', ')
}

function queryPeriod(plan: LeadQueryPlan, period: ResolvedLeadQueryPeriod, now: Date): LeadAnalyticsPeriodResult {
  const conditions = ['created_at >= ?', 'created_at < ?']
  const parameters: Array<string | number> = [period.startAt, period.endAt]

  if (plan.kinds.length) {
    conditions.push(`kind IN (${placeholders(plan.kinds.length)})`)
    parameters.push(...plan.kinds)
  }
  if (plan.statuses.length) {
    conditions.push(`status IN (${placeholders(plan.statuses.length)})`)
    parameters.push(...plan.statuses)
  }
  if (plan.overdueOnly) {
    conditions.push("status <> 'DELIVERED'", 'created_at <= ?')
    parameters.push(new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString())
  }

  const groupSelect = plan.groupBy.map((group, index) => `${groupExpression[group]} AS group_${index}`)
  const select = [...groupSelect, 'COUNT(*) AS count'].join(', ')
  const groupAliases = plan.groupBy.map((_, index) => `group_${index}`)
  const groupClause = groupAliases.length ? `GROUP BY ${groupAliases.join(', ')} ORDER BY ${groupAliases.join(', ')}` : ''
  const rows = getLeadDatabase().prepare(`
    SELECT ${select}
    FROM lead_submission
    WHERE ${conditions.join(' AND ')}
    ${groupClause}
  `).all(...parameters) as Array<Record<string, string | number | null>>

  const normalizedRows = rows.map((row) => ({
    dimensions: Object.fromEntries(plan.groupBy.map((group, index) => {
      const rawValue = String(row[`group_${index}`] ?? '未知')
      return [group, groupLabel[rawValue] || rawValue]
    })) as Partial<Record<LeadQueryGroup, string>>,
    count: Number(row.count || 0),
  }))

  return {
    ...period,
    total: normalizedRows.reduce((sum, row) => sum + row.count, 0),
    rows: normalizedRows,
  }
}

export function executeLeadQueryPlan(input: LeadQueryPlan, now = new Date()): LeadAnalyticsResult {
  const plan = parseLeadQueryPlan(input)
  if (plan.intent === 'HELP') {
    return { intent: 'HELP', generatedAt: now.toISOString(), periods: [], helpMessage: plan.helpMessage }
  }

  const periods = resolveLeadQueryPeriods(plan, now).map((period) => queryPeriod(plan, period, now))
  const result: LeadAnalyticsResult = { intent: plan.intent, generatedAt: now.toISOString(), periods }

  if (plan.intent === 'COMPARE') {
    const [current, baseline] = periods
    const difference = current.total - baseline.total
    result.comparison = {
      current: current.total,
      baseline: baseline.total,
      difference,
      changeRate: baseline.total === 0 ? null : difference / baseline.total,
    }
  }

  if (plan.intent === 'PEAK') {
    const rows = periods[0]?.rows || []
    result.peak = rows.reduce<LeadAnalyticsRow | null>((highest, row) => {
      if (!highest || row.count > highest.count) return row
      return highest
    }, null)
  }

  return result
}
