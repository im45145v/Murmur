'use client'
import { useStore } from '@/lib/store'

interface Props {
  title: string
}

export default function TopBar({ title }: Props) {
  const submissions = useStore((s) => s.submissions)
  const pending = submissions.filter((s) => s.status === 'pending').length

  return (
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {pending > 0 && (
        <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          {pending} pending
        </span>
      )}
    </div>
  )
}
