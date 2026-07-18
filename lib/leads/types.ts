export type LeadKind = 'TRIAL' | 'PARTNER'
export type LeadStatus = 'PENDING' | 'DELIVERED' | 'PAUSED'

export type TrialLeadPayload = {
  contactName: string
  contactPhone: string
  referrerCode?: string
}

export type PartnerLeadPayload = {
  contactName: string
  contactPhone: string
  companyName?: string
  position?: string
  city: string
  cooperationMode?: string
  customerScale?: string
  inviteCode?: string
  remark?: string
}

export type LeadPayload = TrialLeadPayload | PartnerLeadPayload

export type LeadSubmissionResult = {
  receiptId: string
  duplicate: boolean
}

export type LeadStats = {
  total: number
  trial: number
  partner: number
  today: number
  pending: number
  delivered: number
  paused: number
  overdue: number
  oldestPendingAt: string | null
  alertChannelConfigured: boolean
  lastAlertError: string | null
}

export type LeadListItem = {
  id: number
  receiptId: string
  kind: LeadKind
  status: LeadStatus
  contactName: string
  maskedPhone: string
  attemptCount: number
  nextAttemptAt: string | null
  lastErrorMessage: string | null
  deliveredAt: string | null
  createdAt: string
  updatedAt: string
  overdue: boolean
}

export type LeadAttempt = {
  id: number
  attemptNo: number
  result: 'DELIVERED' | 'RETRY' | 'PAUSED'
  httpStatus: number | null
  durationMs: number
  errorMessage: string | null
  startedAt: string
  finishedAt: string
}

export type LeadDetail = LeadListItem & {
  payload: LeadPayload
  attempts: LeadAttempt[]
}

export type LeadFilters = {
  status?: LeadStatus
  kind?: LeadKind
  overdueOnly?: boolean
  limit?: number
}

export type ClaimedLead = {
  id: number
  receiptId: string
  kind: LeadKind
  payload: LeadPayload
  attemptCount: number
}

export type DeliveryResult = {
  result: 'DELIVERED' | 'RETRY' | 'PAUSED'
  httpStatus: number | null
  durationMs: number
  errorCode: string | null
  errorMessage: string | null
}
