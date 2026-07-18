import assert from 'node:assert/strict'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomBytes } from 'node:crypto'
import { mkdtempSync } from 'node:fs'

async function main() {
  const workDirectory = mkdtempSync(join(tmpdir(), 'zds-lead-outbox-'))
  const databasePath = join(workDirectory, 'lead-outbox.sqlite')
  process.env.LEAD_OUTBOX_DATABASE_PATH = databasePath
  process.env.LEAD_DATA_ENCRYPTION_KEY = randomBytes(32).toString('base64')
  delete process.env.LEAD_ALERT_FEISHU_WEBHOOK_URL

  const store = await import('../../lib/leads/store')

  try {
  const trialPayload = {
    contactName: '线索验证姓名7F8',
    contactPhone: '13987654321',
    referrerCode: 'VERIFY-7F8',
  }
  const created = store.createLeadSubmission('TRIAL', trialPayload, '192.0.2.10')
  assert.equal(created.duplicate, false)
  const duplicate = store.createLeadSubmission('TRIAL', trialPayload, '192.0.2.10')
  assert.equal(duplicate.duplicate, true)
  assert.equal(duplicate.receiptId, created.receiptId)

  const firstClaim = store.claimNextLead('verify-worker')
  assert(firstClaim)
  assert.deepEqual(firstClaim.payload, trialPayload)
  const firstStartedAt = new Date().toISOString()
  store.finishLeadDelivery(firstClaim, {
    result: 'RETRY',
    httpStatus: 500,
    durationMs: 120,
    errorCode: 'HTTP_500',
    errorMessage: '外部接口返回 HTTP 500。',
  }, firstStartedAt)
  let detail = store.getLeadSubmission(firstClaim.id)
  assert.equal(detail?.status, 'PENDING')
  assert.equal(detail?.attemptCount, 1)
  assert.equal(detail?.attempts.length, 1)

  assert.equal(store.retryLeadSubmission(firstClaim.id), true)
  const secondClaim = store.claimNextLead('verify-worker')
  assert(secondClaim)
  store.finishLeadDelivery(secondClaim, {
    result: 'DELIVERED',
    httpStatus: 201,
    durationMs: 80,
    errorCode: null,
    errorMessage: null,
  }, new Date().toISOString())
  detail = store.getLeadSubmission(secondClaim.id)
  assert.equal(detail?.status, 'DELIVERED')
  assert.equal(detail?.attemptCount, 2)

  const partner = store.createLeadSubmission('PARTNER', {
    contactName: '线索验证代理9K2',
    contactPhone: '13876543210',
    city: '上海',
    remark: '验证加密备注9K2',
  }, '192.0.2.11')
  const partnerRow = store.getLeadDatabase().prepare('SELECT id FROM lead_submission WHERE receipt_id = ?').get(partner.receiptId) as { id: number }
  store.getLeadDatabase().prepare("UPDATE lead_submission SET created_at = ? WHERE id = ?")
    .run(new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), partnerRow.id)
  assert.equal(store.getLeadStats().overdue, 1)
  assert.equal(store.pauseLeadSubmission(partnerRow.id), true)
  assert.equal(store.getLeadSubmission(partnerRow.id)?.status, 'PAUSED')
  assert.equal(store.retryLeadSubmission(partnerRow.id), true)

  const originalFetch = globalThis.fetch
  let forwarded = 0
  globalThis.fetch = async (input, init) => {
    const url = String(input)
    assert.equal(url, 'https://hcagent.ai-hc.cn/api/v1/agent-public-pool-leads/submit')
    const headers = new Headers(init?.headers)
    assert.equal(headers.get('X-Idempotency-Key'), partner.receiptId)
    forwarded += 1
    return new Response(JSON.stringify({ code: 0, message: 'ok' }), { status: 201, headers: { 'Content-Type': 'application/json' } })
  }
  try {
    const { processLeadBatch } = await import('../../lib/leads/delivery')
    const batch = await processLeadBatch(10)
    assert.equal(batch.delivered, 1)
    assert.equal(batch.backupCreated, true)
  } finally {
    globalThis.fetch = originalFetch
  }
  assert.equal(forwarded, 1)
  assert.equal(store.getLeadSubmission(partnerRow.id)?.status, 'DELIVERED')

  const backupPath = join(workDirectory, 'backups', 'lead-outbox', `lead-outbox-${new Date().toISOString().slice(0, 10)}.sqlite`)
  assert.equal(existsSync(backupPath), true)

  store.getLeadDatabase().pragma('wal_checkpoint(TRUNCATE)')
  const databaseBytes = readFileSync(databasePath)
  for (const plaintext of ['线索验证姓名7F8', '13987654321', '验证加密备注9K2']) {
    assert.equal(databaseBytes.includes(Buffer.from(plaintext, 'utf8')), false, `数据库不应包含明文：${plaintext}`)
  }

    console.log('线索可靠队列验证通过。')
  } finally {
    store.closeLeadDatabaseForTest()
    rmSync(workDirectory, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
