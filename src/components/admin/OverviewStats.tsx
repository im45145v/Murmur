'use client'
import { useStore } from '@/lib/store'

const statConfig = [
  { label: 'Total', filter: () => true, color: 'bg-gray-50 text-gray-700 border-gray-200' },
  { label: 'Pending', filter: (s: { status: string }) => s.status === 'pending', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { label: 'Approved', filter: (s: { status: string }) => s.status === 'approved', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { label: 'Posted', filter: (s: { status: string }) => s.status === 'posted', color: 'bg-green-50 text-green-700 border-green-200' },
  { label: 'Rejected', filter: (s: { status: string }) => s.status === 'rejected', color: 'bg-red-50 text-red-700 border-red-200' },
]

export default function OverviewStats() {
  const submissions = useStore((s) => s.submissions)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {statConfig.map(({ label, filter, color }) => (
        <div key={label} className={`rounded-xl border p-4 ${color}`}>
          <p className="text-2xl font-bold">{submissions.filter(filter).length}</p>
          <p className="text-xs font-medium mt-1">{label}</p>
        </div>
      ))}
    </div>
  )
}
