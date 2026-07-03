import { NextResponse } from 'next/server'
import { ADMIN_COOKIE_NAME, ADMIN_SESSION_TTL_SECONDS, signAdminSession } from '@/lib/server/admin-session'
import { clearLoginFailures, getLoginThrottleKey, isLoginThrottled, recordLoginFailure } from '@/lib/server/login-throttle'

export async function POST(request: Request) {
  const { password, username } = await request.json()
  const throttleKey = getLoginThrottleKey(request)

  if (isLoginThrottled(throttleKey)) {
    return NextResponse.json({ error: 'Too many failed attempts. Try again later.' }, { status: 429 })
  }

  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    return NextResponse.json({ error: 'Admin password not configured' }, { status: 500 })
  }

  if (password !== adminPassword) {
    recordLoginFailure(throttleKey)
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const sessionToken = await signAdminSession(username || process.env.ADMIN_USERNAME || 'admin')
  clearLoginFailures(throttleKey)

  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  })

  return response
}
