import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { SubmissionModel } from '@/lib/models'
import { isApiResponse, requireAdmin, validationError } from '@/lib/server/api-auth'
import { recordAdminAction } from '@/lib/server/audit'
import { SubmissionPatchSchema } from '@/lib/server/validation'
import type { AdminAction } from '@/lib/types'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request)
    if (isApiResponse(admin)) return admin

    await connectDB()
    const { id } = await params
    const submission = await SubmissionModel.findOne({ id }).lean()
    if (!submission) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(submission)
  } catch (error) {
    console.error('GET /api/submissions/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch submission' }, { status: 500 })
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
    const parsed = SubmissionPatchSchema.safeParse(await request.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const updates = parsed.data
    const unset: Record<string, string> = {}
    if (updates.editedText === null) {
      delete updates.editedText
      unset.editedText = ''
    }

    const existing = await SubmissionModel.findOne({ id }).lean()
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const submission = await SubmissionModel.findOneAndUpdate(
      { id },
      {
        ...(Object.keys(updates).length > 0 ? { $set: updates } : {}),
        ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
      },
      { new: true }
    ).lean()

    if (!submission) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const action: AdminAction['action'] =
      updates.status === 'approved' ? 'approved'
        : updates.status === 'rejected' ? 'rejected'
          : updates.status === 'posted' ? 'posted'
            : updates.templateId ? 'template_changed'
              : updates.captionSelected ? 'caption_selected'
                : updates.editedText !== undefined || unset.editedText ? 'edited'
                  : 'edited'
    await recordAdminAction({
      adminId: admin.sub,
      submissionId: id,
      action,
      previousValue: JSON.stringify(existing),
      newValue: JSON.stringify(submission),
      targetType: 'submission',
      targetId: id,
    })

    return NextResponse.json(submission)
  } catch (error) {
    console.error('PATCH /api/submissions/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request)
    if (isApiResponse(admin)) return admin

    await connectDB()
    const { id } = await params
    const result = await SubmissionModel.findOneAndDelete({ id })
    if (!result) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    await recordAdminAction({
      adminId: admin.sub,
      submissionId: id,
      action: 'rejected',
      previousValue: JSON.stringify(result),
      targetType: 'submission',
      targetId: id,
      metadata: { deleted: true },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/submissions/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 })
  }
}
