import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string
  icon: ReactNode
  bg: string
  trend: string
  trendUp: boolean
}

export default function StatCard({ title, value, icon, bg, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs text-gray-400 font-medium">{title}</span>
        <span className={`${bg} rounded-xl p-2 text-lg`}>{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
      <span className={`text-xs font-semibold ${trendUp ? "text-emerald-500" : "text-red-400"}`}>
        {trend}
      </span>
    </div>
  )
}
