import type { LeadKind, LeadStatus } from '@/lib/leads/types'

export type LeadQueryIntent = 'SUMMARY' | 'COMPARE' | 'TREND' | 'PEAK' | 'HELP'
export type LeadQueryGroup = 'KIND' | 'STATUS' | 'DAY' | 'WEEK'
export type LeadQueryPreset = 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'LAST_WEEK' | 'THIS_MONTH' | 'LAST_MONTH'

export type LeadQueryPeriod =
  | { mode: 'PRESET'; value: LeadQueryPreset; label?: string }
  | { mode: 'RELATIVE_DAYS'; days: number; label?: string }
  | { mode: 'CUSTOM'; startDate: string; endDate: string; label?: string }

export type LeadQueryPlan = {
  version: 1
  intent: LeadQueryIntent
  metric: 'LEAD_COUNT'
  periods: LeadQueryPeriod[]
  kinds: LeadKind[]
  statuses: LeadStatus[]
  overdueOnly: boolean
  groupBy: LeadQueryGroup[]
  helpMessage?: string
}

export type ResolvedLeadQueryPeriod = {
  label: string
  startAt: string
  endAt: string
}

const allowedPlanKeys = new Set(['version', 'intent', 'metric', 'periods', 'kinds', 'statuses', 'overdueOnly', 'groupBy', 'helpMessage'])
const allowedPeriodKeys = new Set(['mode', 'value', 'days', 'startDate', 'endDate', 'label'])
const allowedIntents = new Set<LeadQueryIntent>(['SUMMARY', 'COMPARE', 'TREND', 'PEAK', 'HELP'])
const allowedGroups = new Set<LeadQueryGroup>(['KIND', 'STATUS', 'DAY', 'WEEK'])
const allowedPresets = new Set<LeadQueryPreset>(['TODAY', 'YESTERDAY', 'THIS_WEEK', 'LAST_WEEK', 'THIS_MONTH', 'LAST_MONTH'])
const allowedKinds = new Set<LeadKind>(['TRIAL', 'PARTNER'])
const allowedStatuses = new Set<LeadStatus>(['PENDING', 'DELIVERED', 'PAUSED'])
const datePattern = /^\d{4}-\d{2}-\d{2}$/
const beijingOffsetMilliseconds = 8 * 60 * 60 * 1000
const dayMilliseconds = 24 * 60 * 60 * 1000

export class LeadQueryPlanError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function rejectUnknownKeys(value: Record<string, unknown>, allowed: ReadonlySet<string>, description: string) {
  const unknown = Object.keys(value).filter((key) => !allowed.has(key))
  if (unknown.length) throw new LeadQueryPlanError(`${description}包含不支持的字段。`)
}

function uniqueEnumArray<T extends string>(value: unknown, allowed: ReadonlySet<T>, description: string, maximum: number): T[] {
  if (!Array.isArray(value) || value.length > maximum || value.some((item) => typeof item !== 'string' || !allowed.has(item as T))) {
    throw new LeadQueryPlanError(`${description}格式无效。`)
  }
  return [...new Set(value as T[])]
}

function optionalLabel(value: unknown) {
  if (value === undefined) return undefined
  if (typeof value !== 'string' || value.trim().length === 0 || value.trim().length > 40) {
    throw new LeadQueryPlanError('时间范围标签格式无效。')
  }
  return value.trim()
}

function parseCalendarDate(value: string) {
  if (!datePattern.test(value)) throw new LeadQueryPlanError('自定义日期必须使用 YYYY-MM-DD。')
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new LeadQueryPlanError('自定义日期不存在。')
  }
  return { year, month, day }
}

