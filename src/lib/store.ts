import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Submission, CaptionSuggestion, Template, GeneratedPost, AppSettings, AdminAction, PostCategory } from './types'
import { seedSubmissions } from './seed-data'
import { defaultTemplates } from './template-registry'
import { generateCaptions as genCaps } from './caption-generator'
import { analyzeRisk } from './moderation'
import { generateId } from './utils'

const defaultSettings: AppSettings = {
  pageBranding: 'Murmur',
  defaultCaptionSignoff: '— Murmur',
  moderationThreshold: 'Medium',
  maxCharacterLength: 1000,
  defaultTemplateByCategory: {
    'Confession': 'scrapbook',
    'Gossip': 'bold-card',
    'Frustration': 'handwritten',
    'Horror Story / Weird Experiences': 'confession',
    'Good/Bad Experiences': 'journal',
    'Advice': 'bold-card',
    'Feedback': 'journal',
    'Other': 'framed-note',
  },
  exportImageSize: 1080,
  watermarkEnabled: true,
  footerSignatureFormat: '— Murmur',
}

interface StoreState {
  submissions: Submission[]
  generatedPosts: GeneratedPost[]
  captions: CaptionSuggestion[]
  templates: Template[]
  settings: AppSettings
  selectedSubmissionId: string | null
  adminActions: AdminAction[]

  addSubmission: (data: Omit<Submission, 'id' | 'riskLevel' | 'moderationFlags' | 'status' | 'createdAt' | 'updatedAt'>) => string
  updateSubmission: (id: string, updates: Partial<Submission>) => void
  approveSubmission: (id: string) => void
  rejectSubmission: (id: string) => void
  markAsPosted: (id: string) => void

  generateCaptionsForSubmission: (submissionId: string) => void
  selectCaption: (submissionId: string, captionId: string) => void

  setSubmissionTemplate: (submissionId: string, templateId: string) => void
  toggleTemplate: (templateId: string) => void
  updateTemplateDefaults: (templateId: string, categories: PostCategory[]) => void

  addGeneratedPost: (post: Omit<GeneratedPost, 'id' | 'createdAt'>) => void
  markPostDownloaded: (postId: string) => void

  updateSettings: (updates: Partial<AppSettings>) => void
  setSelectedSubmission: (id: string | null) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      submissions: seedSubmissions,
      generatedPosts: [],
      captions: [],
      templates: defaultTemplates,
      settings: defaultSettings,
      selectedSubmissionId: null,
      adminActions: [],

      addSubmission: (data) => {
        const { riskLevel, flags } = analyzeRisk(data.bodyText, data.triggerFlag)
        const id = generateId()
        const now = new Date()
        const submission: Submission = {
          ...data,
          id,
          riskLevel,
          moderationFlags: flags,
          status: 'pending',
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ submissions: [submission, ...state.submissions] }))
        return id
      },

      updateSubmission: (id, updates) => {
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
          ),
        }))
      },

      approveSubmission: (id) => {
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === id ? { ...s, status: 'approved', approvedAt: new Date(), updatedAt: new Date() } : s
          ),
        }))
      },

      rejectSubmission: (id) => {
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === id ? { ...s, status: 'rejected', rejectedAt: new Date(), updatedAt: new Date() } : s
          ),
        }))
      },

      markAsPosted: (id) => {
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === id ? { ...s, status: 'posted', postedAt: new Date(), updatedAt: new Date() } : s
          ),
        }))
      },

      generateCaptionsForSubmission: (submissionId) => {
        const submission = get().submissions.find((s) => s.id === submissionId)
        if (!submission) return
        const newCaptions = genCaps(submission)
        set((state) => ({
          captions: [
            ...state.captions.filter((c) => c.submissionId !== submissionId),
            ...newCaptions,
          ],
        }))
      },

      selectCaption: (submissionId, captionId) => {
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === submissionId ? { ...s, captionSelected: captionId, updatedAt: new Date() } : s
          ),
        }))
      },

      setSubmissionTemplate: (submissionId, templateId) => {
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === submissionId ? { ...s, templateId, updatedAt: new Date() } : s
          ),
        }))
      },

      toggleTemplate: (templateId) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId ? { ...t, isEnabled: !t.isEnabled } : t
          ),
        }))
      },

      updateTemplateDefaults: (templateId, categories) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId ? { ...t, defaultForCategories: categories } : t
          ),
        }))
      },

      addGeneratedPost: (post) => {
        const newPost: GeneratedPost = { ...post, id: generateId(), createdAt: new Date() }
        set((state) => ({ generatedPosts: [newPost, ...state.generatedPosts] }))
      },

      markPostDownloaded: (postId) => {
        set((state) => ({
          generatedPosts: state.generatedPosts.map((p) =>
            p.id === postId ? { ...p, downloadedAt: new Date() } : p
          ),
        }))
      },

      updateSettings: (updates) => {
        set((state) => ({ settings: { ...state.settings, ...updates } }))
      },

      setSelectedSubmission: (id) => {
        set({ selectedSubmissionId: id })
      },
    }),
    {
      name: 'murmur-store',
      partialize: (state) => ({
        submissions: state.submissions,
        generatedPosts: state.generatedPosts,
        captions: state.captions,
        templates: state.templates,
        settings: state.settings,
      }),
    }
  )
)
