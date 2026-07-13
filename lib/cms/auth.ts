import 'server-only'

import bcrypt from 'bcryptjs'
import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { getDatabase, writeAudit } from './store'
import { neon } from '@neondatabase/serverless'
import { ensurePostgresSchema, writeAudit as writePostgresAudit } from './store-postgres'
import { requireCmsDatabaseUrl, usesPostgres, usesSecureCmsCookie } from './config'

const sessionCookie = 'zds_cms_session'
const sessionDays = 7

type AdminRow = {
  id: number
  username: string
  password_hash: string
  failed_login_count: number
  locked_until: string | null
  is_active: number
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function now() {
  return new Date().toISOString()
}

function postgres() {
  const sql = neon(requireCmsDatabaseUrl())
  return async (query: string, parameters: unknown[] = []) => await sql.query(query, parameters) as Record<string, unknown>[]
}

function initialAdminCredentials() {
  const username = process.env.CMS_ADMIN_USERNAME?.trim()
  const password = process.env.CMS_ADMIN_PASSWORD
  if (!username || !password) return undefined
  if (password.length < 12) throw new Error('CMS_ADMIN_PASSWORD 必须至少为 12 位。')
  return { username, password }
}

export async function ensureInitialAdmin() {
  if (usesPostgres()) {
    await ensurePostgresSchema()
    const sql = postgres()
    const exists = await sql('SELECT id FROM cms_admin LIMIT 1')
    if (exists[0]) return
    const credentials = initialAdminCredentials()
    if (!credentials) return
    await sql('INSERT INTO cms_admin (username, password_hash) VALUES ($1, $2)', [credentials.username, await bcrypt.hash(credentials.password, 12)])
    return
  }
  const database = getDatabase()
  const exists = database.prepare('SELECT id FROM cms_admin LIMIT 1').get()
  if (exists) return
  const credentials = initialAdminCredentials()
  if (!credentials) return
  const timestamp = now()
  database.prepare('INSERT INTO cms_admin (username, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?)').run(credentials.username, await bcrypt.hash(credentials.password, 12), timestamp, timestamp)
}

export async function loginCmsAdmin(username: string, password: string) {
  await ensureInitialAdmin()
  if (usesPostgres()) {
    const sql = postgres()
    const rows = await sql('SELECT * FROM cms_admin WHERE username = $1', [username])
    const admin = rows[0] as AdminRow | undefined
    const timestamp = now()
    const locked = admin?.locked_until && new Date(admin.locked_until) > new Date()
    const valid = Boolean(admin && admin.is_active && !locked && await bcrypt.compare(password, admin.password_hash))
    if (!valid) {
      if (admin) {
        if (locked) {
          await writePostgresAudit(admin.id, 'LOGIN_FAILED', 'cms_admin', String(admin.id), { locked: true })
        } else {
          const failed = admin.failed_login_count + 1
          const lockedUntil = failed >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null
          await sql('UPDATE cms_admin SET failed_login_count = $1, locked_until = $2, updated_at = $3 WHERE id = $4', [failed >= 5 ? 0 : failed, lockedUntil, timestamp, admin.id])
          await writePostgresAudit(admin.id, 'LOGIN_FAILED', 'cms_admin', String(admin.id), { locked: Boolean(lockedUntil) })
        }
      }
      throw new Error('账号或密码错误，或账号暂时不可用。')
    }
    if (!admin) throw new Error('账号或密码错误，或账号暂时不可用。')
    const token = randomBytes(32).toString('base64url')
    const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000).toISOString()
    await sql('INSERT INTO cms_session (admin_id, token_hash, expires_at) VALUES ($1, $2, $3)', [admin.id, hashToken(token), expiresAt])
    await sql('UPDATE cms_admin SET failed_login_count = 0, locked_until = NULL, last_login_at = $1, updated_at = $1 WHERE id = $2', [timestamp, admin.id])
    await writePostgresAudit(admin.id, 'LOGIN', 'cms_admin', String(admin.id), {})
    return { token, expiresAt, adminId: admin.id }
  }
  const database = getDatabase()
  const admin = database.prepare('SELECT * FROM cms_admin WHERE username = ?').get(username) as AdminRow | undefined
  const timestamp = now()
  const locked = admin?.locked_until && new Date(admin.locked_until) > new Date()
  const valid = Boolean(admin && admin.is_active && !locked && await bcrypt.compare(password, admin.password_hash))
  if (!valid) {
    if (admin) {
      if (locked) {
        writeAudit(admin.id, 'LOGIN_FAILED', 'cms_admin', String(admin.id), { locked: true })
      } else {
        const failed = admin.failed_login_count + 1
        const lockedUntil = failed >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null
        database.prepare('UPDATE cms_admin SET failed_login_count = ?, locked_until = ?, updated_at = ? WHERE id = ?').run(failed >= 5 ? 0 : failed, lockedUntil, timestamp, admin.id)
        writeAudit(admin.id, 'LOGIN_FAILED', 'cms_admin', String(admin.id), { locked: Boolean(lockedUntil) })
      }
    }
    throw new Error('账号或密码错误，或账号暂时不可用。')
  }
  if (!admin) throw new Error('账号或密码错误，或账号暂时不可用。')
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000).toISOString()
  database.prepare('INSERT INTO cms_session (admin_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?)').run(admin.id, hashToken(token), expiresAt, timestamp)
  database.prepare('UPDATE cms_admin SET failed_login_count = 0, locked_until = NULL, last_login_at = ?, updated_at = ? WHERE id = ?').run(timestamp, timestamp, admin.id)
  writeAudit(admin.id, 'LOGIN', 'cms_admin', String(admin.id), {})
  return { token, expiresAt, adminId: admin.id }
}

