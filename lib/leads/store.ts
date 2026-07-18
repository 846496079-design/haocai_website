import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { randomBytes } from 'node:crypto'
import { decryptLeadPayload, encryptLeadPayload, hashLeadPayload, hashLeadValue } from './crypto'
import { getFeishuWebhookUrl, getLeadDatabasePath } from './config'
import type {
  ClaimedLead,
  DeliveryResult,
  LeadAttempt,
  LeadDetail,
  LeadFilters,
  LeadKind,
  LeadListItem,
  LeadPayload,
  LeadStats,
  LeadStatus,
  LeadSubmissionResult,
} from './types'

type LeadRow = {
  id: number
  receipt_id: string
  kind: LeadKind
  status: LeadStatus
  payload_ciphertext: string
  payload_iv: string
  payload_tag: string
  attempt_count: number
  next_attempt_at: string | null
  last_error_message: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
}

export class LeadRateLimitError extends Error {}

const overdueMilliseconds = 6 * 60 * 60 * 1000
const duplicateWindowMilliseconds = 10 * 60 * 1000
const rateWindowMilliseconds = 60 * 60 * 1000
const maxSubmissionsPerSourcePerHour = 10
let database: Database.Database | undefined
let activeDatabasePath: string | undefined

function now() {
  return new Date().toISOString()
}

function initialize(instance: Database.Database) {
  instance.exec(`
    CREATE TABLE IF NOT EXISTS lead_submission (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receipt_id TEXT NOT NULL UNIQUE,
      kind TEXT NOT NULL CHECK(kind IN ('TRIAL', 'PARTNER')),
      status TEXT NOT NULL CHECK(status IN ('PENDING', 'DELIVERED', 'PAUSED')),
      payload_ciphertext TEXT NOT NULL,
      payload_iv TEXT NOT NULL,
      payload_tag TEXT NOT NULL,
      payload_hash TEXT NOT NULL,
      source_hash TEXT,
      attempt_count INTEGER NOT NULL DEFAULT 0,
      next_attempt_at TEXT,
      lease_until TEXT,
      lease_owner TEXT,
      last_error_code TEXT,
      last_error_message TEXT,
      first_alerted_at TEXT,
      last_alerted_at TEXT,
      delivered_at TEXT,
      paused_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS lead_submission_due_idx
      ON lead_submission(status, next_attempt_at, lease_until);
    CREATE INDEX IF NOT EXISTS lead_submission_created_idx
      ON lead_submission(created_at DESC);
    CREATE INDEX IF NOT EXISTS lead_submission_payload_idx
      ON lead_submission(kind, payload_hash, created_at DESC);
    CREATE INDEX IF NOT EXISTS lead_submission_source_idx
      ON lead_submission(source_hash, created_at DESC);

    CREATE TABLE IF NOT EXISTS lead_delivery_attempt (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      attempt_no INTEGER NOT NULL,
      result TEXT NOT NULL CHECK(result IN ('DELIVERED', 'RETRY', 'PAUSED')),
      http_status INTEGER,
      duration_ms INTEGER NOT NULL,
      error_code TEXT,
      error_message TEXT,
      started_at TEXT NOT NULL,
      finished_at TEXT NOT NULL,
      FOREIGN KEY (lead_id) REFERENCES lead_submission(id)
    );
    CREATE INDEX IF NOT EXISTS lead_attempt_lead_idx
      ON lead_delivery_attempt(lead_id, id DESC);

    CREATE TABLE IF NOT EXISTS lead_alert_delivery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event TEXT NOT NULL,
      overdue_count INTEGER NOT NULL,
      undelivered_count INTEGER NOT NULL,
      oldest_created_at TEXT,
      result TEXT NOT NULL,
      error_message TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lead_system_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS feishu_bot_event (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_hash TEXT NOT NULL UNIQUE,
      user_hash TEXT,
      chat_hash TEXT,
      status TEXT NOT NULL CHECK(status IN ('PROCESSING', 'COMPLETED', 'FAILED')),
      intent TEXT,
      error_code TEXT,
      lease_until TEXT,
      created_at TEXT NOT NULL,
      completed_at TEXT,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS feishu_bot_event_created_idx
      ON feishu_bot_event(created_at DESC);
  `)
}

