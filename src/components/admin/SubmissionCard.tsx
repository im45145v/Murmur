'use client'
import type { Submission } from '@/lib/types'
import { timeAgo, truncateText } from '@/lib/utils'
import { cn } from '@/lib/utils'

const statusColors: Record<string, string> = {
  pending: 'bg-orange-100 text-orange-700',
  approved: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  posted: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
}

const riskColors: Record<string, string> = {
  Low: 'bg-green-50 text-green-700',
  Medium: 'bg-yellow-50 text-yellow-700',
  High: 'bg-orange-50 text-orange-700',
  Critical: 'bg-red-50 text-red-700',
}

interface Props {
  submission: Submission
}

export default function SubmissionCard({ submission }: Props) {
  const { id, category, bodyText, status, riskLevel, createdAt, triggerFlag } = submission

  return (
    <div className="bg-white rounded-lg border p-3 hover:border-indigo-200 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs text-gray-400 font-mono">#{id.slice(-6)}</span>
        <div className="flex gap-1.5">
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusColors[status] ?? 'bg-gray-100 text-gray-600')}>
            {status}
          </span>
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', riskColors[riskLevel] ?? 'bg-gray-100')}>
            {riskLevel}
          </span>
        </div>
      </div>
      <p className="text-xs font-semibold text-indigo-700 mb-1">{category}</p>
      <p className="text-xs text-gray-600 leading-relaxed">{truncateText(bodyText, 120)}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-400">{timeAgo(createdAt)}</span>
        {triggerFlag === 'Yes' && (
          <span className="text-xs text-red-500 font-medium">⚠ TW</span>
        )}
      </div>
    </div>
  )
}
