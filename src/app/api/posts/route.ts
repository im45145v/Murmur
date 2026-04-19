import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { GeneratedPostModel } from '@/lib/models'
import { generateId } from '@/lib/utils'

export async function GET() {
  try {
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
    await connectDB()
    const data = await request.json()

    const post = await GeneratedPostModel.create({
      ...data,
      id: data.id || generateId(),
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('POST /api/posts error:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
