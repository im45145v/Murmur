import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { GeneratedPostModel, SubmissionModel } from '@/lib/models'
import { isApiResponse, requireAdmin } from '@/lib/server/api-auth'
import { recordAdminAction } from '@/lib/server/audit'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request)
    if (isApiResponse(admin)) return admin

    await connectDB()
    const { id } = await params
    const now = new Date()
    const post = await GeneratedPostModel.findOneAndUpdate(
      { id },
      {
        $set: {
          publishStatus: 'manual',
          manualPublishedAt: now,
          publishError: undefined,
        },
      },
      { new: true }
    ).lean()

    if (!post) {
      return NextResponse.json({ error: 'Generated post not found' }, { status: 404 })
    }

    await SubmissionModel.findOneAndUpdate(
      { id: post.submissionId },
      { $set: { status: 'posted', postedAt: now, updatedAt: now } }
    )

    await recordAdminAction({
      adminId: admin.sub,
      submissionId: post.submissionId,
      action: 'manual_published',
      targetType: 'generated_post',
      targetId: id,
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('POST /api/posts/[id]/manual-publish error:', error)
    return NextResponse.json({ error: 'Failed to mark post as manually published' }, { status: 500 })
  }
}
