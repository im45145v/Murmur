import mongoose, { Schema, type Document } from 'mongoose'
import type { CaptionSuggestion } from '../types'

const CaptionSchema = new Schema<CaptionSuggestion & Document>(
  {
    id: { type: String, required: true, unique: true, index: true },
    submissionId: { type: String, required: true, index: true },
    style: {
      type: String,
      enum: ['soft_reflective', 'neutral_admin_safe', 'page_brand_voice'],
      required: true,
    },
    text: { type: String, required: true },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

export const CaptionModel =
  mongoose.models.Caption || mongoose.model('Caption', CaptionSchema)