export function getLeadDatabase() {
  const databasePath = getLeadDatabasePath()
  if (!database || activeDatabasePath !== databasePath) {
    database?.close()
    mkdirSync(dirname(databasePath), { recursive: true })
    database = new Database(databasePath)
    activeDatabasePath = databasePath
    database.pragma('journal_mode = WAL')
    database.pragma('foreign_keys = ON')
    database.pragma('busy_timeout = 5000')
    initialize(database)
  }
  return database
}

export function closeLeadDatabaseForTest() {
  database?.close()
  database = undefined
  activeDatabasePath = undefined
}

function receiptId() {
  return `ZDS-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomBytes(9).toString('base64url').toUpperCase()}`
}

export function createLeadSubmission(kind: LeadKind, payload: LeadPayload, sourceAddress?: string): LeadSubmissionResult {
  const db = getLeadDatabase()
  const timestamp = now()
  const payloadHash = hashLeadPayload(payload)
  const sourceHash = sourceAddress ? hashLeadValue('source', sourceAddress) : null
  const encrypted = encryptLeadPayload(payload)

  return db.transaction(() => {
    const duplicateSince = new Date(Date.now() - duplicateWindowMilliseconds).toISOString()
    const duplicate = db.prepare(`
      SELECT receipt_id FROM lead_submission
      WHERE kind = ? AND payload_hash = ? AND created_at >= ?
      ORDER BY id DESC LIMIT 1
    `).get(kind, payloadHash, duplicateSince) as { receipt_id: string } | undefined
    if (duplicate) return { receiptId: duplicate.receipt_id, duplicate: true }

    if (sourceHash) {
      const rateSince = new Date(Date.now() - rateWindowMilliseconds).toISOString()
      const count = db.prepare('SELECT COUNT(*) AS count FROM lead_submission WHERE source_hash = ? AND created_at >= ?')
        .get(sourceHash, rateSince) as { count: number }
      if (count.count >= maxSubmissionsPerSourcePerHour) throw new LeadRateLimitError('提交过于频繁，请稍后再试。')
    }

    const id = receiptId()
    db.prepare(`
      INSERT INTO lead_submission (
        receipt_id, kind, status, payload_ciphertext, payload_iv, payload_tag,
        payload_hash, source_hash, next_attempt_at, created_at, updated_at
      ) VALUES (?, ?, 'PENDING', ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      kind,
      encrypted.ciphertext,
      encrypted.iv,
      encrypted.tag,
      payloadHash,
      sourceHash,
      timestamp,
      timestamp,
      timestamp,
    )
    return { receiptId: id, duplicate: false }
  })()
}

export function claimNextLead(workerId: string, leaseMilliseconds = 60_000): ClaimedLead | undefined {
  const db = getLeadDatabase()
  const timestamp = now()
  const leaseUntil = new Date(Date.now() + leaseMilliseconds).toISOString()
  const row = db.transaction(() => {
    const candidate = db.prepare(`
      SELECT * FROM lead_submission
      WHERE status = 'PENDING'
        AND next_attempt_at <= ?
        AND (lease_until IS NULL OR lease_until <= ?)
      ORDER BY next_attempt_at, id
      LIMIT 1
    `).get(timestamp, timestamp) as LeadRow | undefined
    if (!candidate) return undefined
    const updated = db.prepare(`
      UPDATE lead_submission
      SET lease_owner = ?, lease_until = ?, updated_at = ?
      WHERE id = ? AND status = 'PENDING' AND (lease_until IS NULL OR lease_until <= ?)
    `).run(workerId, leaseUntil, timestamp, candidate.id, timestamp)
    return updated.changes === 1 ? candidate : undefined
  })()
  if (!row) return undefined
  return {
    id: row.id,
    receiptId: row.receipt_id,
    kind: row.kind,
    payload: decryptLeadPayload({ ciphertext: row.payload_ciphertext, iv: row.payload_iv, tag: row.payload_tag }),
    attemptCount: row.attempt_count,
  }
}

function nextAttemptAt(attemptNo: number) {
  const minutes = [1, 5, 15, 30][attemptNo - 1] ?? 60
  return new Date(Date.now() + minutes * 60 * 1000).toISOString()
}

export function finishLeadDelivery(lead: ClaimedLead, result: DeliveryResult, startedAt: string) {
  const db = getLeadDatabase()
  const timestamp = now()
  const attemptNo = lead.attemptCount + 1
  db.transaction(() => {
    db.prepare(`
      INSERT INTO lead_delivery_attempt (
        lead_id, attempt_no, result, http_status, duration_ms,
        error_code, error_message, started_at, finished_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      lead.id,
      attemptNo,
      result.result,
      result.httpStatus,
      result.durationMs,
      result.errorCode,
      result.errorMessage,
      startedAt,
      timestamp,
    )

    if (result.result === 'DELIVERED') {
      db.prepare(`
        UPDATE lead_submission
        SET status = 'DELIVERED', attempt_count = ?, delivered_at = ?, next_attempt_at = NULL,
            lease_owner = NULL, lease_until = NULL, last_error_code = NULL,
            last_error_message = NULL, updated_at = ?
        WHERE id = ?
      `).run(attemptNo, timestamp, timestamp, lead.id)
      return
    }
    if (result.result === 'PAUSED') {
      db.prepare(`
        UPDATE lead_submission
        SET status = 'PAUSED', attempt_count = ?, paused_at = ?, next_attempt_at = NULL,
            lease_owner = NULL, lease_until = NULL, last_error_code = ?,
            last_error_message = ?, updated_at = ?
        WHERE id = ?
      `).run(attemptNo, timestamp, result.errorCode, result.errorMessage, timestamp, lead.id)
      return
    }
    db.prepare(`
      UPDATE lead_submission
      SET status = 'PENDING', attempt_count = ?, next_attempt_at = ?,
          lease_owner = NULL, lease_until = NULL, last_error_code = ?,
          last_error_message = ?, updated_at = ?
      WHERE id = ?
    `).run(attemptNo, nextAttemptAt(attemptNo), result.errorCode, result.errorMessage, timestamp, lead.id)
  })()
}

function maskedPhone(phone: string) {
  if (phone.length <= 5) return `${phone.slice(0, 1)}***${phone.slice(-1)}`
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

function toListItem(row: LeadRow): LeadListItem {
  const payload = decryptLeadPayload({ ciphertext: row.payload_ciphertext, iv: row.payload_iv, tag: row.payload_tag })
  return {
    id: row.id,
    receiptId: row.receipt_id,
    kind: row.kind,
    status: row.status,
    contactName: payload.contactName,
    maskedPhone: maskedPhone(payload.contactPhone),
    attemptCount: row.attempt_count,
    nextAttemptAt: row.next_attempt_at,
    lastErrorMessage: row.last_error_message,
    deliveredAt: row.delivered_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    overdue: row.status !== 'DELIVERED' && new Date(row.created_at).getTime() <= Date.now() - overdueMilliseconds,
  }
}

export function listLeadSubmissions(filters: LeadFilters = {}): LeadListItem[] {
  const conditions: string[] = []
  const parameters: unknown[] = []
  if (filters.status) {
    conditions.push('status = ?')
    parameters.push(filters.status)
  }
  if (filters.kind) {
    conditions.push('kind = ?')
    parameters.push(filters.kind)
  }
  if (filters.overdueOnly) {
    conditions.push("status <> 'DELIVERED' AND created_at <= ?")
    parameters.push(new Date(Date.now() - overdueMilliseconds).toISOString())
  }
  const limit = Math.max(1, Math.min(500, Math.trunc(filters.limit ?? 100)))
  parameters.push(limit)
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const rows = getLeadDatabase().prepare(`SELECT * FROM lead_submission ${where} ORDER BY id DESC LIMIT ?`).all(...parameters) as LeadRow[]
  return rows.map(toListItem)
}

export function getLeadSubmission(id: number): LeadDetail | undefined {
  const db = getLeadDatabase()
  const row = db.prepare('SELECT * FROM lead_submission WHERE id = ?').get(id) as LeadRow | undefined
  if (!row) return undefined
  const attempts = db.prepare('SELECT * FROM lead_delivery_attempt WHERE lead_id = ? ORDER BY id DESC').all(id) as Array<{
    id: number
    attempt_no: number
    result: LeadAttempt['result']
    http_status: number | null
    duration_ms: number
    error_message: string | null
    started_at: string
    finished_at: string
  }>
  return {
    ...toListItem(row),
    payload: decryptLeadPayload({ ciphertext: row.payload_ciphertext, iv: row.payload_iv, tag: row.payload_tag }),
    attempts: attempts.map((attempt) => ({
      id: attempt.id,
      attemptNo: attempt.attempt_no,
      result: attempt.result,
      httpStatus: attempt.http_status,
      durationMs: attempt.duration_ms,
      errorMessage: attempt.error_message,
      startedAt: attempt.started_at,
      finishedAt: attempt.finished_at,
    })),
  }
}

export function getLeadStats(): LeadStats {
  const db = getLeadDatabase()
  const overdueBefore = new Date(Date.now() - overdueMilliseconds).toISOString()
  const dayStart = new Date()
  dayStart.setHours(0, 0, 0, 0)
  const row = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN kind = 'TRIAL' THEN 1 ELSE 0 END) AS trial,
      SUM(CASE WHEN kind = 'PARTNER' THEN 1 ELSE 0 END) AS partner,
      SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) AS today,
      SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) AS delivered,
      SUM(CASE WHEN status = 'PAUSED' THEN 1 ELSE 0 END) AS paused,
      SUM(CASE WHEN status <> 'DELIVERED' AND created_at <= ? THEN 1 ELSE 0 END) AS overdue,
      MIN(CASE WHEN status <> 'DELIVERED' THEN created_at END) AS oldest_pending_at
    FROM lead_submission
  `).get(dayStart.toISOString(), overdueBefore) as Record<string, number | string | null>
  const lastAlert = db.prepare(`
    SELECT error_message FROM lead_alert_delivery
    WHERE result = 'FAILED' ORDER BY id DESC LIMIT 1
  `).get() as { error_message: string | null } | undefined
  return {
    total: Number(row.total ?? 0),
    trial: Number(row.trial ?? 0),
    partner: Number(row.partner ?? 0),
    today: Number(row.today ?? 0),
    pending: Number(row.pending ?? 0),
    delivered: Number(row.delivered ?? 0),
    paused: Number(row.paused ?? 0),
    overdue: Number(row.overdue ?? 0),
    oldestPendingAt: typeof row.oldest_pending_at === 'string' ? row.oldest_pending_at : null,
    alertChannelConfigured: Boolean(getFeishuWebhookUrl()),
    lastAlertError: lastAlert?.error_message ?? null,
  }
}

export function retryLeadSubmission(id: number) {
  const timestamp = now()
  return getLeadDatabase().prepare(`
    UPDATE lead_submission
    SET status = 'PENDING', paused_at = NULL, next_attempt_at = ?, lease_owner = NULL,
        lease_until = NULL, updated_at = ?
    WHERE id = ? AND status <> 'DELIVERED'
  `).run(timestamp, timestamp, id).changes === 1
}

export function pauseLeadSubmission(id: number) {
  const timestamp = now()
  return getLeadDatabase().prepare(`
    UPDATE lead_submission
    SET status = 'PAUSED', paused_at = ?, next_attempt_at = NULL,
        lease_owner = NULL, lease_until = NULL, updated_at = ?
    WHERE id = ? AND status = 'PENDING'
  `).run(timestamp, timestamp, id).changes === 1
}

export function getLeadSystemState(key: string) {
  const row = getLeadDatabase().prepare('SELECT value FROM lead_system_state WHERE key = ?').get(key) as { value: string } | undefined
  return row?.value
}

export function setLeadSystemState(key: string, value: string) {
  const timestamp = now()
  getLeadDatabase().prepare(`
    INSERT INTO lead_system_state (key, value, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(key, value, timestamp)
}

