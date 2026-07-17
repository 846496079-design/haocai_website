import 'server-only'

export function getCmsDatabaseUrl() {
  return process.env.CMS_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim() || undefined
}

export function usesPostgres() {
  return Boolean(getCmsDatabaseUrl())
}

export function requireCmsDatabaseUrl() {
  const value = getCmsDatabaseUrl()
  if (!value) throw new Error('未配置 CMS_DATABASE_URL 或 DATABASE_URL。')
  return value
}

export function usesSecureCmsCookie() {
  const configuredValue = process.env.CMS_COOKIE_SECURE?.trim().toLowerCase()
  if (configuredValue === 'true') return true
  if (configuredValue === 'false') return false
  if (process.env.NODE_ENV === 'production') return true
  return false
}
