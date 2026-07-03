interface LoginAttempt {
  count: number
  resetAt: number
}

const WINDOW_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 8
const attempts = new Map<string, LoginAttempt>()

export function getLoginThrottleKey(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'local'
}

export function isLoginThrottled(key: string) {
  const attempt = attempts.get(key)
  if (!attempt) return false
  if (attempt.resetAt < Date.now()) {
    attempts.delete(key)
    return false
  }
  return attempt.count >= MAX_ATTEMPTS
}

export function recordLoginFailure(key: string) {
  const current = attempts.get(key)
  if (!current || current.resetAt < Date.now()) {
    attempts.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS })
    return
  }
  attempts.set(key, { ...current, count: current.count + 1 })
}

export function clearLoginFailures(key: string) {
  attempts.delete(key)
}