function parsePeriod(value: unknown): LeadQueryPeriod {
  if (!isRecord(value)) throw new LeadQueryPlanError('时间范围格式无效。')
  rejectUnknownKeys(value, allowedPeriodKeys, '时间范围')
  const label = optionalLabel(value.label)
  if (value.mode === 'PRESET' && typeof value.value === 'string' && allowedPresets.has(value.value as LeadQueryPreset)) {
    if (value.days !== undefined || value.startDate !== undefined || value.endDate !== undefined) {
      throw new LeadQueryPlanError('预设时间范围包含冲突字段。')
    }
    return { mode: 'PRESET', value: value.value as LeadQueryPreset, label }
  }
  if (value.mode === 'RELATIVE_DAYS' && Number.isInteger(value.days) && Number(value.days) >= 1 && Number(value.days) <= 366) {
    if (value.value !== undefined || value.startDate !== undefined || value.endDate !== undefined) {
      throw new LeadQueryPlanError('相对时间范围包含冲突字段。')
    }
    return { mode: 'RELATIVE_DAYS', days: Number(value.days), label }
  }
  if (value.mode === 'CUSTOM' && typeof value.startDate === 'string' && typeof value.endDate === 'string') {
    if (value.value !== undefined || value.days !== undefined) throw new LeadQueryPlanError('自定义时间范围包含冲突字段。')
    parseCalendarDate(value.startDate)
    parseCalendarDate(value.endDate)
    return { mode: 'CUSTOM', startDate: value.startDate, endDate: value.endDate, label }
  }
  throw new LeadQueryPlanError('时间范围类型无效。')
}

export function parseLeadQueryPlan(value: unknown): LeadQueryPlan {
  if (!isRecord(value)) throw new LeadQueryPlanError('DeepSeek 没有返回查询计划对象。')
  rejectUnknownKeys(value, allowedPlanKeys, '查询计划')
  if (value.version !== 1) throw new LeadQueryPlanError('查询计划版本无效。')
  if (typeof value.intent !== 'string' || !allowedIntents.has(value.intent as LeadQueryIntent)) {
    throw new LeadQueryPlanError('查询意图无效。')
  }
  if (value.metric !== 'LEAD_COUNT') throw new LeadQueryPlanError('查询指标无效。')
  if (!Array.isArray(value.periods) || value.periods.length > 2) throw new LeadQueryPlanError('时间范围数量无效。')
  const periods = value.periods.map(parsePeriod)
  const kinds = uniqueEnumArray(value.kinds, allowedKinds, '线索类型', 2)
  const statuses = uniqueEnumArray(value.statuses, allowedStatuses, '线索状态', 3)
  const groupBy = uniqueEnumArray(value.groupBy, allowedGroups, '分组方式', 2)
  if (typeof value.overdueOnly !== 'boolean') throw new LeadQueryPlanError('超时筛选格式无效。')
  const intent = value.intent as LeadQueryIntent

  if (intent === 'HELP') {
    if (periods.length || groupBy.length || kinds.length || statuses.length || value.overdueOnly) {
      throw new LeadQueryPlanError('帮助意图不得包含数据库查询条件。')
    }
    if (typeof value.helpMessage !== 'string' || value.helpMessage.trim().length === 0 || value.helpMessage.length > 200) {
      throw new LeadQueryPlanError('帮助说明格式无效。')
    }
  } else {
    const expectedPeriods = intent === 'COMPARE' ? 2 : 1
    if (periods.length !== expectedPeriods) throw new LeadQueryPlanError('查询意图与时间范围数量不一致。')
    if (value.helpMessage !== undefined && value.helpMessage !== '') throw new LeadQueryPlanError('数据查询不得包含帮助说明。')
  }
  if (intent === 'TREND' || intent === 'PEAK') {
    if (!groupBy.includes('DAY') && !groupBy.includes('WEEK')) throw new LeadQueryPlanError('趋势或峰值查询必须按日或按周分组。')
  }
  if (groupBy.includes('DAY') && groupBy.includes('WEEK')) throw new LeadQueryPlanError('不能同时按日和按周分组。')
  if (value.overdueOnly && statuses.includes('DELIVERED')) throw new LeadQueryPlanError('超时筛选不能包含已送达状态。')

  return {
    version: 1,
    intent,
    metric: 'LEAD_COUNT',
    periods,
    kinds,
    statuses,
    overdueOnly: value.overdueOnly,
    groupBy,
    helpMessage: typeof value.helpMessage === 'string' && value.helpMessage.trim() ? value.helpMessage.trim() : undefined,
  }
}

function beijingDateParts(now: Date) {
  const shifted = new Date(now.getTime() + beijingOffsetMilliseconds)
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    weekday: shifted.getUTCDay(),
  }
}

function fromBeijingDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day) - beijingOffsetMilliseconds)
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * dayMilliseconds)
}

function presetLabel(value: LeadQueryPreset) {
  return ({
    TODAY: '今天',
    YESTERDAY: '昨天',
    THIS_WEEK: '本周',
    LAST_WEEK: '上周',
    THIS_MONTH: '本月',
    LAST_MONTH: '上月',
  } as const)[value]
}

