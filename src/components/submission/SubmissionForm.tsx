'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useStore } from '@/lib/store'
import type { Program, Batch, PostCategory, TriggerFlag } from '@/lib/types'

const PROGRAMS: Program[] = ['IPM', 'MBA', 'MBA-HR', 'MBA-BA', 'PhD', 'Prof.', "Don't know", 'Other']
const BATCHES: Batch[] = ['2025', '2026', '2027', '2028', '2029', "Don't know", 'Other']
const CATEGORIES: PostCategory[] = ['Confession', 'Gossip', 'Frustration', 'Horror Story / Weird Experiences', 'Good/Bad Experiences', 'Advice', 'Feedback', 'Other']
const TRIGGER_FLAGS: TriggerFlag[] = ['Yes', 'No', 'Maybe']

const schema = z.object({
  submitterProgram: z.enum(['IPM', 'MBA', 'MBA-HR', 'MBA-BA', 'PhD', 'Prof.', "Don't know", 'Other'] as const),
  submitterBatch: z.enum(['2025', '2026', '2027', '2028', '2029', "Don't know", 'Other'] as const),
  targetName: z.string().min(1, 'Required').max(100),
  targetProgram: z.enum(['IPM', 'MBA', 'MBA-HR', 'MBA-BA', 'PhD', 'Prof.', "Don't know", 'Other'] as const),
  targetBatch: z.enum(['2025', '2026', '2027', '2028', '2029', "Don't know", 'Other'] as const),
  category: z.enum(['Confession', 'Gossip', 'Frustration', 'Horror Story / Weird Experiences', 'Good/Bad Experiences', 'Advice', 'Feedback', 'Other'] as const),
  bodyText: z.string().min(20, 'At least 20 characters').max(1000, 'Max 1000 characters'),
  triggerFlag: z.enum(['Yes', 'No', 'Maybe'] as const),
})

type FormValues = z.infer<typeof schema>

const DRAFT_KEY = 'murmur-draft'

interface Props {
  onSuccess: (id: string) => void
}

export default function SubmissionForm({ onSuccess }: Props) {
  const addSubmission = useStore((s) => s.addSubmission)
  const [hasDraft, setHasDraft] = useState(false)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      submitterProgram: 'IPM',
      submitterBatch: "Don't know",
      targetProgram: "Don't know",
      targetBatch: "Don't know",
      category: 'Confession',
      triggerFlag: 'No',
    },
  })

  const bodyText = watch('bodyText') ?? ''

  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY)
    if (draft) {
      try {
        const parsed = JSON.parse(draft) as Partial<FormValues>
        Object.entries(parsed).forEach(([k, v]) => {
          setValue(k as keyof FormValues, v as never)
        })
        setHasDraft(true)
      } catch {
        // ignore
      }
    }
  }, [setValue])

  useEffect(() => {
    const sub = watch()
    const timer = setTimeout(() => {
      if (sub.bodyText && sub.bodyText.length > 5) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(sub))
      }
    }, 1000)
    return () => clearTimeout(timer)
  })

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY)
    setHasDraft(false)
    reset()
  }

  const onSubmit = async (data: FormValues) => {
    const id = addSubmission({
      submitterName: 'Anonymous',
      submitterProgram: data.submitterProgram,
      submitterBatch: data.submitterBatch,
      targetName: data.targetName,
      targetProgram: data.targetProgram,
      targetBatch: data.targetBatch,
      category: data.category,
      bodyText: data.bodyText,
      triggerFlag: data.triggerFlag,
    })
    localStorage.removeItem(DRAFT_KEY)
    onSuccess(id)
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-5">
      {hasDraft && (
        <div className="bg-indigo-500/20 border border-indigo-400/30 rounded-lg px-4 py-3 flex items-center justify-between">
          <p className="text-indigo-200 text-sm">📝 Draft restored</p>
          <button onClick={clearDraft} className="text-indigo-300 hover:text-white text-xs underline">Clear</button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Submitter info */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-indigo-200 text-xs mb-1.5 font-medium">Your Program</label>
            <select {...register('submitterProgram')} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              {PROGRAMS.map(p => <option key={p} value={p} className="bg-slate-800">{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-indigo-200 text-xs mb-1.5 font-medium">Your Batch</label>
            <select {...register('submitterBatch')} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              {BATCHES.map(b => <option key={b} value={b} className="bg-slate-800">{b}</option>)}
            </select>
          </div>
        </div>

        {/* Target info */}
        <div>
          <label className="block text-indigo-200 text-xs mb-1.5 font-medium">About (describe, no full names)</label>
          <input
            {...register('targetName')}
            placeholder="e.g. A professor, A batchmate, Campus admin..."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {errors.targetName && <p className="text-red-400 text-xs mt-1">{errors.targetName.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-indigo-200 text-xs mb-1.5 font-medium">Their Program</label>
            <select {...register('targetProgram')} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              {PROGRAMS.map(p => <option key={p} value={p} className="bg-slate-800">{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-indigo-200 text-xs mb-1.5 font-medium">Their Batch</label>
            <select {...register('targetBatch')} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              {BATCHES.map(b => <option key={b} value={b} className="bg-slate-800">{b}</option>)}
            </select>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-indigo-200 text-xs mb-1.5 font-medium">Category</label>
          <select {...register('category')} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
            {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
          </select>
        </div>

        {/* Body text */}
        <div>
          <label className="block text-indigo-200 text-xs mb-1.5 font-medium">Your Story</label>
          <textarea
            {...register('bodyText')}
            rows={6}
            placeholder="Share what happened... Be honest, but remember: we may edit for safety before posting."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
          <div className="flex items-center justify-between mt-1">
            {errors.bodyText && <p className="text-red-400 text-xs">{errors.bodyText.message}</p>}
            <p className={`text-xs ml-auto ${bodyText?.length > 900 ? 'text-red-400' : 'text-white/40'}`}>
              {bodyText?.length ?? 0}/1000
            </p>
          </div>
        </div>

        {/* Trigger warning */}
        <div>
          <label className="block text-indigo-200 text-xs mb-1.5 font-medium">Does this contain triggering content?</label>
          <div className="flex gap-3">
            {TRIGGER_FLAGS.map(f => (
              <label key={f} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value={f} {...register('triggerFlag')} className="accent-indigo-500" />
                <span className="text-white/80 text-sm">{f}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Anonymously'}
        </button>
      </form>
    </div>
  )
}
