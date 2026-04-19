'use client'
import type { Submission } from '@/lib/types'
import { useStore } from '@/lib/store'
import { softenPhrasing, fixGrammar, removeIdentifyingDetails, reduceRisk } from '@/lib/moderation'
import { cn } from '@/lib/utils'

const riskBadgeColors: Record<string, string> = {
  Low: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-orange-100 text-orange-800',
  Critical: 'bg-red-100 text-red-800',
}

const flagTypeLabels: Record<string, string> = {
  explicit_insult: 'Explicit Insult',
  sexual_content: 'Sexual Content',
  abuse_allegation: 'Abuse Allegation',
  self_harm: 'Self-Harm',
  direct_identification: 'Direct Identification',
  defamatory: 'Defamatory',
  hate_speech: 'Hate Speech',
  profanity: 'Profanity',
}

interface Props {
  submission: Submission
}

export default function ModerationPanel({ submission }: Props) {
  const updateSubmission = useStore((s) => s.updateSubmission)

  const applyTransform = (fn: (t: string) => string, label: string) => {
    const current = submission.editedText ?? submission.bodyText
    const transformed = fn(current)
    updateSubmission(submission.id, { editedText: transformed })
  }

  return (
    <div className="bg-white rounded-xl border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Moderation</h3>
        <span className={cn('text-xs px-2.5 py-1 rounded-full font-semibold', riskBadgeColors[submission.riskLevel] ?? 'bg-gray-100')}>
          {submission.riskLevel} Risk
        </span>
      </div>

      {submission.moderationFlags.length === 0 ? (
        <p className="text-sm text-green-600">✓ No flags detected</p>
      ) : (
        <div className="space-y-2">
          {submission.moderationFlags.map((flag) => (
            <div key={flag.id} className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">{flagTypeLabels[flag.type] ?? flag.type}</span>
                <span className={cn('text-xs px-2 py-0.5 rounded-full', riskBadgeColors[flag.severity] ?? 'bg-gray-100')}>
                  {flag.severity}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{flag.description}</p>
              {flag.excerpt && (
                <p className="text-xs font-mono text-red-600 mt-1 bg-red-50 rounded px-2 py-1">&ldquo;{flag.excerpt}&rdquo;</p>
              )}
            </div>
          ))}
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-gray-600 mb-2">Quick Actions</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => applyTransform(fixGrammar, 'grammar_fixed')}
            className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200"
          >
            Fix Grammar
          </button>
          <button
            onClick={() => applyTransform(softenPhrasing, 'softened')}
            className="px-3 py-1.5 text-xs bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 border border-purple-200"
          >
            Soften Phrasing
          </button>
          <button
            onClick={() => applyTransform(removeIdentifyingDetails, 'edited')}
            className="px-3 py-1.5 text-xs bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 border border-orange-200"
          >
            Remove Identifiers
          </button>
          <button
            onClick={() => applyTransform(reduceRisk, 'rewritten')}
            className="px-3 py-1.5 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border border-red-200"
          >
            Reduce Risk
          </button>
        </div>
      </div>
    </div>
  )
}
