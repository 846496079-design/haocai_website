import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'

const replayWindowMs = 5 * 60 * 1000

function secureEqual(left: string, right: string) {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function verifyCmsImportRequest(request: Request, rawBody: string) {
  const secret = process.env.CMS_IMPORT_SIGNING_SECRET?.trim() || process.env.CMS_IMPORT_SHARED_SECRET?.trim()
  if (!secret) throw new Error('服务端未配置 CMS_IMPORT_SIGNING_SECRET。')
  const timestamp = request.headers.get('x-cms-timestamp')?.trim()
  const idempotencyKey = request.headers.get('idempotency-key')?.trim()
  const signatureHeader = request.headers.get('x-cms-signature')?.trim()
  if (!timestamp || !idempotencyKey || !signatureHeader) throw new Error('缺少签名、时间戳或幂等键。')
  if (idempotencyKey.length < 12 || idempotencyKey.length > 128) throw new Error('幂等键长度必须为 12–128 个字符。')
  const timestampMs = Number(timestamp)
  if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > replayWindowMs) throw new Error('请求时间戳已过期。')
  const expected = createHmac('sha256', secret).update(`${timestamp}.${idempotencyKey}.${rawBody}`).digest('hex')
  const actual = signatureHeader.replace(/^sha256=/i, '')
  if (!/^[a-f0-9]{64}$/i.test(actual) || !secureEqual(expected, actual.toLowerCase())) throw new Error('导入请求签名无效。')
  return { idempotencyKey, timestamp: timestampMs }
}
