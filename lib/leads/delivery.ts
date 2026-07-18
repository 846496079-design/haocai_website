import { randomUUID } from 'node:crypto'
import { getFeishuWebhookUrl, getWebsiteAdminLeadUrl, leadTargets } from './config'
import {
  backupLeadDatabaseIfDue,
  claimNextLead,
  finishLeadDelivery,
  getLeadSystemState,
  overdueLeadSummary,
  recordLeadAlert,
  setLeadSystemState,
} from './store'
import type { ClaimedLead, DeliveryResult } from './types'

const requestTimeoutMilliseconds = 12_000
const alertRepeatMilliseconds = 6 * 60 * 60 * 1000

function safeErrorMessage(value: string, lead?: ClaimedLead) {
  let message = value.replace(/\s+/g, ' ').trim().slice(0, 300)
  if (lead) {
    for (const fieldValue of Object.values(lead.payload)) {
      if (typeof fieldValue === 'string' && fieldValue.length >= 2) message = message.replaceAll(fieldValue, '[已脱敏]')
    }
  }
  return message.replace(/\d{5,}/g, '[号码已脱敏]') || '外部接口返回未知错误。'
}

function responseMessage(body: string) {
  if (!body) return ''
  try {
    const parsed = JSON.parse(body) as { message?: unknown; msg?: unknown; detail?: unknown }
    const message = parsed.message ?? parsed.msg ?? parsed.detail
    return typeof message === 'string' ? message : ''
  } catch {
    return ''
  }
}

async function deliverLead(lead: ClaimedLead): Promise<DeliveryResult> {
  const started = Date.now()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMilliseconds)
  try {
    const response = await fetch(leadTargets[lead.kind], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Idempotency-Key': lead.receiptId,
        'User-Agent': 'Zhangdashi-Lead-Outbox/1.0',
      },
      body: JSON.stringify(lead.payload),
      signal: controller.signal,
    })
    const body = (await response.text()).slice(0, 4096)
    const durationMs = Date.now() - started
    if (response.ok) {
      return { result: 'DELIVERED', httpStatus: response.status, durationMs, errorCode: null, errorMessage: null }
    }
    const message = safeErrorMessage(responseMessage(body) || `外部接口返回 HTTP ${response.status}。`, lead)
    const retryable = response.status === 408 || response.status === 425 || response.status === 429 || response.status >= 500
    return {
      result: retryable ? 'RETRY' : 'PAUSED',
      httpStatus: response.status,
      durationMs,
      errorCode: `HTTP_${response.status}`,
      errorMessage: message,
    }
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError'
    return {
      result: 'RETRY',
      httpStatus: null,
      durationMs: Date.now() - started,
      errorCode: aborted ? 'TIMEOUT' : 'NETWORK_ERROR',
      errorMessage: aborted ? '外部接口响应超时。' : '无法连接外部接口。',
    }
  } finally {
    clearTimeout(timeout)
  }
}

async function sendFeishuAlert(text: string) {
  const webhook = getFeishuWebhookUrl()
  if (!webhook) return { result: 'SKIPPED' as const, errorMessage: '飞书群机器人 Webhook 尚未配置。' }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  try {
    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msg_type: 'text', content: { text } }),
      signal: controller.signal,
    })
    if (!response.ok) return { result: 'FAILED' as const, errorMessage: `飞书返回 HTTP ${response.status}。` }
    const data = await response.json().catch(() => ({})) as { code?: number; StatusCode?: number; msg?: string }
    const code = data.code ?? data.StatusCode ?? 0
    if (code !== 0) return { result: 'FAILED' as const, errorMessage: `飞书通知失败：${String(data.msg || code).slice(0, 100)}` }
    return { result: 'SENT' as const, errorMessage: null }
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError' ? '飞书通知超时。' : '无法连接飞书通知接口。'
    return { result: 'FAILED' as const, errorMessage: message }
  } finally {
    clearTimeout(timeout)
  }
}

function waitingDuration(createdAt: string | null) {
  if (!createdAt) return '未知'
  const hours = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 3_600_000))
  return hours < 24 ? `${hours} 小时` : `${Math.floor(hours / 24)} 天 ${hours % 24} 小时`
}

export async function evaluateLeadAlerts() {
  const summary = overdueLeadSummary()
  const active = getLeadSystemState('overdue_alert_active') === '1'
  const lastAttemptValue = getLeadSystemState('overdue_alert_last_attempt_at')
  const lastAttempt = lastAttemptValue ? new Date(lastAttemptValue).getTime() : 0
  const shouldRepeat = !lastAttempt || Date.now() - lastAttempt >= alertRepeatMilliseconds

  if (summary.overdueCount > 0 && (!active || shouldRepeat)) {
    const notification = await sendFeishuAlert([
      '账大师官网线索中转预警',
      `超过 6 小时未送达：${summary.overdueCount} 条`,
      `当前未送达总数：${summary.undeliveredCount} 条`,
      `最老等待时间：${waitingDuration(summary.oldestCreatedAt)}`,
      `处理入口：${getWebsiteAdminLeadUrl()}`,
    ].join('\n'))
    recordLeadAlert({ event: 'OVERDUE', ...summary, result: notification.result, errorMessage: notification.errorMessage })
    setLeadSystemState('overdue_alert_active', '1')
    setLeadSystemState('overdue_alert_last_attempt_at', new Date().toISOString())
    return notification
  }

  if (summary.overdueCount === 0 && active) {
    const notification = await sendFeishuAlert([
      '账大师官网线索中转已恢复',
      `当前未送达总数：${summary.undeliveredCount} 条`,
      `处理入口：${getWebsiteAdminLeadUrl()}`,
    ].join('\n'))
    recordLeadAlert({ event: 'RECOVERED', ...summary, result: notification.result, errorMessage: notification.errorMessage })
    setLeadSystemState('overdue_alert_active', '0')
    setLeadSystemState('overdue_alert_last_attempt_at', new Date().toISOString())
    return notification
  }

  return { result: 'SKIPPED' as const, errorMessage: null }
}

export async function processLeadBatch(maxItems = 10) {
  const safeMaxItems = Math.max(1, Math.min(50, Math.trunc(maxItems) || 10))
  const workerId = `worker-${process.pid}-${randomUUID()}`
  let delivered = 0
  let retried = 0
  let paused = 0

  for (let index = 0; index < safeMaxItems; index += 1) {
    const lead = claimNextLead(workerId)
    if (!lead) break
    const startedAt = new Date().toISOString()
    const result = await deliverLead(lead)
    finishLeadDelivery(lead, result, startedAt)
    if (result.result === 'DELIVERED') delivered += 1
    else if (result.result === 'PAUSED') paused += 1
    else retried += 1
  }

  const alert = await evaluateLeadAlerts()
  const backupCreated = await backupLeadDatabaseIfDue()
  return { delivered, retried, paused, alert: alert.result, backupCreated }
}
