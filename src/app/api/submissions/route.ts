import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { SubmissionModel } from '@/lib/models'
import { analyzeRisk } from '@/lib/moderation'
import { generateId } from '@/lib/utils'
import { isApiResponse, requireAdmin, validationError } from '@/lib/server/api-auth'
import { PublicSubmissionCreateSchema } from '@/lib/server/validation'

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request)
    if (isApiResponse(admin)) return admin

    await connectDB()
    const submissions = await SubmissionModel.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json(submissions)
  } catch (error) {
    console.error('GET /api/submissions error:', error)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const parsed = PublicSubmissionCreateSchema.safeParse(await request.json())
    if (!parsed.success) return validationError(parsed.error.flatten())

    const data = parsed.data
    const { riskLevel, flags: moderationFlags } = analyzeRisk(data.bodyText, data.triggerFlag)

    const submission = await SubmissionModel.create({
      ...data,
      id: generateId(),
      riskLevel,
      moderationFlags,
      status: 'pending',
    })

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('POST /api/submissions error:', error)
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 })
  }
}