export async function setCmsSession(token: string, expiresAt: string) {
  const store = await cookies()
  store.set(sessionCookie, token, {
    httpOnly: true,
    secure: usesSecureCmsCookie(),
    sameSite: 'lax',
    path: '/',
    expires: new Date(expiresAt),
  })
}

export async function getCmsAdmin() {
  const token = (await cookies()).get(sessionCookie)?.value
  if (!token) return undefined
  if (usesPostgres()) {
    await ensurePostgresSchema()
    const rows = await postgres()(`SELECT cms_admin.id, cms_admin.username FROM cms_session JOIN cms_admin ON cms_admin.id = cms_session.admin_id WHERE cms_session.token_hash = $1 AND cms_session.revoked_at IS NULL AND cms_session.expires_at > $2 AND cms_admin.is_active = TRUE`, [hashToken(token), now()])
    return rows[0] as { id: number; username: string } | undefined
  }
  const database = getDatabase()
  const session = database.prepare(`SELECT cms_admin.id, cms_admin.username FROM cms_session JOIN cms_admin ON cms_admin.id = cms_session.admin_id WHERE cms_session.token_hash = ? AND cms_session.revoked_at IS NULL AND cms_session.expires_at > ? AND cms_admin.is_active = 1`).get(hashToken(token), now()) as { id: number; username: string } | undefined
  return session
}

export async function logoutCmsAdmin() {
  const store = await cookies()
  const token = store.get(sessionCookie)?.value
  if (token) {
    if (usesPostgres()) {
      const admin = await getCmsAdmin()
      await postgres()('UPDATE cms_session SET revoked_at = $1 WHERE token_hash = $2', [now(), hashToken(token)])
      if (admin) await writePostgresAudit(admin.id, 'LOGOUT', 'cms_admin', String(admin.id), {})
      store.delete(sessionCookie)
      return
    }
    const database = getDatabase()
    const admin = await getCmsAdmin()
    database.prepare('UPDATE cms_session SET revoked_at = ? WHERE token_hash = ?').run(now(), hashToken(token))
    if (admin) writeAudit(admin.id, 'LOGOUT', 'cms_admin', String(admin.id), {})
  }
  store.delete(sessionCookie)
}

/**
 * Updates the signed-in administrator's password and revokes every other
 * session. Returning false deliberately does not distinguish an expired
 * session from an incorrect current password.
 */
export async function changeCmsAdminPassword(currentPassword: string, newPassword: string) {
  if (!currentPassword || newPassword.length < 12) return false
  const token = (await cookies()).get(sessionCookie)?.value
  if (!token) return false
  const admin = await getCmsAdmin()
  if (!admin) return false
  const currentTokenHash = hashToken(token)

  if (usesPostgres()) {
    await ensurePostgresSchema()
    const sql = postgres()
    const rows = await sql('SELECT password_hash FROM cms_admin WHERE id = $1 AND is_active = TRUE', [admin.id])
    const passwordHash = typeof rows[0]?.password_hash === 'string' ? rows[0].password_hash : ''
    if (!passwordHash || !await bcrypt.compare(currentPassword, passwordHash)) {
      await writePostgresAudit(admin.id, 'PASSWORD_CHANGE_FAILED', 'cms_admin', String(admin.id), {})
      return false
    }
    const nextHash = await bcrypt.hash(newPassword, 12)
    await sql(`
      WITH updated AS (
        UPDATE cms_admin
        SET password_hash = $1, failed_login_count = 0, locked_until = NULL, updated_at = NOW()
        WHERE id = $2 AND is_active = TRUE
        RETURNING id
      ), revoked AS (
        UPDATE cms_session
        SET revoked_at = NOW()
        WHERE admin_id = $2
          AND token_hash <> $3
          AND revoked_at IS NULL
          AND EXISTS (SELECT 1 FROM updated)
        RETURNING id
      )
      INSERT INTO cms_audit_log (admin_id, action, target_type, target_id, detail_json)
      SELECT $2, 'PASSWORD_CHANGED', 'cms_admin', $2::text,
             jsonb_build_object('revokedSessions', (SELECT COUNT(*) FROM revoked))
      FROM updated
    `, [nextHash, admin.id, currentTokenHash])
    return true
  }

  const database = getDatabase()
  const row = database.prepare('SELECT password_hash FROM cms_admin WHERE id = ? AND is_active = 1').get(admin.id) as { password_hash: string } | undefined
  if (!row || !await bcrypt.compare(currentPassword, row.password_hash)) {
    writeAudit(admin.id, 'PASSWORD_CHANGE_FAILED', 'cms_admin', String(admin.id), {})
    return false
  }
  const nextHash = await bcrypt.hash(newPassword, 12)
  const timestamp = now()
  database.transaction(() => {
    database.prepare('UPDATE cms_admin SET password_hash = ?, failed_login_count = 0, locked_until = NULL, updated_at = ? WHERE id = ? AND is_active = 1').run(nextHash, timestamp, admin.id)
    const revoked = database.prepare('UPDATE cms_session SET revoked_at = ? WHERE admin_id = ? AND token_hash <> ? AND revoked_at IS NULL').run(timestamp, admin.id, currentTokenHash)
    writeAudit(admin.id, 'PASSWORD_CHANGED', 'cms_admin', String(admin.id), { revokedSessions: revoked.changes })
  })()
  return true
}
