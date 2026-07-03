import mongoose, { Schema, type Document } from 'mongoose'
import type { InstagramConnection } from '../types'

const InstagramConnectionSchema = new Schema<InstagramConnection & Document>(
  {
    key: { type: String, required: true, unique: true, default: 'primary' },
    instagramUserId: { type: String, required: true },
    username: { type: String, required: true },
    accountType: String,
    accessToken: { type: String, required: true },
    tokenType: String,
    expiresAt: Date,
    scopes: [String],
    status: {
      type: String,
      enum: ['connected', 'expired', 'error'],
      default: 'connected',
      index: true,
    },
    lastRefreshedAt: Date,
    lastPublishAt: Date,
    lastError: String,
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
)

export const InstagramConnectionModel =
  mongoose.models.InstagramConnection || mongoose.model('InstagramConnection', InstagramConnectionSchema)
