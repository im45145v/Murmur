'use client'
import { useStore } from '@/lib/store'
import type { Submission } from '@/lib/types'

const styleLabels: Record<string, string> = {
  soft_reflective: '💭 Soft & Reflective',
  neutral_admin_safe: '📋 Neutral / Admin-Safe',
  page_brand_voice: '🔥 Brand Voice',
}

interface Props {
  submission: Submission
}

export default function CaptionEditor({ submission }: Props) {
  const captions = useStore((s) => s.captions.filter((c) => c.submissionId === submission.id))
  const generateCaptionsForSubmission = useStore((s) => s.generateCaptionsForSubmission)
  const selectCaption = useStore((s) => s.selectCaption)

  return (
    <div className="bg-white rounded-xl border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Caption</h3>
        <button
          onClick={() => generateCaptionsForSubmission(submission.id)}
          className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-100"
        >
          {captions.length > 0 ? 'Regenerate' : 'Generate Captions'}
        </button>
      </div>

      {captions.length === 0 ? (
        <p className="text-sm text-gray-400">Click &ldquo;Generate Captions&rdquo; to get AI-style caption suggestions.</p>
      ) : (
        <div className="space-y-3">
          {captions.map((caption) => (
            <div
              key={caption.id}
              onClick={() => selectCaption(submission.id, caption.id)}
              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                submission.captionSelected === caption.id
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="text-xs font-semibold text-gray-500 mb-1.5">{styleLabels[caption.style] ?? caption.style}</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{caption.text}</p>
              {submission.captionSelected === caption.id && (
                <p className="text-xs text-indigo-600 font-medium mt-2">✓ Selected</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
