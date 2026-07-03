import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { InstagramConnectionModel } from '@/lib/models'
import { verifyState } from '@/lib/server/admin-session'
import { recordAdminAction } from '@/lib/server/audit'
import { exchangeCodeForInstagramConnection } from '@/lib/server/instagram'

interface InstagramState {
  adminId?: string
  returnTo?: string
}

function redirectTo(request: Request, path: string, status: 'connected' | 'error', message?: string) {
  const url = new URL(path, request.url)
  url.searchParams.set('instagram', status)
  if (message) url.searchParams.set('message', message.slice(0, 180))
  return NextResponse.redirect(url)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = await verifyState<InstagramState>(url.searchParams.get('state'))
  const returnTo = state?.returnTo || '/admin/settings'

  if (!code || !state?.adminId) {
    return redirectTo(request, returnTo, 'error', 'Missing or invalid Instagram authorization state.')
  }

  try {
    await connectDB()
    const connection = await exchangeCodeForInstagramConnection(code)

    await InstagramConnectionModel.findOneAndUpdate(
      { key: 'primary' },
      {
        $set: {
          key: 'primary',
          instagramUserId: connection.instagramUserId,
          username: connection.username,
          accountType: connection.accountType,
          accessToken: connection.accessToken,
          tokenType: connection.tokenType,
          expiresAt: connection.expiresAt,
          scopes: connection.scopes,
          status: 'connected',
          lastRefreshedAt: new Date(),
          lastError: undefined,
        },
      },
      { new: true, upsert: true }
    )

    await recordAdminAction({
      adminId: state.adminId,
      action: 'instagram_connected',
      targetType: 'instagram_connection',
      targetId: 'primary',
      metadata: {
        username: connection.username,
        instagramUserId: connection.instagramUserId,
      },
    })

    return redirectTo(request, returnTo, 'connected')
  } catch (error) {
    console.error('GET /api/integrations/instagram/callback error:', error)
    return redirectTo(request, returnTo, 'error', error instanceof Error ? error.message : 'Instagram connection failed.')
  }
}
