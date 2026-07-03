import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { GeneratedPostModel } from '@/lib/models'
import { isApiResponse, requireAdmin, validationError } from '@/lib/server/api-auth'
import { recordAdminAction } from '@/lib/server/audit'
import { GeneratedPostPatchSchema } from '@/lib/server/validation'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request)
    if (isApiResponse(admin)) return admin

    await connectDB()
    const { id } = await params
    const post = await GeneratedPostModel.findOne({ id }).lean()
    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(post)
  } catch (error) {
    console.error('GET /api/posts/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request)
    if (isApiResponse(admin)) return admin

    await connectDB()
    const { id } = await params
    const parsed = GeneratedPostPatchSchema.safeParse(await request.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const post = await GeneratedPostModel.findOneAndUpdate(
      { id },
      { $set: parsed.data },
      { new: true }
    ).lean()

    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    await recordAdminAction({
      adminId: admin.sub,
      submissionId: post.submissionId,
      action: parsed.data.downloadedAt ? 'downloaded' : 'edited',
      targetType: 'generated_post',
      targetId: id,
      newValue: JSON.stringify(parsed.data),
    })
    return NextResponse.json(post)
  } catch (error) {
    console.error('PATCH /api/posts/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}