function requiredEventIdentifier(value: string, description: string) {
  const normalized = value.trim()
  if (!normalized || normalized.length > 512) throw new Error(`${description}格式无效。`)
  return normalized
}

export function claimFeishuBotEvent(input: { eventId: string; userId?: string; chatId?: string }, leaseMilliseconds = 5 * 60 * 1000) {
  const timestamp = now()
  const leaseUntil = new Date(Date.now() + Math.max(30_000, Math.min(15 * 60 * 1000, leaseMilliseconds))).toISOString()
  const eventHash = hashLeadValue('feishu-event', requiredEventIdentifier(input.eventId, '飞书事件 ID'))
  const userHash = input.userId ? hashLeadValue('feishu-user', requiredEventIdentifier(input.userId, '飞书用户 ID')) : null
  const chatHash = input.chatId ? hashLeadValue('feishu-chat', requiredEventIdentifier(input.chatId, '飞书会话 ID')) : null
  const inserted = getLeadDatabase().prepare(`
    INSERT INTO feishu_bot_event (
      event_hash, user_hash, chat_hash, status, lease_until, created_at, updated_at
    ) VALUES (?, ?, ?, 'PROCESSING', ?, ?, ?)
    ON CONFLICT(event_hash) DO UPDATE SET
      user_hash = excluded.user_hash,
      chat_hash = excluded.chat_hash,
      status = 'PROCESSING',
      intent = NULL,
      error_code = NULL,
      lease_until = excluded.lease_until,
      completed_at = NULL,
      updated_at = excluded.updated_at
    WHERE feishu_bot_event.status = 'FAILED'
       OR (feishu_bot_event.status = 'PROCESSING' AND feishu_bot_event.lease_until <= excluded.created_at)
  `).run(eventHash, userHash, chatHash, leaseUntil, timestamp, timestamp)
  return inserted.changes === 1
}

