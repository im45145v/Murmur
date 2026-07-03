import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { GeneratedPostModel, InstagramConnectionModel, SubmissionModel } from '@/lib/models'
import { isApiResponse, requireAdmin } from '@/lib/server/api-auth'
import { recordAdminAction } from '@/lib/server/audit'
import { createInstagramMediaContainer, publishInstagramMedia, refreshInstagramConnection } from '@/lib/server/instagram'
import type { GeneratedPost, InstagramConnection } from '@/lib/types'

function shouldRefresh(connection: InstagramConnection) {
  if (!connection.expiresAt) return false
  return new Date(connection.expiresAt).getTime() < Date.now() + 1000 * 60 * 60 * 24 * 5
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request)
  if (isApiResponse(admin)) return admin

  await connectDB()
  const { id } = await params
  const post = await GeneratedPostModel.findOne({ id }).lean() as unknown as GeneratedPost | null

  if (!post) {
    return NextResponse.json({ error: 'Generated post not found' }, { status: 404 })
  }
  if (!post.assetUrl) {
    return NextResponse.json({ error: 'Render and upload the image before publishing.' }, { status: 409 })
  }
  if (post.publishStatus === 'published') {
    return NextResponse.json({ error: 'This post is already published.' }, { status: 409 })
  }

  const connectionDoc = await InstagramConnectionModel.findOne({ key: 'primary' }).lean()
  if (!connectionDoc) {
    return NextResponse.json({ error: 'Connect Instagram before publishing.' }, { status: 409 })
  }

  let connection = connectionDoc as unknown as InstagramConnection

  try {
    if (shouldRefresh(connection)) {
      const refreshed = await refreshInstagramConnection(connection)
      connection = { ...connection, ...refreshed, status: 'connected', lastRefreshedAt: new Date() }
      await InstagramConnectionModel.findOneAndUpdate(
        { key: 'primary' },
        {
          $set: {
            accessToken: connection.accessToken,
            tokenType: connection.tokenType,
            expiresAt: connection.expiresAt,
            status: 'connected',
            lastRefreshedAt: connection.lastRefreshedAt,
          },
        }
      )
    }

    await GeneratedPostModel.findOneAndUpdate(
      { id },
      { $set: { publishStatus: 'publishing', publishError: undefined } }
    )

    const container = await createInstagramMediaContainer({
      connection,
      imageUrl: post.assetUrl,
      caption: post.captionText || '',
    })

    await GeneratedPostModel.findOneAndUpdate(
      { id },
      { $set: { instagramContainerId: container.id, publishStatus: 'queued' } }
    )

    const published = await publishInstagramMedia({
      connection,
      creationId: container.id,
    })

    const now = new Date()
    const updatedPost = await GeneratedPostModel.findOneAndUpdate(
      { id },
      {
        $set: {
          instagramMediaId: published.id,
          publishStatus: 'published',
          publishedAt: now,
          publishError: undefined,
        },
      },
      { new: true }
    ).lean()

    await SubmissionModel.findOneAndUpdate(
      { id: post.submissionId },
      { $set: { status: 'posted', postedAt: now, updatedAt: now } }
    )

    await InstagramConnectionModel.findOneAndUpdate(
      { key: 'primary' },
      { $set: { lastPublishAt: now, status: 'connected', lastError: undefined } }
    )

    await recordAdminAction({
      adminId: admin.sub,
      submissionId: post.submissionId,
      action: 'instagram_published',
      targetType: 'generated_post',
      targetId: id,
      metadata: {
        instagramContainerId: container.id,
        instagramMediaId: published.id,
      },
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Instagram publish failed'
    const failedPost = await GeneratedPostModel.findOneAndUpdate(
      { id },
      { $set: { publishStatus: 'failed', publishError: message } },
      { new: true }
    ).lean()

    await InstagramConnectionModel.findOneAndUpdate(
      { key: 'primary' },
      { $set: { status: 'error', lastError: message } }
    )

    await recordAdminAction({
      adminId: admin.sub,
      submissionId: post.submissionId,
      action: 'instagram_publish_failed',
      targetType: 'generated_post',
      targetId: id,
      metadata: { error: message },
    })

    return NextResponse.json({ error: message, post: failedPost }, { status: 502 })
  }
}
