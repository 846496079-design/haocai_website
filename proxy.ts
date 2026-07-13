import { NextResponse, type NextRequest } from 'next/server'

const mutationMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export function proxy(request: NextRequest) {
  if (mutationMethods.has(request.method)) {
    const origin = request.headers.get('origin')
    if (origin && origin !== request.nextUrl.origin) {
      return NextResponse.json({ message: '拒绝跨站请求。' }, { status: 403 })
    }
  }
  return NextResponse.next()
}

export const config = { matcher: '/api/cms/:path*' }