export function completeFeishuBotEvent(eventId: string, intent: 'SUMMARY' | 'COMPARE' | 'TREND' | 'PEAK' | 'HELP') {
  const timestamp = now()
  const eventHash = hashLeadValue('feishu-event', requiredEventIdentifier(eventId, '飞书事件 ID'))
  const updated = getLeadDatabase().prepare(`
    UPDATE feishu_bot_event
    SET status = 'COMPLETED', intent = ?, error_code = NULL, lease_until = NULL, completed_at = ?, updated_at = ?
    WHERE event_hash = ? AND status = 'PROCESSING'
  `).run(intent, timestamp, timestamp, eventHash)
  return updated.changes === 1
}

export function failFeishuBotEvent(eventId: string, errorCode: string) {
  const timestamp = now()
  const eventHash = hashLeadValue('feishu-event', requiredEventIdentifier(eventId, '飞书事件 ID'))
  const safeErrorCode = errorCode.replace(/[^A-Z0-9_-]/gi, '_').slice(0, 64) || 'UNKNOWN'
  const updated = getLeadDatabase().prepare(`
    UPDATE feishu_bot_event
    SET status = 'FAILED', error_code = ?, lease_until = NULL, completed_at = ?, updated_at = ?
    WHERE event_hash = ? AND status = 'PROCESSING'
  `).run(safeErrorCode, timestamp, timestamp, eventHash)
  return updated.changes === 1
}

