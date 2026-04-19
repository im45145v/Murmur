import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { SubmissionModel } from '@/lib/models'
import { analyzeRisk } from '@/lib/moderation'
import { generateId } from '@/lib/utils'

export async function GET() {
  try {
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
    const data = await request.json()

    // If client already computed moderation, use it; otherwise compute server-side
    let riskLevel = data.riskLevel
    let moderationFlags = data.moderationFlags
    if (!riskLevel || !moderationFlags) {
      const result = analyzeRisk(data.bodyText, data.triggerFlag)
      riskLevel = result.riskLevel
      moderationFlags = result.flags
    }

    const id = data.id || generateId()

    const submission = await SubmissionModel.create({
      ...data,
      id,
      riskLevel,
      moderationFlags,
      status: data.status || 'pending',
    })

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error('POST /api/submissions error:', error)
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 })
  }
}
