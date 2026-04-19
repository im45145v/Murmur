'use client'
import React, { useState } from 'react'
import type { Submission } from '@/lib/types'
import { useStore } from '@/lib/store'
import { formatDate } from '@/lib/utils'

interface Props {
  submission: Submission
}

export default function SubmissionDetail({ submission }: Props) {
  const updateSubmission = useStore((s) => s.updateSubmission)
  const [editing, setEditing] = useState(false)
  const [editedText, setEditedText] = useState(submission.editedText ?? submission.bodyText)

  // Sync local state when switching between submissions
  React.useEffect(() => {
    setEditedText(submission.editedText ?? submission.bodyText)
    setEditing(false)
  }, [submission.id, submission.editedText, submission.bodyText])

  const handleSave = () => {
    updateSubmission(submission.id, { editedText })
    setEditing(false)
  }

  const handleReset = () => {
    setEditedText(submission.bodyText)
    updateSubmission(submission.id, { editedText: undefined })
    setEditing(false)
  }

  const displayText = submission.editedText ?? submission.bodyText

  return (
    <div className="bg-white rounded-xl border p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{submission.category}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {submission.submitterProgram} {submission.submitterBatch} → about {submission.targetName} ({submission.targetProgram} {submission.targetBatch})
          </p>
          {(submission.fromInitials || submission.toInitials) && (
            <div className="flex gap-2 mt-1.5">
              {submission.fromInitials && (
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
                  From: {submission.fromInitials}
                </span>
              )}
              {submission.toInitials && (
                <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                  To: {submission.toInitials}
                </span>
              )}
            </div>
          )}
          {submission.preferredTemplateId && (
            <p className="text-xs text-gray-400 mt-1">
              Preferred design: <span className="text-indigo-600 font-medium">{submission.preferredTemplateId}</span>
            </p>
          )}
        </div>
        <div className="text-right text-xs text-gray-400">
          <p>{formatDate(submission.createdAt)}</p>
          {submission.triggerFlag === 'Yes' && <p className="text-red-500 font-medium">⚠ Trigger Warning</p>}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        {editing ? (
          <div className="space-y-3">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{editedText.length} chars · {editedText.split(/\s+/).filter(Boolean).length} words</span>
              {editedText.length > 900 && <span className="text-red-500 font-medium">Approaching limit</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-700">
                Save Edit
              </button>
              <button onClick={handleReset} className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-200">
                Reset to Original
              </button>
              <button onClick={() => setEditing(false)} className="text-gray-400 text-xs hover:text-gray-600 ml-auto">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {submission.editedText && (
              <p className="text-xs text-amber-600 font-medium">✏️ Edited version shown</p>
            )}
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{displayText}</p>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
              Edit text
            </button>
              <span className="text-xs text-gray-400">{displayText.length} chars · {displayText.split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </div>
        )}
      </div>

      {submission.editedText && (
        <details className="text-xs text-gray-400">
          <summary className="cursor-pointer hover:text-gray-600">View original</summary>
          <p className="mt-2 text-gray-500 leading-relaxed italic">{submission.bodyText}</p>
        </details>
      )}
    </div>
  )
}
