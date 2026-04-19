import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import Sidebar from './Sidebar'
import ReservationsEnCours from './ReservationEnCours'
import Historique from './Historiques'
import Profile from './profile'

type DashboardPage = 'dashboard' | 'reservations' | 'historique' | 'profile'

interface ReservationItem {
  id: string
  guest: string
  email: string
  phone: string
  room: string
  roomType: string
  checkIn: string
  checkOut: string
  nights: number
  adults: number
  children: number
  status: string
  amount: number
  pricePerNight: number
  avatar: string
  specialRequests?: string
}

interface ProfileData {
  name: string
  email: string
  phone: string
  address: string
  avatar: string
}

const initialReservations: ReservationItem[] = []

const defaultProfile: ProfileData = {
  name: 'Jean Dupont',
  email: 'jean.dupont@email.com',
  phone: '77 123 45 67',
  address: 'Dakar, Senegal',
  avatar: 'JD'
}

export default function Dashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [currentPage, setCurrentPage] = useState<DashboardPage>('reservations')
  const [reservations, setReservations] = useState<ReservationItem[]>(initialReservations)
  const [profile, setProfile] = useState<ProfileData>(() => {
    const saved = localStorage.getItem('profile')
    return saved ? (JSON.parse(saved) as ProfileData) : defaultProfile
  })

  const handleUpdateProfile = (newProfile: ProfileData) => {
    setProfile(newProfile)
    localStorage.setItem('profile', JSON.stringify(newProfile))
  }

  const handleAddReservation = (newReservation: ReservationItem) => {
    setReservations([newReservation, ...reservations])
  }

  const handleUpdateReservation = (updatedReservation: ReservationItem) => {
    setReservations(
      reservations.map(res => (res.id === updatedReservation.id ? updatedReservation : res))
    )
  }

  const handleCancelReservation = (id: string) => {
    setReservations(
      reservations.map(res => (res.id === id ? { ...res, status: 'Annulee' } : res))
    )
  }

  const handleDeleteReservation = (id: string) => {
    if (confirm('Supprimer definitivement cette reservation ?')) {
      setReservations(reservations.filter(res => res.id !== id))
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const formatPrice = (price: number) => price.toLocaleString() + ' FCFA'

  const totalReservations = reservations.filter(
    r => r.status !== 'Terminee' && r.status !== 'Annulee'
  ).length
  const totalRevenue = reservations.reduce((sum, r) => sum + r.amount, 0)
  const completedReservations = reservations.filter(r => r.status === 'Terminee').length
  const cancelledReservations = reservations.filter(r => r.status === 'Annulee').length

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      <Sidebar activePage={currentPage} onPageChange={setCurrentPage} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto p-6">
        {currentPage === 'dashboard' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
            <p className="text-gray-500">Bienvenue, {profile.name}</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <p className="text-sm text-gray-500">Reservations en cours</p>
                <p className="text-2xl font-bold text-amber-600">{totalReservations}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <p className="text-sm text-gray-500">Revenu total</p>
                <p className="text-2xl font-bold text-green-600">{formatPrice(totalRevenue)}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <p className="text-sm text-gray-500">Reservations terminees</p>
                <p className="text-2xl font-bold text-blue-600">{completedReservations}</p>
              </div>
              <div className="bg-white rounded-xl p-5 shadow-sm border">
                <p className="text-sm text-gray-500">Reservations annulees</p>
                <p className="text-2xl font-bold text-red-600">{cancelledReservations}</p>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'reservations' && (
          <ReservationsEnCours
            reservations={reservations}
            onAddReservation={handleAddReservation}
            onUpdateReservation={handleUpdateReservation}
            onCancelReservation={handleCancelReservation}
          />
        )}

        {currentPage === 'historique' && (
          <Historique
            reservations={reservations.filter(r => r.status === 'Terminee' || r.status === 'Annulee')}
            onDeleteReservation={handleDeleteReservation}
          />
        )}

        {currentPage === 'profile' && (
          <Profile
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleLogout}
          />
        )}
      </main>
    </div>
  )
}
