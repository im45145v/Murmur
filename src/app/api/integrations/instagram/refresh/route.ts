import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { InstagramConnectionModel } from '@/lib/models'
import { isApiResponse, requireAdmin } from '@/lib/server/api-auth'
import { recordAdminAction } from '@/lib/server/audit'
import { refreshInstagramConnection } from '@/lib/server/instagram'
import type { InstagramConnection } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request)
    if (isApiResponse(admin)) return admin

    await connectDB()
    const connection = await InstagramConnectionModel.findOne({ key: 'primary' }).lean()
    if (!connection) {
      return NextResponse.json({ error: 'Instagram is not connected' }, { status: 404 })
    }

    const refreshed = await refreshInstagramConnection(connection as unknown as InstagramConnection)
    const updated = await InstagramConnectionModel.findOneAndUpdate(
      { key: 'primary' },
      {
        $set: {
          accessToken: refreshed.accessToken,
          tokenType: refreshed.tokenType,
          expiresAt: refreshed.expiresAt,
          status: 'connected',
          lastRefreshedAt: new Date(),
          lastError: undefined,
        },
      },
      { new: true }
    ).lean()

    await recordAdminAction({
      adminId: admin.sub,
      action: 'instagram_refreshed',
      targetType: 'instagram_connection',
      targetId: 'primary',
    })

    return NextResponse.json({ success: true, connection: updated })
  } catch (error) {
    console.error('POST /api/integrations/instagram/refresh error:', error)
    await InstagramConnectionModel.findOneAndUpdate(
      { key: 'primary' },
      { $set: { status: 'error', lastError: error instanceof Error ? error.message : 'Refresh failed' } }
    ).catch(() => undefined)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to refresh Instagram token' }, { status: 500 })
  }
}
