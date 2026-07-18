import { NextResponse } from 'next/server'
import { createLeadSubmission, LeadRateLimitError } from './store'
import type { LeadKind } from './types'
import { normalizeLead, LeadValidationError } from './validation'

const maxRequestBytes = 16 * 1024

function sourceAddress(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || request.headers.get('x-real-ip')?.trim() || undefined
}

function json(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store, max-age=0' },
  })
}

export async function acceptPublicLead(request: Request, kind: LeadKind) {
  try {
    const declaredLength = Number(request.headers.get('content-length') || 0)
    if (declaredLength > maxRequestBytes) return json({ message: '提交内容过大。' }, 413)
    const rawBody = await request.text()
    if (Buffer.byteLength(rawBody, 'utf8') > maxRequestBytes) return json({ message: '提交内容过大。' }, 413)
    let input: unknown
    try {
      input = JSON.parse(rawBody)
    } catch {
      throw new LeadValidationError('提交内容格式不正确。')
    }
    const payload = normalizeLead(kind, input)
    const result = createLeadSubmission(kind, payload, sourceAddress(request))
    return json({ accepted: true, receiptId: result.receiptId, duplicate: result.duplicate }, 202)
  } catch (error) {
    if (error instanceof LeadValidationError) return json({ message: error.message }, 422)
    if (error instanceof LeadRateLimitError) return json({ message: error.message }, 429)
    console.error('[lead-intake] 本地保存失败。', error instanceof Error ? error.message : '未知错误')
    return json({ message: '提交暂时失败，请稍后再试。' }, 503)
  }
}
