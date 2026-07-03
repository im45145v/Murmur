import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { GeneratedPostModel, SettingsModel, SubmissionModel } from '@/lib/models'
import { isApiResponse, requireAdmin, validationError } from '@/lib/server/api-auth'
import { recordAdminAction } from '@/lib/server/audit'
import { createPostAssetKey, uploadPngDataUrlToR2 } from '@/lib/server/r2'
import { RenderPostSchema } from '@/lib/server/validation'
import { generateId } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request)
    if (isApiResponse(admin)) return admin

    await connectDB()
    const parsed = RenderPostSchema.safeParse(await request.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const data = parsed.data
    if (data.width !== data.height) {
      return NextResponse.json({ error: 'Instagram feed export must be square.' }, { status: 400 })
    }

    const submission = await SubmissionModel.findOne({ id: data.submissionId }).lean()
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }
    if (!['approved', 'posted'].includes(submission.status)) {
      return NextResponse.json({ error: 'Approve the submission before rendering a publishable asset.' }, { status: 409 })
    }

    const settings = await SettingsModel.findOne({ key: 'global' }).lean()
    const expectedSize = settings?.exportImageSize || 1080
    if (data.width !== expectedSize || data.height !== expectedSize) {
      return NextResponse.json({ error: `Export must be ${expectedSize}x${expectedSize}px.` }, { status: 400 })
    }

    const upload = await uploadPngDataUrlToR2({
      imageDataUrl: data.imageDataUrl,
      key: createPostAssetKey(data.submissionId),
      width: data.width,
      height: data.height,
    })

    const post = await GeneratedPostModel.create({
      id: generateId(),
      submissionId: data.submissionId,
      templateId: data.templateId,
      themeId: data.themeId,
      captionId: data.captionId,
      captionText: data.captionText,
      ...upload,
      rendererVersion: data.rendererVersion,
      publishStatus: 'rendered',
    })

    await recordAdminAction({
      adminId: admin.sub,
      submissionId: data.submissionId,
      action: 'rendered',
      targetType: 'generated_post',
      targetId: post.id,
      metadata: {
        assetKey: upload.assetKey,
        byteSize: upload.byteSize,
        width: upload.width,
        height: upload.height,
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('POST /api/posts/render error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to render post' }, { status: 500 })
  }
}
