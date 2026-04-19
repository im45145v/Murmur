'use client'
import type { Submission } from '@/lib/types'
import { useStore } from '@/lib/store'
import { CheckCircle, XCircle, Send } from 'lucide-react'

interface Props {
  submission: Submission
}

export default function ActionBar({ submission }: Props) {
  const approveSubmission = useStore((s) => s.approveSubmission)
  const rejectSubmission = useStore((s) => s.rejectSubmission)
  const markAsPosted = useStore((s) => s.markAsPosted)

  const { status } = submission

  return (
    <div className="bg-white rounded-xl border p-4 flex items-center gap-3 flex-wrap">
      <p className="text-sm text-gray-500 mr-auto">
        Status: <span className="font-semibold text-gray-700 capitalize">{status}</span>
      </p>

      {status === 'pending' && (
        <>
          <button
            onClick={() => approveSubmission(submission.id)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={() => rejectSubmission(submission.id)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
        </>
      )}

      {status === 'approved' && (
        <>
          <button
            onClick={() => markAsPosted(submission.id)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Send className="w-4 h-4" />
            Mark as Posted
          </button>
          <button
            onClick={() => rejectSubmission(submission.id)}
            className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
        </>
      )}

      {status === 'rejected' && (
        <button
          onClick={() => approveSubmission(submission.id)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          Re-approve
        </button>
      )}

      {status === 'posted' && (
        <p className="text-sm text-green-600 font-medium">✓ Posted</p>
      )}
    </div>
  )
}
