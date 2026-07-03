import { NextResponse } from 'next/server'
import { getAdminSessionFromRequest, type AdminSession } from './admin-session'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

function sameOrigin(request: Request): boolean {
  if (SAFE_METHODS.has(request.method.toUpperCase())) return true

  const origin = request.headers.get('origin')
  if (!origin) return true

  try {
    return origin === new URL(request.url).origin
  } catch {
    return false
  }
}

export function isApiResponse(value: AdminSession | NextResponse): value is NextResponse {
  return value instanceof Response
}

export async function requireAdmin(request: Request): Promise<AdminSession | NextResponse> {
  const session = await getAdminSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!sameOrigin(request)) {
    return NextResponse.json({ error: 'Cross-origin admin mutation blocked' }, { status: 403 })
  }

  return session
}

export function validationError(error: unknown) {
  return NextResponse.json({ error: 'Invalid request', details: error }, { status: 400 })
}
