export type Program = 'IPM' | 'MBA' | 'MBA-HR' | 'MBA-BA' | 'PhD' | 'Prof.' | "Don't know" | 'Other'
export type Batch = '2025' | '2026' | '2027' | '2028' | '2029' | "Don't know" | 'Other'
export type PostCategory = 'Confession' | 'Gossip' | 'Frustration' | 'Horror Story / Weird Experiences' | 'Good/Bad Experiences' | 'Advice' | 'Feedback' | 'Other'
export type TriggerFlag = 'Yes' | 'No' | 'Maybe'
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical'
export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'draft' | 'posted'

export interface ModerationFlag {
  id: string
  type: 'explicit_insult' | 'sexual_content' | 'abuse_allegation' | 'self_harm' | 'direct_identification' | 'defamatory' | 'hate_speech' | 'profanity'
  description: string
  severity: RiskLevel
  excerpt: string
}

export interface Submission {
  id: string
  submitterName: string
  submitterProgram: Program
  submitterBatch: Batch
  targetName: string
  targetProgram: Program
  targetBatch: Batch
  fromInitials?: string
  toInitials?: string
  preferredTemplateId?: string
  category: PostCategory
  bodyText: string
  editedText?: string
  triggerFlag: TriggerFlag
  riskLevel: RiskLevel
  moderationFlags: ModerationFlag[]
  status: SubmissionStatus
  templateId?: string
  captionSelected?: string
  createdAt: Date
  updatedAt: Date
  approvedAt?: Date
  rejectedAt?: Date
  postedAt?: Date
}

export interface CaptionSuggestion {
  id: string
  submissionId: string
  style: 'soft_reflective' | 'neutral_admin_safe' | 'page_brand_voice'
  text: string
  generatedAt: Date
}

export interface Template {
  id: string
  name: string
  description: string
  thumbnailClass: string
  component: string
  themes: TemplateTheme[]
  defaultTheme: string
  isEnabled: boolean
  defaultForCategories: PostCategory[]
}

export interface TemplateTheme {
  id: string
  name: string
  colors: {
    background: string
    primary: string
    secondary: string
    text: string
    accent: string
  }
}

export interface GeneratedPost {
  id: string
  submissionId: string
  templateId: string
  themeId: string
  captionId: string
  imageDataUrl?: string
  createdAt: Date
  downloadedAt?: Date
}

export interface AdminAction {
  id: string
  submissionId: string
  adminId: string
  action: 'approved' | 'rejected' | 'edited' | 'rewritten' | 'grammar_fixed' | 'softened' | 'downloaded' | 'posted' | 'template_changed' | 'caption_selected'
  previousValue?: string
  newValue?: string
  timestamp: Date
}

export interface AppSettings {
  pageBranding: string
  defaultCaptionSignoff: string
  moderationThreshold: RiskLevel
  maxCharacterLength: number
  defaultTemplateByCategory: Record<PostCategory, string>
  exportImageSize: number
  watermarkEnabled: boolean
  footerSignatureFormat: string
}

export type FontId = 'cursive' | 'serif' | 'monospace' | 'sans' | 'display' | 'handwritten'

export interface FontOption {
  id: FontId
  name: string
  family: string
  preview: string
}
