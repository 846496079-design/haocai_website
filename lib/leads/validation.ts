import type { LeadKind, LeadPayload, PartnerLeadPayload, TrialLeadPayload } from './types'

export class LeadValidationError extends Error {}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new LeadValidationError('提交内容格式不正确。')
  return value as Record<string, unknown>
}

function text(value: unknown, field: string, options: { required?: boolean; max: number }) {
  if (value == null) {
    if (options.required) throw new LeadValidationError(`${field}不能为空。`)
    return undefined
  }
  if (typeof value !== 'string') throw new LeadValidationError(`${field}格式不正确。`)
  const normalized = value.trim()
  if (!normalized) {
    if (options.required) throw new LeadValidationError(`${field}不能为空。`)
    return undefined
  }
  if (normalized.length > options.max) throw new LeadValidationError(`${field}不能超过 ${options.max} 个字符。`)
  return normalized
}

function phone(value: unknown) {
  const normalized = text(value, '电话', { required: true, max: 20 })!
  if (!/^[0-9+()\-\s]{5,20}$/.test(normalized)) throw new LeadValidationError('电话格式不正确。')
  return normalized
}

export function normalizeTrialLead(value: unknown): TrialLeadPayload {
  const body = object(value)
  const result: TrialLeadPayload = {
    contactName: text(body.contactName, '联系人', { required: true, max: 50 })!,
    contactPhone: phone(body.contactPhone),
  }
  const referrerCode = text(body.referrerCode ?? body.inviteCode, '邀请码', { max: 50 })
  if (referrerCode) result.referrerCode = referrerCode
  return result
}

export function normalizePartnerLead(value: unknown): PartnerLeadPayload {
  const body = object(value)
  const result: PartnerLeadPayload = {
    contactName: text(body.contactName ?? body.name, '姓名', { required: true, max: 50 })!,
    contactPhone: phone(body.contactPhone ?? body.phone),
    city: text(body.city, '城市', { required: true, max: 50 })!,
  }
  const optionalFields: Array<[keyof PartnerLeadPayload, unknown, string, number]> = [
    ['companyName', body.companyName ?? body.company, '公司/团队', 50],
    ['position', body.position ?? body.role, '角色身份', 50],
    ['cooperationMode', body.cooperationMode ?? body.cooperationType, '合作方式', 50],
    ['customerScale', body.customerScale, '客户资源规模', 50],
    ['inviteCode', body.inviteCode, '邀请码', 50],
    ['remark', body.remark ?? body.message, '补充说明', 2000],
  ]
  for (const [key, raw, label, max] of optionalFields) {
    const normalized = text(raw, label, { max })
    if (normalized) result[key] = normalized
  }
  return result
}

export function normalizeLead(kind: LeadKind, value: unknown): LeadPayload {
  return kind === 'TRIAL' ? normalizeTrialLead(value) : normalizePartnerLead(value)
}
