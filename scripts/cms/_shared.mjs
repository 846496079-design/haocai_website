import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

export function hasFlag(name) {
  return process.argv.slice(2).includes(name)
}

export function option(name, fallback) {
  const args = process.argv.slice(2)
  const index = args.indexOf(name)
  if (index < 0) return fallback
  const value = args[index + 1]
  if (!value || value.startsWith('--')) throw new Error(`${name} 需要一个值。`)
  return value
}

export function resolveFromRoot(value) {
  return resolve(projectRoot, value)
}

export function requireFile(path, label) {
  if (!existsSync(path)) throw new Error(`${label}不存在：${path}`)
  return path
}

export function databaseUrl() {
  const value = process.env.CMS_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim()
  if (!value) throw new Error('请设置 CMS_DATABASE_URL 或 DATABASE_URL。')
  return value
}

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

export function canonicalJson(value) {
  if (Array.isArray(value)) return value.map(canonicalJson)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalJson(value[key])]))
  }
  return value
}

export function contentHash(value) {
  return sha256(JSON.stringify(canonicalJson(value)))
}

export function sqlStatements(file) {
  const source = readFileSync(file, 'utf8')
  const statements = []
  let current = ''
  let single = false
  let double = false
  let lineComment = false
  let blockComment = false
  let dollarTag = ''

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    const next = source[index + 1]

    if (lineComment) {
      current += char
      if (char === '\n') lineComment = false
      continue
    }
    if (blockComment) {
      current += char
      if (char === '*' && next === '/') {
        current += next
        index += 1
        blockComment = false
      }
      continue
    }
    if (!single && !double && !dollarTag && char === '-' && next === '-') {
      current += `${char}${next}`
      index += 1
      lineComment = true
      continue
    }
    if (!single && !double && !dollarTag && char === '/' && next === '*') {
      current += `${char}${next}`
      index += 1
      blockComment = true
      continue
    }
    if (!single && !double && char === '$') {
      const match = source.slice(index).match(/^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/)
      if (match && (!dollarTag || match[0] === dollarTag)) {
        current += match[0]
        index += match[0].length - 1
        dollarTag = dollarTag ? '' : match[0]
        continue
      }
    }
    if (!double && !dollarTag && char === "'") {
      current += char
      if (single && next === "'") {
        current += next
        index += 1
      } else single = !single
      continue
    }
    if (!single && !dollarTag && char === '"') {
      current += char
      if (double && next === '"') {
        current += next
        index += 1
      } else double = !double
      continue
    }
    if (!single && !double && !dollarTag && char === ';') {
      if (current.trim()) statements.push(current.trim())
      current = ''
      continue
    }
    current += char
  }
  if (single || double || blockComment || dollarTag) throw new Error('迁移 SQL 含有未闭合的字符串或注释。')
  if (current.trim()) statements.push(current.trim())
  return statements
}

export function fail(error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
