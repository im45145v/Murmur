'use client'
import { useStore } from '@/lib/store'
import TopBar from '@/components/admin/TopBar'
import OverviewStats from '@/components/admin/OverviewStats'
import CategoryChart from '@/components/charts/CategoryChart'
import TrendChart from '@/components/charts/TrendChart'
import SubmissionCard from '@/components/admin/SubmissionCard'

export default function OverviewPage() {
  const submissions = useStore((s) => s.submissions)
  const recent = [...submissions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="p-6 space-y-6">
      <TopBar title="Overview" />
      <OverviewStats />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold text-gray-700 mb-4">Submissions by Category</h3>
          <CategoryChart submissions={submissions} />
        </div>
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold text-gray-700 mb-4">Submission Trend (7 days)</h3>
          <TrendChart submissions={submissions} />
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-gray-700 mb-4">Recent Submissions</h3>
        <div className="space-y-3">
          {recent.map((s) => (
            <SubmissionCard key={s.id} submission={s} />
          ))}
        </div>
      </div>
    </div>
  )
}
