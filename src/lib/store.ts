import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Submission, CaptionSuggestion, Template, GeneratedPost, AppSettings, AdminAction, PostCategory } from './types'
import { defaultTemplates } from './template-registry'
import { generateCaptions as genCaps } from './caption-generator'
import { analyzeRisk } from './moderation'
import { generateId } from './utils'

const API_BASE = '/api'

async function api<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

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
  hydrated: boolean

  fetchSubmissions: () => Promise<void>
  fetchSettings: () => Promise<void>
  fetchPosts: () => Promise<void>
  addSubmission: (data: Omit<Submission, 'id' | 'riskLevel' | 'moderationFlags' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<string>
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
      submissions: [],
      generatedPosts: [],
      captions: [],
      templates: defaultTemplates,
      settings: defaultSettings,
      selectedSubmissionId: null,
      adminActions: [],
      hydrated: false,

      fetchSubmissions: async () => {
        const data = await api<Submission[]>('/submissions')
        set({ submissions: data ?? [], hydrated: true })
      },

      fetchSettings: async () => {
        const data = await api<AppSettings>('/settings')
        if (data) set({ settings: data })
      },

      fetchPosts: async () => {
        const data = await api<GeneratedPost[]>('/posts')
        if (data) set({ generatedPosts: data })
      },

      addSubmission: async (data) => {
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
        // Persist to DB first — throw if it fails so the form can show an error
        const saved = await api('/submissions', { method: 'POST', body: JSON.stringify(submission) })
        if (!saved) throw new Error('Failed to save submission')
        // Update local state after successful save
        set((state) => ({ submissions: [submission, ...state.submissions] }))
        return id
      },

      updateSubmission: (id, updates) => {
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
          ),
        }))
        api(`/submissions/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
      },

      approveSubmission: (id) => {
        const updates = { status: 'approved' as const, approvedAt: new Date(), updatedAt: new Date() }
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }))
        api(`/submissions/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
      },

      rejectSubmission: (id) => {
        const updates = { status: 'rejected' as const, rejectedAt: new Date(), updatedAt: new Date() }
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }))
        api(`/submissions/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
      },

      markAsPosted: (id) => {
        const updates = { status: 'posted' as const, postedAt: new Date(), updatedAt: new Date() }
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }))
        api(`/submissions/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
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
        // Also generate on server
        api(`/submissions/${submissionId}/captions`, { method: 'POST' })
      },

      selectCaption: (submissionId, captionId) => {
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === submissionId ? { ...s, captionSelected: captionId, updatedAt: new Date() } : s
          ),
        }))
        api(`/submissions/${submissionId}`, { method: 'PATCH', body: JSON.stringify({ captionSelected: captionId }) })
      },

      setSubmissionTemplate: (submissionId, templateId) => {
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === submissionId ? { ...s, templateId, updatedAt: new Date() } : s
          ),
        }))
        api(`/submissions/${submissionId}`, { method: 'PATCH', body: JSON.stringify({ templateId }) })
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
        api('/posts', { method: 'POST', body: JSON.stringify(newPost) })
      },

      markPostDownloaded: (postId) => {
        set((state) => ({
          generatedPosts: state.generatedPosts.map((p) =>
            p.id === postId ? { ...p, downloadedAt: new Date() } : p
          ),
        }))
        api(`/posts/${postId}`, { method: 'PATCH', body: JSON.stringify({ downloadedAt: new Date() }) })
      },

      updateSettings: (updates) => {
        set((state) => ({ settings: { ...state.settings, ...updates } }))
        api('/settings', { method: 'PATCH', body: JSON.stringify(updates) })
      },

      setSelectedSubmission: (id) => {
        set({ selectedSubmissionId: id })
      },
    }),
    {
      name: 'murmur-store',
      partialize: (state) => ({
        captions: state.captions,
        templates: state.templates,
      }),
    }
  )
)
