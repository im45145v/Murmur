'use client'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import TopBar from '@/components/admin/TopBar'
import SubmissionCard from '@/components/admin/SubmissionCard'
import SubmissionDetail from '@/components/admin/SubmissionDetail'
import ModerationPanel from '@/components/admin/ModerationPanel'
import CaptionEditor from '@/components/admin/CaptionEditor'
import TemplateSelector from '@/components/admin/TemplateSelector'
import PostPreview from '@/components/admin/PostPreview'
import ActionBar from '@/components/admin/ActionBar'
import type { SubmissionStatus } from '@/lib/types'

export default function QueuePage() {
  const submissions = useStore((s) => s.submissions)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | 'all'>('pending')

  const filtered = submissions.filter((s) =>
    statusFilter === 'all' ? true : s.status === statusFilter
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const selected = submissions.find((s) => s.id === selectedId)

  return (
    <div className="flex h-full">
      <div className="w-96 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <TopBar title="Queue" />
          <div className="flex gap-2 mt-3 flex-wrap">
            {(['all', 'pending', 'approved', 'rejected', 'posted'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 text-sm mt-8">No submissions</p>
          )}
          {filtered.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={`cursor-pointer rounded-lg transition-all ${
                selectedId === s.id ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              <SubmissionCard submission={s} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {selected ? (
          <>
            <SubmissionDetail submission={selected} />
            <ModerationPanel submission={selected} />
            <CaptionEditor submission={selected} />
            <TemplateSelector submission={selected} />
            <PostPreview submission={selected} />
            <ActionBar submission={selected} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-3">📬</div>
              <p>Select a submission to review</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
