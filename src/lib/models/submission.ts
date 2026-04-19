import mongoose, { Schema, type Document } from 'mongoose'
import type { Submission as SubmissionType, ModerationFlag } from '../types'

const ModerationFlagSchema = new Schema<ModerationFlag>(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      enum: ['explicit_insult', 'sexual_content', 'abuse_allegation', 'self_harm', 'direct_identification', 'defamatory', 'hate_speech', 'profanity'],
      required: true,
    },
    description: { type: String, required: true },
    severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
    excerpt: { type: String, required: true },
  },
  { _id: false }
)

const SubmissionSchema = new Schema<SubmissionType & Document>(
  {
    id: { type: String, required: true, unique: true, index: true },
    submitterName: { type: String, required: true },
    submitterProgram: { type: String, required: true },
    submitterBatch: { type: String, required: true },
    targetName: { type: String, required: true },
    targetProgram: { type: String, required: true },
    targetBatch: { type: String, required: true },
    fromInitials: String,
    toInitials: String,
    preferredTemplateId: String,
    category: {
      type: String,
      enum: ['Confession', 'Gossip', 'Frustration', 'Horror Story / Weird Experiences', 'Good/Bad Experiences', 'Advice', 'Feedback', 'Other'],
      required: true,
    },
    bodyText: { type: String, required: true },
    editedText: String,
    triggerFlag: { type: String, enum: ['Yes', 'No', 'Maybe'], required: true },
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
    moderationFlags: [ModerationFlagSchema],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'draft', 'posted'],
      default: 'pending',
    },
    templateId: String,
    captionSelected: String,
    approvedAt: Date,
    rejectedAt: Date,
    postedAt: Date,
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
)

export const SubmissionModel =
  mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema)
