import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from './useAuth'
import HamburgerMenu from './HamburgerMenu'
import AccueilPage from './AccueilPage'
import HotelsListPage from './HotelsListPage'
import HotelDetailPage from './HotelDetailPage'
import ReservationsEnCours from './ReservationEnCours'
import Historique from './Historiques'
import Profile from './profile'
import Avis from './Avis'
import FavorisPage from './FavorisPage'
import { reservationApi, userApi } from './services/api'

type ClientPage = 'accueil' | 'hotelsList' | 'hotelDetail' | 'reservations' | 'historique' | 'profile' | 'avis' | 'favoris'

export default function Dashboard() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  // L'URL (?page=...) est la seule source de vérité pour la page affichée.
  // Ça permet aux boutons précédent/suivant du navigateur de fonctionner correctement,
  // et évite de retomber sur une ancienne page après une reconnexion (sessionStorage retiré).
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = (searchParams.get('page') as ClientPage) || 'accueil'
  const selectedHotelId = searchParams.get('hotelId') ? Number(searchParams.get('hotelId')) : null

  // Retenu seulement pour savoir où revenir depuis le détail d'un hôtel (pas dans l'URL)
  const previousPageRef = useRef<ClientPage>('accueil')

  const [reservations, setReservations] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [resRes, profileRes] = await Promise.all([
        reservationApi.getByUser(Number(user?.id)),
        userApi.getMe(),
      ])
      setReservations(resRes.data)
      setProfile(profileRes.data)
    } catch (error) {
      console.error('Erreur chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const goToPage = (page: ClientPage, hotelId?: number) => {
    const params: Record<string, string> = { page }
    if (hotelId !== undefined) params.hotelId = String(hotelId)
    setSearchParams(params)
  }

  const handleSelectHotel = (hotelId: number) => {
    previousPageRef.current = currentPage
    goToPage('hotelDetail', hotelId)
  }

  const handlePageChange = (page: ClientPage) => {
    goToPage(page)
  }

  // Scroll vers une section de la page accueil. Si on n'est pas sur "accueil",
  // on y navigue d'abord, puis on scrolle une fois le DOM rendu.
  const handleScrollToSection = (sectionId: string) => {
    if (currentPage !== 'accueil') {
      goToPage('accueil')
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleOpenFavoris = () => {
    goToPage('favoris')
  }

  const activeReservations = reservations.filter(r => r.statut !== 'Annulé')

  if (loading) return <div className="flex min-h-screen items-center justify-center">Chargement...</div>

  return (
    <div className="min-h-screen bg-gray-50/50">
      <HamburgerMenu
        activePage={currentPage}
        onPageChange={handlePageChange}
        onLogout={handleLogout}
        onScrollToSection={handleScrollToSection}
        onOpenFavoris={handleOpenFavoris}
      />

      <main>
        {currentPage === 'accueil' && (
          <AccueilPage
            onSelectHotel={handleSelectHotel}
            onViewAllHotels={() => goToPage('hotelsList')}
          />
        )}

        {currentPage === 'hotelsList' && (
          <HotelsListPage onSelectHotel={handleSelectHotel} />
        )}

        {currentPage === 'hotelDetail' && selectedHotelId && (
          <HotelDetailPage
            hotelId={selectedHotelId}
            onBack={() => goToPage(previousPageRef.current)}
          />
        )}

        {currentPage === 'reservations' && (
          <div className="p-6">
            <ReservationsEnCours
              reservations={activeReservations}
              profile={profile}
              onRefresh={fetchData}
              onBrowseHotels={() => goToPage('hotelsList')}
            />
          </div>
        )}

        {currentPage === 'historique' && (
          <div className="p-6">
            <Historique reservations={reservations.filter(r => r.statut === 'Annulé')} />
          </div>
        )}

        {currentPage === 'profile' && profile && (
          <div className="p-6">
            <Profile profile={profile} onUpdateProfile={(updated) => setProfile(updated)} onLogout={handleLogout} />
          </div>
        )}

        {currentPage === 'avis' && (
          <div className="p-6">
            <Avis />
          </div>
        )}

        {currentPage === 'favoris' && (
          <FavorisPage onSelectHotel={handleSelectHotel} />
        )}
      </main>
    </div>
  )
}
