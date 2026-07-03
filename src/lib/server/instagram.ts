import type { InstagramConnection } from '@/lib/types'

interface InstagramConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
  graphBaseUrl: string
  graphVersion: string
}

interface TokenExchangeResult {
  accessToken: string
  instagramUserId: string
  username: string
  accountType?: string
  tokenType?: string
  expiresAt?: Date
  scopes: string[]
}

interface InstagramApiError {
  error?: {
    message?: string
    type?: string
    code?: number
    error_subcode?: number
  }
  error_message?: string
}

function getConfig(): InstagramConfig {
  const clientId = process.env.INSTAGRAM_CLIENT_ID
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Instagram is not configured. Set INSTAGRAM_CLIENT_ID, INSTAGRAM_CLIENT_SECRET, and INSTAGRAM_REDIRECT_URI.')
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    scopes: (process.env.INSTAGRAM_SCOPES || 'instagram_business_basic,instagram_business_content_publish')
      .split(',')
      .map((scope) => scope.trim())
      .filter(Boolean),
    graphBaseUrl: process.env.INSTAGRAM_GRAPH_BASE_URL || 'https://graph.instagram.com',
    graphVersion: process.env.INSTAGRAM_GRAPH_VERSION || 'v24.0',
  }
}

async function readInstagramResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = data as InstagramApiError
    throw new Error(error.error?.message || error.error_message || `Instagram API failed with ${response.status}`)
  }
  return data as T
}

function apiUrl(path: string) {
  const config = getConfig()
  const base = config.graphBaseUrl.replace(/\/+$/g, '')
  return `${base}/${config.graphVersion}${path}`
}

export function buildInstagramAuthUrl(state: string): string {
  const config = getConfig()
  const url = new URL('https://www.instagram.com/oauth/authorize')
  url.searchParams.set('client_id', config.clientId)
  url.searchParams.set('redirect_uri', config.redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', config.scopes.join(','))
  url.searchParams.set('state', state)
  return url.toString()
}

export async function exchangeCodeForInstagramConnection(code: string): Promise<TokenExchangeResult> {
  const config = getConfig()

  const shortLivedResponse = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri,
      code,
    }),
  })

  const shortLived = await readInstagramResponse<{
    access_token: string
    user_id?: string | number
    permissions?: string[]
  }>(shortLivedResponse)

  const longLivedUrl = new URL('https://graph.instagram.com/access_token')
  longLivedUrl.searchParams.set('grant_type', 'ig_exchange_token')
  longLivedUrl.searchParams.set('client_secret', config.clientSecret)
  longLivedUrl.searchParams.set('access_token', shortLived.access_token)
  const longLived = await readInstagramResponse<{
    access_token: string
    token_type?: string
    expires_in?: number
  }>(await fetch(longLivedUrl))

  const profileUrl = new URL('https://graph.instagram.com/me')
  profileUrl.searchParams.set('fields', 'id,user_id,username,account_type')
  profileUrl.searchParams.set('access_token', longLived.access_token)
  const profile = await readInstagramResponse<{
    id?: string
    user_id?: string
    username?: string
    account_type?: string
  }>(await fetch(profileUrl))

  const expiresAt = longLived.expires_in
    ? new Date(Date.now() + longLived.expires_in * 1000)
    : undefined

  return {
    accessToken: longLived.access_token,
    instagramUserId: profile.user_id || profile.id || String(shortLived.user_id || ''),
    username: profile.username || 'connected-account',
    accountType: profile.account_type,
    tokenType: longLived.token_type,
    expiresAt,
    scopes: shortLived.permissions || config.scopes,
  }
}

export async function refreshInstagramConnection(connection: InstagramConnection) {
  const refreshUrl = new URL('https://graph.instagram.com/refresh_access_token')
  refreshUrl.searchParams.set('grant_type', 'ig_refresh_token')
  refreshUrl.searchParams.set('access_token', connection.accessToken)

  const refreshed = await readInstagramResponse<{
    access_token: string
    token_type?: string
    expires_in?: number
  }>(await fetch(refreshUrl))

  return {
    accessToken: refreshed.access_token,
    tokenType: refreshed.token_type,
    expiresAt: refreshed.expires_in
      ? new Date(Date.now() + refreshed.expires_in * 1000)
      : connection.expiresAt,
  }
}

export async function createInstagramMediaContainer(input: {
  connection: InstagramConnection
  imageUrl: string
  caption: string
}) {
  const response = await fetch(apiUrl(`/${input.connection.instagramUserId}/media`), {
    method: 'POST',
    body: new URLSearchParams({
      image_url: input.imageUrl,
      caption: input.caption,
      access_token: input.connection.accessToken,
    }),
  })
  return readInstagramResponse<{ id: string }>(response)
}

export async function publishInstagramMedia(input: {
  connection: InstagramConnection
  creationId: string
}) {
  const response = await fetch(apiUrl(`/${input.connection.instagramUserId}/media_publish`), {
    method: 'POST',
    body: new URLSearchParams({
      creation_id: input.creationId,
      access_token: input.connection.accessToken,
    }),
  })
  return readInstagramResponse<{ id: string }>(response)
}
