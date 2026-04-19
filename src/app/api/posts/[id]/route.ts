import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { GeneratedPostModel } from '@/lib/models'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    await connectDB()
    const { id } = await params
    const updates = await request.json()

    const post = await GeneratedPostModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    ).lean()

    if (!post) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(post)
  } catch (error) {
    console.error('PATCH /api/posts/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}
