'use client'
import { useState } from 'react'
import SubmissionForm from '@/components/submission/SubmissionForm'
import SuccessState from '@/components/submission/SuccessState'

export default function HomePage() {
  const [submitted, setSubmitted] = useState(false)
  const [submissionId, setSubmissionId] = useState<string>('')

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-950 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">Murmur</h1>
          <p className="text-indigo-300 text-lg">Your campus, your voice — anonymously.</p>
          <p className="text-indigo-400/70 text-sm mt-2">Share confessions, gossip, frustrations, and stories. We review and post them.</p>
        </div>
        {submitted ? (
          <SuccessState submissionId={submissionId} onReset={() => setSubmitted(false)} />
        ) : (
          <SubmissionForm
            onSuccess={(id) => {
              setSubmissionId(id)
              setSubmitted(true)
            }}
          />
        )}
      </div>
    </main>
  )
}
