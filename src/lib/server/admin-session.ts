const encoder = new TextEncoder()

export const ADMIN_COOKIE_NAME = 'murmur-admin-session'
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

export interface AdminSession {
  sub: string
  iat: number
  exp: number
  nonce: string
}

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || secret.length < 16) {
    throw new Error('ADMIN_SESSION_SECRET must be set to at least 16 characters')
  }
  return secret
}

function base64UrlEncode(value: string | Uint8Array): string {
  const bytes = typeof value === 'string' ? encoder.encode(value) : value
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlDecode(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function randomNonce(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return base64UrlEncode(bytes)
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
  return base64UrlEncode(new Uint8Array(signature))
}

export async function signAdminSession(sub = 'admin'): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const payload: AdminSession = {
    sub,
    iat: now,
    exp: now + ADMIN_SESSION_TTL_SECONDS,
    nonce: randomNonce(),
  }
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = await hmac(encodedPayload)
  return `v1.${encodedPayload}.${signature}`
}

export async function verifyAdminSessionToken(token: string | undefined): Promise<AdminSession | null> {
  if (!token) return null

  const [version, encodedPayload, signature] = token.split('.')
  if (version !== 'v1' || !encodedPayload || !signature) return null

  const expectedSignature = await hmac(encodedPayload)
  if (!constantTimeEqual(signature, expectedSignature)) return null

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AdminSession
    if (!payload.sub || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

export function getCookieValue(cookieHeader: string | null, name: string): string | undefined {
  if (!cookieHeader) return undefined
  const cookies = cookieHeader.split(';')
  for (const cookie of cookies) {
    const [rawKey, ...rawValue] = cookie.trim().split('=')
    if (rawKey === name) return decodeURIComponent(rawValue.join('='))
  }
  return undefined
}

export async function getAdminSessionFromRequest(request: Request): Promise<AdminSession | null> {
  const token = getCookieValue(request.headers.get('cookie'), ADMIN_COOKIE_NAME)
  return verifyAdminSessionToken(token)
}

export async function signState(payload: Record<string, unknown>, ttlSeconds = 10 * 60): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const encodedPayload = base64UrlEncode(JSON.stringify({ ...payload, iat: now, exp: now + ttlSeconds, nonce: randomNonce() }))
  const signature = await hmac(encodedPayload)
  return `v1.${encodedPayload}.${signature}`
}

export async function verifyState<T extends Record<string, unknown>>(state: string | null): Promise<T | null> {
  if (!state) return null
  const [version, encodedPayload, signature] = state.split('.')
  if (version !== 'v1' || !encodedPayload || !signature) return null

  const expectedSignature = await hmac(encodedPayload)
  if (!constantTimeEqual(signature, expectedSignature)) return null

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as T & { exp?: number }
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}
