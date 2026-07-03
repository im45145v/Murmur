import mongoose, { Schema, type Document } from 'mongoose'
import type { AdminAction } from '../types'

const AdminActionSchema = new Schema<AdminAction & Document>(
  {
    id: { type: String, required: true, unique: true, index: true },
    submissionId: { type: String, index: true },
    adminId: { type: String, required: true },
    action: { type: String, required: true, index: true },
    previousValue: String,
    newValue: String,
    targetType: String,
    targetId: String,
    metadata: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
)

export const AdminActionModel =
  mongoose.models.AdminAction || mongoose.model('AdminAction', AdminActionSchema)
