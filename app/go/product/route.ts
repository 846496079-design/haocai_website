import { resolveProductEntryUrl } from '@/lib/product-entry'
import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export function GET(request: NextRequest) {
  const targetUrl = resolveProductEntryUrl({
    mobileHint: request.headers.get('sec-ch-ua-mobile'),
    userAgent: request.headers.get('user-agent'),
  })
  const response = NextResponse.redirect(targetUrl, 307)

  response.headers.set('Cache-Control', 'private, no-store, max-age=0')
  response.headers.set('Vary', 'User-Agent, Sec-CH-UA-Mobile')

  return response
}
