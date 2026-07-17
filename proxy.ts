import { NextResponse, type NextRequest } from 'next/server'

const mutationMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])
const localDevelopmentOrigin = 'http://127.0.0.1:3000'

function firstForwardedValue(value: string | null) {
  return value?.split(',')[0]?.trim()
}

function getExpectedOrigin(request: NextRequest) {
  const forwardedHost = firstForwardedValue(request.headers.get('x-forwarded-host'))
  const forwardedProto = firstForwardedValue(request.headers.get('x-forwarded-proto'))
  if (forwardedHost && (forwardedProto === 'http' || forwardedProto === 'https')) {
    return `${forwardedProto}://${forwardedHost}`
  }
  return request.nextUrl.origin
}

export function proxy(request: NextRequest) {
  if (mutationMethods.has(request.method)) {
    const origin = request.headers.get('origin')
    const allowedLocalDevelopmentOrigin = process.env.NODE_ENV === 'development' && origin === localDevelopmentOrigin
    if (origin && origin !== getExpectedOrigin(request) && !allowedLocalDevelopmentOrigin) {
      return NextResponse.json({ message: '拒绝跨站请求。' }, { status: 403 })
    }
  }
  return NextResponse.next()
}

export const config = { matcher: '/api/cms/:path*' }
