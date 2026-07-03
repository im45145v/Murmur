import { z } from 'zod'

export const ProgramSchema = z.enum(['IPM', 'MBA', 'MBA-HR', 'MBA-BA', 'PhD', 'Prof.', "Don't know", 'Other'])
export const BatchSchema = z.enum(['2025', '2026', '2027', '2028', '2029', "Don't know", 'Other'])
export const PostCategorySchema = z.enum(['Confession', 'Gossip', 'Frustration', 'Horror Story / Weird Experiences', 'Good/Bad Experiences', 'Advice', 'Feedback', 'Other'])
export const TriggerFlagSchema = z.enum(['Yes', 'No', 'Maybe'])
export const RiskLevelSchema = z.enum(['Low', 'Medium', 'High', 'Critical'])
export const SubmissionStatusSchema = z.enum(['pending', 'approved', 'rejected', 'draft', 'posted'])
export const PublishStatusSchema = z.enum(['draft', 'rendered', 'queued', 'publishing', 'published', 'failed', 'manual'])

const OptionalShortText = z.string().trim().max(80).optional().or(z.literal('')).transform((value) => value || undefined)

export const PublicSubmissionCreateSchema = z.object({
  submitterName: z.string().trim().min(1).max(100).default('Anonymous'),
  submitterProgram: ProgramSchema,
  submitterBatch: BatchSchema,
  targetName: z.string().trim().min(1).max(100),
  targetProgram: ProgramSchema,
  targetBatch: BatchSchema,
  fromInitials: OptionalShortText,
  toInitials: OptionalShortText,
  preferredTemplateId: OptionalShortText,
  category: PostCategorySchema,
  bodyText: z.string().trim().min(20).max(1000),
  triggerFlag: TriggerFlagSchema,
})

export const SubmissionPatchSchema = z.object({
  editedText: z.string().trim().max(1000).optional().nullable(),
  status: SubmissionStatusSchema.optional(),
  templateId: OptionalShortText,
  captionSelected: OptionalShortText,
  approvedAt: z.coerce.date().optional(),
  rejectedAt: z.coerce.date().optional(),
  postedAt: z.coerce.date().optional(),
}).strict()

export const SettingsPatchSchema = z.object({
  pageBranding: z.string().trim().min(1).max(80).optional(),
  defaultCaptionSignoff: z.string().trim().max(120).optional(),
  moderationThreshold: RiskLevelSchema.optional(),
  maxCharacterLength: z.number().int().min(100).max(3000).optional(),
  defaultTemplateByCategory: z.record(PostCategorySchema, z.string()).optional(),
  exportImageSize: z.number().int().min(720).max(2160).optional(),
  watermarkEnabled: z.boolean().optional(),
  footerSignatureFormat: z.string().trim().max(120).optional(),
}).strict()

export const RenderPostSchema = z.object({
  submissionId: z.string().trim().min(1),
  templateId: z.string().trim().min(1),
  themeId: z.string().trim().min(1),
  captionId: z.string().trim().optional().default(''),
  captionText: z.string().trim().max(2200).optional().default(''),
  imageDataUrl: z.string().startsWith('data:image/png;base64,'),
  width: z.number().int().min(720).max(2160),
  height: z.number().int().min(720).max(2160),
  rendererVersion: z.string().trim().max(40).optional().default('client-html2canvas-v2'),
})

export const GeneratedPostPatchSchema = z.object({
  downloadedAt: z.coerce.date().optional(),
  publishStatus: PublishStatusSchema.optional(),
  publishError: z.string().trim().max(1000).optional().nullable(),
}).strict()
