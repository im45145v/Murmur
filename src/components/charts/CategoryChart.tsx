'use client'
import type { Submission } from '@/lib/types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Props {
  submissions: Submission[]
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6']

export default function CategoryChart({ submissions }: Props) {
  const categoryCounts: Record<string, number> = {}

  for (const s of submissions) {
    categoryCounts[s.category] = (categoryCounts[s.category] ?? 0) + 1
  }

  const data = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name: name.split('/')[0].trim().slice(0, 12), count }))
    .sort((a, b) => b.count - a.count)

  if (data.length === 0) return <p className="text-gray-400 text-sm text-center py-8">No data</p>

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 40 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: '#6b7280' }}
          angle={-35}
          textAnchor="end"
          interval={0}
        />
        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(value) => [value, 'Submissions']}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
