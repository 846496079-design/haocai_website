import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getLeadWorkerToken } from '@/lib/leads/config'
import { processLeadBatch } from '@/lib/leads/delivery'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function authorized(request: Request) {
  const authorization = request.headers.get('authorization') || ''
  const presented = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  try {
    const expected = getLeadWorkerToken()
    const left = Buffer.from(presented)
    const right = Buffer.from(expected)
    return left.length === right.length && timingSafeEqual(left, right)
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ message: '未授权。' }, { status: 401 })
  try {
    const result = await processLeadBatch(10)
    return NextResponse.json(result, { headers: { 'Cache-Control': 'private, no-store, max-age=0' } })
  } catch (error) {
    console.error('[lead-worker] 批处理失败。', error instanceof Error ? error.message : '未知错误')
    return NextResponse.json({ message: '线索批处理失败。' }, { status: 500 })
  }
}
