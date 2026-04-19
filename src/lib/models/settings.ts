import mongoose, { Schema, type Document } from 'mongoose'
import type { AppSettings } from '../types'

const SettingsSchema = new Schema<AppSettings & Document & { key: string }>(
  {
    key: { type: String, required: true, unique: true, default: 'global' },
    pageBranding: { type: String, default: 'Murmur' },
    defaultCaptionSignoff: { type: String, default: '— Murmur' },
    moderationThreshold: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    maxCharacterLength: { type: Number, default: 1000 },
    defaultTemplateByCategory: { type: Schema.Types.Mixed, default: {} },
    exportImageSize: { type: Number, default: 1080 },
    watermarkEnabled: { type: Boolean, default: true },
    footerSignatureFormat: { type: String, default: '— Murmur' },
  },
  { timestamps: true }
)

export const SettingsModel =
  mongoose.models.Settings || mongoose.model('Settings', SettingsSchema)
