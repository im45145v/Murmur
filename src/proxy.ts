import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from './lib/server/admin-session'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminPage = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')
  const isProtectedApi =
    pathname.startsWith('/api/settings') ||
    pathname.startsWith('/api/posts') ||
    pathname.startsWith('/api/integrations') ||
    pathname.includes('/captions') ||
    (pathname.startsWith('/api/submissions') && request.method !== 'POST')

  if (isAdminPage || isProtectedApi) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value
    const session = await verifyAdminSessionToken(token)

    if (!session) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
