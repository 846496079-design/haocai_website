import 'server-only'

import bcrypt from 'bcryptjs'
import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { getDatabase, writeAudit } from './store'

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

export async function ensureInitialAdmin() {
  const database = getDatabase()
  const exists = database.prepare('SELECT id FROM cms_admin LIMIT 1').get()
  if (exists) return
  const username = process.env.CMS_ADMIN_USERNAME
  const password = process.env.CMS_ADMIN_PASSWORD
  if (!username || !password) return
  const timestamp = now()
  database.prepare('INSERT INTO cms_admin (username, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?)').run(username, await bcrypt.hash(password, 12), timestamp, timestamp)
}

export async function loginCmsAdmin(username: string, password: string) {
  await ensureInitialAdmin()
  const database = getDatabase()
  const admin = database.prepare('SELECT * FROM cms_admin WHERE username = ?').get(username) as AdminRow | undefined
  const timestamp = now()
  const locked = admin?.locked_until && new Date(admin.locked_until) > new Date()
  const valid = Boolean(admin && admin.is_active && !locked && await bcrypt.compare(password, admin.password_hash))
  if (!valid) {
    if (admin) {
      const failed = admin.failed_login_count + 1
      const lockedUntil = failed >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null
      database.prepare('UPDATE cms_admin SET failed_login_count = ?, locked_until = ?, updated_at = ? WHERE id = ?').run(failed >= 5 ? 0 : failed, lockedUntil, timestamp, admin.id)
      writeAudit(admin.id, 'LOGIN_FAILED', 'cms_admin', String(admin.id), { locked: Boolean(lockedUntil) })
    }
    throw new Error('账号或密码错误，或账号暂时不可用。')
  }
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
    secure: process.env.NODE_ENV === 'production' && process.env.CMS_COOKIE_SECURE !== 'false',
    sameSite: 'lax',
    path: '/',
    expires: new Date(expiresAt),
  })
}

export async function getCmsAdmin() {
  const token = (await cookies()).get(sessionCookie)?.value
  if (!token) return undefined
  const database = getDatabase()
  const session = database.prepare(`SELECT cms_admin.id, cms_admin.username FROM cms_session JOIN cms_admin ON cms_admin.id = cms_session.admin_id WHERE cms_session.token_hash = ? AND cms_session.revoked_at IS NULL AND cms_session.expires_at > ? AND cms_admin.is_active = 1`).get(hashToken(token), now()) as { id: number; username: string } | undefined
  return session
}

export async function logoutCmsAdmin() {
  const store = await cookies()
  const token = store.get(sessionCookie)?.value
  if (token) {
    const database = getDatabase()
    const admin = await getCmsAdmin()
    database.prepare('UPDATE cms_session SET revoked_at = ? WHERE token_hash = ?').run(now(), hashToken(token))
    if (admin) writeAudit(admin.id, 'LOGOUT', 'cms_admin', String(admin.id), {})
  }
  store.delete(sessionCookie)
}
