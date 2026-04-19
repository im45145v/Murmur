'use client'
import { useMemo, useState } from 'react'
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
  const allCaptions = useStore((s) => s.captions)
  const captions = useMemo(() => allCaptions.filter((c) => c.submissionId === submission.id), [allCaptions, submission.id])
  const generateCaptionsForSubmission = useStore((s) => s.generateCaptionsForSubmission)
  const selectCaption = useStore((s) => s.selectCaption)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

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
              <div className="flex items-center justify-between mt-2">
                {submission.captionSelected === caption.id && (
                  <p className="text-xs text-indigo-600 font-medium">✓ Selected</p>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopy(caption.text, caption.id) }}
                  className="text-xs text-gray-400 hover:text-gray-600 ml-auto"
                >
                  {copiedId === caption.id ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
