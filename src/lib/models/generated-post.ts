import mongoose, { Schema, type Document } from 'mongoose'
import type { GeneratedPost } from '../types'

const GeneratedPostSchema = new Schema<GeneratedPost & Document>(
  {
    id: { type: String, required: true, unique: true, index: true },
    submissionId: { type: String, required: true, index: true },
    templateId: { type: String, required: true },
    themeId: { type: String, required: true },
    captionId: { type: String, required: true },
    captionText: String,
    assetUrl: String,
    assetKey: String,
    mimeType: String,
    width: Number,
    height: Number,
    byteSize: Number,
    checksum: String,
    rendererVersion: String,
    publishStatus: {
      type: String,
      enum: ['draft', 'rendered', 'queued', 'publishing', 'published', 'failed', 'manual'],
      default: 'rendered',
      index: true,
    },
    instagramContainerId: String,
    instagramMediaId: String,
    publishError: String,
    publishedAt: Date,
    manualPublishedAt: Date,
    imageDataUrl: String,
    downloadedAt: Date,
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
)

export const GeneratedPostModel =
  mongoose.models.GeneratedPost || mongoose.model('GeneratedPost', GeneratedPostSchema)
