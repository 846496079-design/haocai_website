import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto'
import { getLeadEncryptionKey } from './config'
import type { LeadPayload } from './types'

export type EncryptedLeadPayload = {
  ciphertext: string
  iv: string
  tag: string
}

function stableJson(value: LeadPayload) {
  return JSON.stringify(Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right))))
}

export function encryptLeadPayload(payload: LeadPayload): EncryptedLeadPayload {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getLeadEncryptionKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(stableJson(payload), 'utf8'), cipher.final()])
  return {
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
  }
}

export function decryptLeadPayload(encrypted: EncryptedLeadPayload): LeadPayload {
  const decipher = createDecipheriv('aes-256-gcm', getLeadEncryptionKey(), Buffer.from(encrypted.iv, 'base64'))
  decipher.setAuthTag(Buffer.from(encrypted.tag, 'base64'))
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(encrypted.ciphertext, 'base64')),
    decipher.final(),
  ]).toString('utf8')
  return JSON.parse(plaintext) as LeadPayload
}

export function hashLeadValue(namespace: string, value: string) {
  return createHmac('sha256', getLeadEncryptionKey()).update(`${namespace}\0${value}`).digest('hex')
}

export function hashLeadPayload(payload: LeadPayload) {
  return hashLeadValue('payload', stableJson(payload))
}
