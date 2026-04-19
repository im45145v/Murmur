'use client'
import { useEffect, useState } from 'react'

interface Props {
  submissionId: string
  onReset: () => void
}

export default function SuccessState({ submissionId, onReset }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center space-y-4 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="text-5xl animate-bounce">✅</div>
      <h2 className="text-2xl font-bold text-white">Submitted!</h2>
      <p className="text-indigo-200 text-sm">
        Your submission has been received anonymously. Our team will review it and post it if it meets our guidelines.
      </p>
      <p className="text-white/30 text-xs font-mono">#{submissionId}</p>
      <div className="flex flex-col gap-2 pt-2">
        <button
          onClick={onReset}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          Submit Another
        </button>
        <p className="text-white/20 text-xs">Your identity is never stored or shared.</p>
      </div>
    </div>
  )
}
