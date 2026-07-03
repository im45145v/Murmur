import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'

export async function GET() {
  const checks = {
    app: 'ok',
    mongo: 'unknown',
    r2Configured: Boolean(
      process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_PUBLIC_BASE_URL
    ),
    instagramConfigured: Boolean(
      process.env.INSTAGRAM_CLIENT_ID &&
      process.env.INSTAGRAM_CLIENT_SECRET &&
      process.env.INSTAGRAM_REDIRECT_URI
    ),
  }

  try {
    await connectDB()
    checks.mongo = 'ok'
    return NextResponse.json({ status: 'ok', checks })
  } catch (error) {
    checks.mongo = 'error'
    return NextResponse.json(
      {
        status: 'degraded',
        checks,
        error: error instanceof Error ? error.message : 'Mongo connection failed',
      },
      { status: 503 }
    )
  }
}
