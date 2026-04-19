import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { SubmissionModel } from '@/lib/models'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    await connectDB()
    const { id } = await params
    const updates = await request.json()

    const submission = await SubmissionModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    ).lean()

    if (!submission) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(submission)
  } catch (error) {
    console.error('PATCH /api/submissions/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const result = await SubmissionModel.findOneAndDelete({ id })
    if (!result) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/submissions/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 })
  }
}
