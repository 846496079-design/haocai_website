import { join } from 'node:path'

export const leadTargets = {
  TRIAL: 'https://hcagent.ai-hc.cn/api/v1/customer-lead-pool-leads/submit',
  PARTNER: 'https://hcagent.ai-hc.cn/api/v1/agent-public-pool-leads/submit',
} as const

export function getLeadDatabasePath() {
  return process.env.LEAD_OUTBOX_DATABASE_PATH?.trim() || join(process.cwd(), '.data', 'lead-outbox.sqlite')
}

export function getLeadEncryptionKey() {
  const value = process.env.LEAD_DATA_ENCRYPTION_KEY?.trim()
  if (!value) throw new Error('线索加密密钥尚未配置。')
  const key = /^[0-9a-f]{64}$/i.test(value) ? Buffer.from(value, 'hex') : Buffer.from(value, 'base64')
  if (key.length !== 32) throw new Error('LEAD_DATA_ENCRYPTION_KEY 必须是 32 字节密钥。')
  return key
}

export function getLeadWorkerToken() {
  const value = process.env.LEAD_WORKER_TOKEN?.trim()
  if (!value || value.length < 32) throw new Error('线索工作进程令牌尚未配置。')
  return value
}

export function getFeishuWebhookUrl() {
  const value = process.env.LEAD_ALERT_FEISHU_WEBHOOK_URL?.trim()
  if (!value) return undefined
  try {
    const url = new URL(value)
    const allowedHost = url.hostname === 'open.feishu.cn' || url.hostname === 'open.larksuite.com'
    if (url.protocol !== 'https:' || !allowedHost || !url.pathname.startsWith('/open-apis/bot/v2/hook/')) return undefined
    return url.toString()
  } catch {
    return undefined
  }
}

export function getWebsiteAdminLeadUrl() {
  const origin = process.env.PUBLIC_SITE_ORIGIN?.trim() || 'http://zhangdashi.ai'
  return `${origin.replace(/\/$/, '')}/cms/leads/`
}
