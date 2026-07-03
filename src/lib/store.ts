import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Submission, CaptionSuggestion, Template, GeneratedPost, AppSettings, AdminAction, PostCategory } from './types'
import { defaultTemplates } from './template-registry'
import { generateCaptions as genCaps } from './caption-generator'
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

async function apiOrThrow<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`)
  }
  return data as T
}

const defaultSettings: AppSettings = {
  pageBranding: 'Murmur',
  defaultCaptionSignoff: '- Murmur',
  moderationThreshold: 'Medium',
  maxCharacterLength: 1000,
  defaultTemplateByCategory: {
    Confession: 'scrapbook',
    Gossip: 'bold-card',
    Frustration: 'handwritten',
    'Horror Story / Weird Experiences': 'confession',
    'Good/Bad Experiences': 'journal',
    Advice: 'bold-card',
    Feedback: 'journal',
    Other: 'framed-note',
  },
  exportImageSize: 1080,
  watermarkEnabled: true,
  footerSignatureFormat: '- Murmur',
}

interface RenderGeneratedPostInput {
  submissionId: string
  templateId: string
  themeId: string
  captionId: string
  captionText: string
  imageDataUrl: string
  width: number
  height: number
  rendererVersion?: string
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

  fetchCaptionsForSubmission: (submissionId: string) => Promise<void>
  generateCaptionsForSubmission: (submissionId: string) => void
  selectCaption: (submissionId: string, captionId: string) => void

  setSubmissionTemplate: (submissionId: string, templateId: string) => void
  toggleTemplate: (templateId: string) => void
  updateTemplateDefaults: (templateId: string, categories: PostCategory[]) => void

  addGeneratedPost: (post: Omit<GeneratedPost, 'id' | 'createdAt' | 'publishStatus'> & Partial<Pick<GeneratedPost, 'publishStatus'>>) => void
  renderGeneratedPost: (post: RenderGeneratedPostInput) => Promise<GeneratedPost>
  markPostDownloaded: (postId: string) => void
  publishGeneratedPost: (postId: string) => Promise<GeneratedPost>
  manualPublishPost: (postId: string) => Promise<GeneratedPost>

  updateSettings: (updates: Partial<AppSettings>) => void
  setSelectedSubmission: (id: string | null) => void
}

function upsertPost(posts: GeneratedPost[], post: GeneratedPost) {
  const exists = posts.some((p) => p.id === post.id)
  return exists ? posts.map((p) => (p.id === post.id ? post : p)) : [post, ...posts]
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
        const saved = await apiOrThrow<Submission>('/submissions', {
          method: 'POST',
          body: JSON.stringify(data),
        })
        set((state) => ({ submissions: [saved, ...state.submissions] }))
        return saved.id
      },

      updateSubmission: (id, updates) => {
        const payload: Partial<Submission> = { ...updates }
        if ('editedText' in payload && payload.editedText === undefined) {
          payload.editedText = null as unknown as undefined
        }

        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
          ),
        }))
        apiOrThrow<Submission>(`/submissions/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
          .then((saved) => {
            set((state) => ({
              submissions: state.submissions.map((s) => (s.id === id ? saved : s)),
            }))
          })
          .catch(() => get().fetchSubmissions())
      },

      approveSubmission: (id) => {
        const updates = { status: 'approved' as const, approvedAt: new Date(), updatedAt: new Date() }
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }))
        apiOrThrow<Submission>(`/submissions/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
          .then((saved) => set((state) => ({ submissions: state.submissions.map((s) => (s.id === id ? saved : s)) })))
          .catch(() => get().fetchSubmissions())
      },

      rejectSubmission: (id) => {
        const updates = { status: 'rejected' as const, rejectedAt: new Date(), updatedAt: new Date() }
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }))
        apiOrThrow<Submission>(`/submissions/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
          .then((saved) => set((state) => ({ submissions: state.submissions.map((s) => (s.id === id ? saved : s)) })))
          .catch(() => get().fetchSubmissions())
      },

      markAsPosted: (id) => {
        const updates = { status: 'posted' as const, postedAt: new Date(), updatedAt: new Date() }
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }))
        apiOrThrow<Submission>(`/submissions/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
          .then((saved) => set((state) => ({ submissions: state.submissions.map((s) => (s.id === id ? saved : s)) })))
          .catch(() => get().fetchSubmissions())
      },

      fetchCaptionsForSubmission: async (submissionId) => {
        const captions = await api<CaptionSuggestion[]>(`/submissions/${submissionId}/captions`)
        if (!captions) return
        set((state) => ({
          captions: [
            ...state.captions.filter((c) => c.submissionId !== submissionId),
            ...captions,
          ],
        }))
      },

      generateCaptionsForSubmission: (submissionId) => {
        const submission = get().submissions.find((s) => s.id === submissionId)
        if (!submission) return
        const fallbackCaptions = genCaps(submission)
        set((state) => ({
          captions: [
            ...state.captions.filter((c) => c.submissionId !== submissionId),
            ...fallbackCaptions,
          ],
        }))
        apiOrThrow<CaptionSuggestion[]>(`/submissions/${submissionId}/captions`, { method: 'POST' })
          .then((newCaptions) => {
            set((state) => ({
              captions: [
                ...state.captions.filter((c) => c.submissionId !== submissionId),
                ...newCaptions,
              ],
            }))
          })
          .catch(() => undefined)
      },

      selectCaption: (submissionId, captionId) => {
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === submissionId ? { ...s, captionSelected: captionId, updatedAt: new Date() } : s
          ),
        }))
        apiOrThrow<Submission>(`/submissions/${submissionId}`, { method: 'PATCH', body: JSON.stringify({ captionSelected: captionId }) })
          .then((saved) => set((state) => ({ submissions: state.submissions.map((s) => (s.id === submissionId ? saved : s)) })))
          .catch(() => get().fetchSubmissions())
      },

      setSubmissionTemplate: (submissionId, templateId) => {
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === submissionId ? { ...s, templateId, updatedAt: new Date() } : s
          ),
        }))
        apiOrThrow<Submission>(`/submissions/${submissionId}`, { method: 'PATCH', body: JSON.stringify({ templateId }) })
          .then((saved) => set((state) => ({ submissions: state.submissions.map((s) => (s.id === submissionId ? saved : s)) })))
          .catch(() => get().fetchSubmissions())
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
        const newPost: GeneratedPost = { publishStatus: 'rendered', ...post, id: generateId(), createdAt: new Date() }
        set((state) => ({ generatedPosts: [newPost, ...state.generatedPosts] }))
        api('/posts', { method: 'POST', body: JSON.stringify(newPost) })
      },

      renderGeneratedPost: async (post) => {
        const newPost = await apiOrThrow<GeneratedPost>('/posts/render', {
          method: 'POST',
          body: JSON.stringify(post),
        })
        set((state) => ({ generatedPosts: upsertPost(state.generatedPosts, newPost) }))
        return newPost
      },

      markPostDownloaded: (postId) => {
        const downloadedAt = new Date()
        set((state) => ({
          generatedPosts: state.generatedPosts.map((p) =>
            p.id === postId ? { ...p, downloadedAt } : p
          ),
        }))
        api(`/posts/${postId}`, { method: 'PATCH', body: JSON.stringify({ downloadedAt }) })
      },

      publishGeneratedPost: async (postId) => {
        const post = await apiOrThrow<GeneratedPost>(`/posts/${postId}/publish`, { method: 'POST' })
        set((state) => ({
          generatedPosts: upsertPost(state.generatedPosts, post),
          submissions: state.submissions.map((s) =>
            s.id === post.submissionId ? { ...s, status: 'posted', postedAt: post.publishedAt ?? new Date(), updatedAt: new Date() } : s
          ),
        }))
        return post
      },

      manualPublishPost: async (postId) => {
        const post = await apiOrThrow<GeneratedPost>(`/posts/${postId}/manual-publish`, { method: 'POST' })
        set((state) => ({
          generatedPosts: upsertPost(state.generatedPosts, post),
          submissions: state.submissions.map((s) =>
            s.id === post.submissionId ? { ...s, status: 'posted', postedAt: post.manualPublishedAt ?? new Date(), updatedAt: new Date() } : s
          ),
        }))
        return post
      },

      updateSettings: (updates) => {
        set((state) => ({ settings: { ...state.settings, ...updates } }))
        apiOrThrow<AppSettings>('/settings', { method: 'PATCH', body: JSON.stringify(updates) })
          .then((settings) => set({ settings }))
          .catch(() => get().fetchSettings())
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
