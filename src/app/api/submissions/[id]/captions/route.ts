import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { CaptionModel } from '@/lib/models'
import { SubmissionModel } from '@/lib/models'
import { generateCaptions } from '@/lib/caption-generator'
import { isApiResponse, requireAdmin } from '@/lib/server/api-auth'
import { recordAdminAction } from '@/lib/server/audit'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request)
    if (isApiResponse(admin)) return admin

    await connectDB()
    const { id } = await params
    const captions = await CaptionModel.find({ submissionId: id }).lean()
    return NextResponse.json(captions)
  } catch (error) {
    console.error('GET /api/submissions/[id]/captions error:', error)
    return NextResponse.json({ error: 'Failed to fetch captions' }, { status: 500 })
  }
}

export async function POST(
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
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Remove old captions for this submission
    await CaptionModel.deleteMany({ submissionId: id })

    // Generate new captions
    const newCaptions = generateCaptions(submission as Parameters<typeof generateCaptions>[0])

    // Save to DB
    await CaptionModel.insertMany(newCaptions)
    await recordAdminAction({
      adminId: admin.sub,
      submissionId: id,
      action: 'caption_selected',
      targetType: 'caption',
      targetId: id,
      metadata: { generated: newCaptions.length },
    })

    return NextResponse.json(newCaptions, { status: 201 })
  } catch (error) {
    console.error('POST /api/submissions/[id]/captions error:', error)
    return NextResponse.json({ error: 'Failed to generate captions' }, { status: 500 })
  }
}