export function resolveLeadQueryPeriod(period: LeadQueryPeriod, now = new Date()): ResolvedLeadQueryPeriod {
  const parts = beijingDateParts(now)
  const todayStart = fromBeijingDate(parts.year, parts.month, parts.day)
  let start: Date
  let end: Date
  let label: string

  if (period.mode === 'PRESET') {
    label = period.label || presetLabel(period.value)
    if (period.value === 'TODAY') {
      start = todayStart
      end = addDays(start, 1)
    } else if (period.value === 'YESTERDAY') {
      end = todayStart
      start = addDays(end, -1)
    } else if (period.value === 'THIS_WEEK' || period.value === 'LAST_WEEK') {
      const daysSinceMonday = (parts.weekday + 6) % 7
      const thisWeekStart = addDays(todayStart, -daysSinceMonday)
      start = period.value === 'THIS_WEEK' ? thisWeekStart : addDays(thisWeekStart, -7)
      end = period.value === 'THIS_WEEK' ? addDays(thisWeekStart, 7) : thisWeekStart
    } else if (period.value === 'THIS_MONTH') {
      start = fromBeijingDate(parts.year, parts.month, 1)
      end = fromBeijingDate(parts.year, parts.month + 1, 1)
    } else {
      end = fromBeijingDate(parts.year, parts.month, 1)
      start = fromBeijingDate(parts.year, parts.month - 1, 1)
    }
  } else if (period.mode === 'RELATIVE_DAYS') {
    label = period.label || `最近 ${period.days} 天`
    start = addDays(todayStart, -(period.days - 1))
    end = addDays(todayStart, 1)
  } else {
    const startParts = parseCalendarDate(period.startDate)
    const endParts = parseCalendarDate(period.endDate)
    start = fromBeijingDate(startParts.year, startParts.month, startParts.day)
    end = addDays(fromBeijingDate(endParts.year, endParts.month, endParts.day), 1)
    label = period.label || `${period.startDate} 至 ${period.endDate}`
  }

  if (end.getTime() <= start.getTime() || end.getTime() - start.getTime() > 366 * dayMilliseconds) {
    throw new LeadQueryPlanError('查询时间范围必须是 1 至 366 天。')
  }
  return { label, startAt: start.toISOString(), endAt: end.toISOString() }
}

export function resolveLeadQueryPeriods(plan: LeadQueryPlan, now = new Date()) {
  return plan.periods.map((period) => resolveLeadQueryPeriod(period, now))
}

export const leadQueryPlanPrompt = `你是账大师官网线索问数规划器。你的唯一任务是把用户问题转换为 JSON 查询计划，不回答业务数字，不输出 SQL，不请求个人明细。
只允许输出一个 JSON 对象，字段必须完整且不得增加字段：
{"version":1,"intent":"SUMMARY|COMPARE|TREND|PEAK|HELP","metric":"LEAD_COUNT","periods":[],"kinds":[],"statuses":[],"overdueOnly":false,"groupBy":[],"helpMessage":""}
periods 元素只允许三种形式：
1. {"mode":"PRESET","value":"TODAY|YESTERDAY|THIS_WEEK|LAST_WEEK|THIS_MONTH|LAST_MONTH","label":"可选中文标签"}
2. {"mode":"RELATIVE_DAYS","days":1到366的整数,"label":"可选中文标签"}
3. {"mode":"CUSTOM","startDate":"YYYY-MM-DD","endDate":"YYYY-MM-DD","label":"可选中文标签"}
kinds 只允许 TRIAL、PARTNER；statuses 只允许 PENDING、DELIVERED、PAUSED；groupBy 只允许 KIND、STATUS、DAY、WEEK。
体验套餐或用户线索映射为 TRIAL，代理商或合作线索映射为 PARTNER。新增按 created_at 统计。超过 6 小时使用 overdueOnly=true。
COMPARE 必须包含两个 periods；其他数据意图必须包含一个。TREND 和 PEAK 必须包含 DAY 或 WEEK 分组。HELP 不得包含任何查询条件，并通过 helpMessage 简短说明可查询官网线索数量、趋势和对比。
如果用户请求姓名、电话、公司、备注、单条明细、修改数据、执行 SQL 或与官网线索无关的内容，必须返回 HELP。`