export function overdueLeadSummary() {
  const db = getLeadDatabase()
  const overdueBefore = new Date(Date.now() - overdueMilliseconds).toISOString()
  const row = db.prepare(`
    SELECT
      SUM(CASE WHEN status <> 'DELIVERED' THEN 1 ELSE 0 END) AS undelivered_count,
      SUM(CASE WHEN status <> 'DELIVERED' AND created_at <= ? THEN 1 ELSE 0 END) AS overdue_count,
      MIN(CASE WHEN status <> 'DELIVERED' THEN created_at END) AS oldest_created_at
    FROM lead_submission
  `).get(overdueBefore) as { undelivered_count: number; overdue_count: number; oldest_created_at: string | null }
  return {
    undeliveredCount: Number(row.undelivered_count ?? 0),
    overdueCount: Number(row.overdue_count ?? 0),
    oldestCreatedAt: row.oldest_created_at,
  }
}

export function recordLeadAlert(input: {
  event: 'OVERDUE' | 'RECOVERED'
  overdueCount: number
  undeliveredCount: number
  oldestCreatedAt: string | null
  result: 'SENT' | 'FAILED' | 'SKIPPED'
  errorMessage?: string | null
}) {
  const db = getLeadDatabase()
  const timestamp = now()
  db.transaction(() => {
    db.prepare(`
      INSERT INTO lead_alert_delivery (
        event, overdue_count, undelivered_count, oldest_created_at,
        result, error_message, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      input.event,
      input.overdueCount,
      input.undeliveredCount,
      input.oldestCreatedAt,
      input.result,
      input.errorMessage ?? null,
      timestamp,
    )
    if (input.event === 'OVERDUE') {
      db.prepare(`
        UPDATE lead_submission
        SET first_alerted_at = COALESCE(first_alerted_at, ?), last_alerted_at = ?, updated_at = updated_at
        WHERE status <> 'DELIVERED' AND created_at <= ?
      `).run(timestamp, timestamp, new Date(Date.now() - overdueMilliseconds).toISOString())
    }
  })()
}

export async function backupLeadDatabaseIfDue() {
  const today = new Date().toISOString().slice(0, 10)
  if (getLeadSystemState('last_backup_date') === today) return false
  const databasePath = getLeadDatabasePath()
  const backupDirectory = join(dirname(databasePath), 'backups', 'lead-outbox')
  mkdirSync(backupDirectory, { recursive: true })
  await getLeadDatabase().backup(join(backupDirectory, `lead-outbox-${today}.sqlite`))
  setLeadSystemState('last_backup_date', today)
  return true
}
