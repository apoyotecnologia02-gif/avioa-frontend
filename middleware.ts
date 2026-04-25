import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isAdminRole } from '@/lib/roles'

const PUBLIC_PATHS = ['/login', '/api/auth', '/invite']
const TOKEN_KEY = 'portal_access_token'
const ADMIN_PATH_PREFIX = '/admin'

function getRoleFromToken(token: string | undefined): string {
  if (!token) return ''

  try {
    const payloadSegment = token.split('.')[1]
    if (!payloadSegment) return ''
    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const decoded = JSON.parse(atob(padded)) as { role?: string }
    return decoded.role ?? ''
  } catch {
    return ''
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(TOKEN_KEY)?.value

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    // Redirect authenticated users away from login
    if (pathname === '/login' && token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Redirect unauthenticated users to login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Restrict admin module to ADMIN role only
  if (pathname.startsWith(ADMIN_PATH_PREFIX)) {
    const role = getRoleFromToken(token)
    if (!isAdminRole(role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (except auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
