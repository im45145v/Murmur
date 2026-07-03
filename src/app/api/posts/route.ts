import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { GeneratedPostModel } from '@/lib/models'
import { generateId } from '@/lib/utils'
import { isApiResponse, requireAdmin } from '@/lib/server/api-auth'

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request)
    if (isApiResponse(admin)) return admin

    await connectDB()
    const posts = await GeneratedPostModel.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json(posts)
  } catch (error) {
    console.error('GET /api/posts error:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request)
    if (isApiResponse(admin)) return admin

    await connectDB()
    const data = await request.json()

    const post = await GeneratedPostModel.create({
      id: data.id || generateId(),
      submissionId: data.submissionId,
      templateId: data.templateId,
      themeId: data.themeId,
      captionId: data.captionId || '',
      captionText: data.captionText || '',
      assetUrl: data.assetUrl,
      assetKey: data.assetKey,
      mimeType: data.mimeType,
      width: data.width,
      height: data.height,
      byteSize: data.byteSize,
      checksum: data.checksum,
      rendererVersion: data.rendererVersion,
      publishStatus: data.publishStatus || 'rendered',
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('POST /api/posts error:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
