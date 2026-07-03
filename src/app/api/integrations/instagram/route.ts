import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { InstagramConnectionModel } from '@/lib/models'
import { isApiResponse, requireAdmin } from '@/lib/server/api-auth'

function publicConnection(connection: Record<string, unknown> | null) {
  if (!connection) return null
  const { accessToken: _accessToken, ...safeConnection } = connection
  return safeConnection
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request)
    if (isApiResponse(admin)) return admin

    await connectDB()
    const connection = await InstagramConnectionModel.findOne({ key: 'primary' }).lean()

    return NextResponse.json({
      configured: Boolean(
        process.env.INSTAGRAM_CLIENT_ID &&
        process.env.INSTAGRAM_CLIENT_SECRET &&
        process.env.INSTAGRAM_REDIRECT_URI
      ),
      connection: publicConnection(connection as Record<string, unknown> | null),
    })
  } catch (error) {
    console.error('GET /api/integrations/instagram error:', error)
    return NextResponse.json({ error: 'Failed to load Instagram status' }, { status: 500 })
  }
}
