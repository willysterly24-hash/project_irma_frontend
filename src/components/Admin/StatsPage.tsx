import { useState, useEffect } from 'react'
import { statsApi, meteoApi } from '../../services/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell
} from 'recharts'
import StatCard from '../ui/StatCard'
import { PIE_COLORS } from '../../data'
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

function MeteoWidget() {
  const [meteo, setMeteo] = useState<any[]>([])

  useEffect(() => {
    meteoApi.getVilles().then(r => setMeteo(r.data)).catch(() => setMeteo([]))
  }, [])

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
      <p className="text-sm font-semibold text-gray-700 mb-4">🌤️ Météo des destinations</p>
      <div className="grid grid-cols-5 gap-3">
        {meteo.map((m: any) => (
          <div key={m.ville} className="text-center">
            <img src={m.icone} alt={m.description} className="w-10 h-10 mx-auto" />
            <p className="font-semibold text-gray-700 text-xs">{m.ville}</p>
            <p className="text-xl font-bold text-blue-600">{Math.round(m.temperature)}°C</p>
            <p className="text-xs text-gray-400 capitalize">{m.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await statsApi.getStats()
      setStats(response.data)
    } catch (error) {
      console.error('Erreur chargement stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Données dynamiques pour le pie chart
  const pieData = stats ? [
    { name: 'Confirmé', value: stats.reservationsParStatut.confirmees },
    { name: 'En attente', value: stats.reservationsParStatut.enAttente },
    { name: 'Annulé', value: stats.reservationsParStatut.annulees },
  ] : []

  if (loading) return <p style={{ padding: 32, color: "#9ca3af" }}>Chargement...</p>

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Dashboard Admin</h2>
        <p className="text-sm text-gray-400">Vue globale en temps réel</p>
      </div>

      {/* Stats cards — données réelles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Hôtels" value={String(stats?.totalHotels ?? 0)} icon={<Icons.Hotel />} bg="bg-purple-100" trend="" trendUp />
        <StatCard title="Réservations" value={String(stats?.totalReservations ?? 0)} icon={<Icons.Booking />} bg="bg-blue-100" trend={`${stats?.reservationsParStatut.confirmees} confirmées`} trendUp />
        <StatCard title="Utilisateurs" value={String(stats?.totalUsers ?? 0)} icon={<Icons.Revenue />} bg="bg-green-100" trend={`${stats?.usersParStatut.bloques} bloqué(s)`} trendUp={stats?.usersParStatut.bloques === 0} />
        <StatCard title="Chambres dispo" value={String(stats?.chambresDisponibles ?? 0)} icon={<Icons.Chart />} bg="bg-yellow-100" trend={`sur ${stats?.totalChambres} total`} trendUp />
      </div>

      {/* Météo */}
<MeteoWidget />

      {/* Graphique revenus — données réelles */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6 shadow-sm">
        <p className="text-sm font-semibold text-gray-700 mb-4">Revenus mensuels</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={stats?.revenusParMois ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <Legend verticalAlign="top" align="right" iconType="circle" />
            <Line type="monotone" dataKey="revenus" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} name="Revenus" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique occupation — données réelles */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-4">Taux d'occupation par hôtel</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats?.occupationParHotel ?? []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="hotel" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="taux" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart — données réelles */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-4">Répartition des réservations</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
                {pieData.map((entry, index) => (
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