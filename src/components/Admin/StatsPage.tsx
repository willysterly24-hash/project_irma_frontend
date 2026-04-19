import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import StatCard from '../ui/StatCard'
import { revenusData, occupationData, pieData, PIE_COLORS } from '../../data'

const Icons = {
  Revenue: () => (
    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 1v22M17 5H7a3 3 0 000 6h10a3 3 0 010 6H7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Booking: () => (
    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Hotel: () => (
    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 21h18M3 7v14m18-14v14M3 7l9-4 9 4M9 21v-4a2 2 0 012-2h2a2 2 0 012 2v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Chart: () => (
    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function StatsPage() {
  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Dashboard Admin</h2>
        <p className="text-sm text-gray-400">Vue globale - Mars 2025</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Revenus totaux" value="EUR 904 K" icon={<Icons.Revenue />} bg="bg-green-100" trend="+22% vs 2024" trendUp />
        <StatCard title="Reservations" value="804" icon={<Icons.Booking />} bg="bg-blue-100" trend="+11% vs 2024" trendUp />
        <StatCard title="Hotels actifs" value="4 / 5" icon={<Icons.Hotel />} bg="bg-purple-100" trend="1 en maintenance" trendUp={false} />
        <StatCard title="Occupation moy." value="73%" icon={<Icons.Chart />} bg="bg-yellow-100" trend="+6 pts vs 2024" trendUp />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6 shadow-sm">
        <p className="text-sm font-semibold text-gray-700 mb-4">Revenus mensuels vs objectif</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={revenusData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value: number | string | readonly (number | string)[] | undefined) => `EUR ${Number(Array.isArray(value) ? value[0] : value ?? 0).toLocaleString()}`}
            />
            <Legend verticalAlign="top" align="right" iconType="circle" />
            <Line type="monotone" dataKey="revenus" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Revenus" />
            <Line type="monotone" dataKey="objectif" stroke="#D1D5DB" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Objectif" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-4">Taux d'occupation par hotel</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={occupationData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="hotel" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip cursor={{ fill: '#f8fafc' }} formatter={(value: number | string | readonly (number | string)[] | undefined) => `${Array.isArray(value) ? value[0] : value ?? 0}%`} />
              <Bar dataKey="taux" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-4">Repartition des reservations</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={70}
                outerRadius={90}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry: { name: string; value: number }, index: number) => (
                  <Cell key={`${entry.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
