import { NextResponse } from 'next/server'
import { isApiResponse, requireAdmin } from '@/lib/server/api-auth'
import { signState } from '@/lib/server/admin-session'
import { buildInstagramAuthUrl } from '@/lib/server/instagram'

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request)
    if (isApiResponse(admin)) return admin

    const state = await signState({ adminId: admin.sub, returnTo: '/admin/settings' })
    return NextResponse.json({ url: buildInstagramAuthUrl(state) })
  } catch (error) {
    console.error('GET /api/integrations/instagram/auth-url error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to build Instagram authorization URL' }, { status: 500 })
  }
}
