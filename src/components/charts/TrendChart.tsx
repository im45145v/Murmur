'use client'
import type { Submission } from '@/lib/types'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format, subDays, startOfDay } from 'date-fns'

interface Props {
  submissions: Submission[]
}

export default function TrendChart({ submissions }: Props) {
  const today = startOfDay(new Date())

  const data = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(today, 6 - i)
    const dayStart = day.getTime()
    const dayEnd = dayStart + 86400000
    const count = submissions.filter((s) => {
      const t = new Date(s.createdAt).getTime()
      return t >= dayStart && t < dayEnd
    }).length

    return {
      date: format(day, 'MMM d'),
      count,
    }
  })

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(value) => [value, 'Submissions']}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ fill: '#6366f1', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
