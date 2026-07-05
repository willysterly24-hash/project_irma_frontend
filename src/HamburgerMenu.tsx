import { useState } from "react"
import { Menu, X, Home, Calendar, History, User, Star } from "lucide-react"
import CurrencySelector from "./CurrencySelector"

type ClientPage = 'accueil' | 'hotelDetail' | 'reservations' | 'historique' | 'profile' | 'avis'

interface HamburgerMenuProps {
  activePage: ClientPage
  onPageChange: (page: ClientPage) => void
  onLogout: () => void
  onScrollToSection: (sectionId: string) => void
  onOpenFavoris: () => void
}

const navItems: { key: ClientPage; label: string; icon: any }[] = [
  { key: 'accueil', label: 'Accueil', icon: Home },
  { key: 'reservations', label: 'Mes réservations', icon: Calendar },
  { key: 'historique', label: 'Historique', icon: History },
  { key: 'profile', label: 'Mon profil', icon: User },
]

const scrollItems = [
  { id: 'hotels-section', label: 'HÔTELS' },
  { id: 'offres-section', label: 'OFFRES' },
  { id: 'avis-section', label: 'TÉMOIGNAGES' },
]

export default function HamburgerMenu({ activePage, onPageChange, onLogout, onScrollToSection, onOpenFavoris }: HamburgerMenuProps) {
  const [open, setOpen] = useState(false)

  const handleNavigate = (page: ClientPage) => {
    onPageChange(page)
    setOpen(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap');
      `}</style>

      {/* Barre du haut */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <span
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '22px',
              fontWeight: '600',
              color: '#0F172A',
            }}
          >
            IRMA
          </span>

          {/* Liens de scroll, visibles seulement en desktop */}
          <nav className="hidden md:flex items-center gap-8">
          {scrollItems.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onScrollToSection(id)}
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: '11px',
                fontWeight: '500',
                letterSpacing: '0.18em',
                color: '#374151',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#D4A853')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#374151')}
            >
              {label}
            </button>
          ))}
        </nav>
        </div>

        <div className="flex items-center gap-40">
          <button
            onClick={onOpenFavoris}
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: '11px',
              fontWeight: '500',
              letterSpacing: '0.18em',
              color: '#374151',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#D4A853')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#374151')}
          >
            FAVORIS
          </button>
          <div className="flex items-center gap-1">
            <CurrencySelector />
            <button
              onClick={() => setOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-50 transition"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Overlay + panneau compact */}
      {open && (
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute top-20 right-4 md:right-6 w-64 bg-white flex flex-col overflow-hidden"
            style={{
              borderRadius: '16px',
              boxShadow: '0 20px 60px -12px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.04)',
            }}
          >
            <nav className="p-2" style={{ fontFamily: "'Jost', sans-serif" }}>
              {navItems.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => handleNavigate(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    activePage === key || (key === 'accueil' && activePage === 'hotelDetail')
                      ? 'bg-amber-50 text-amber-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  style={{ fontSize: '13.5px' }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            <div className="p-2 border-t border-gray-100" style={{ fontFamily: "'Jost', sans-serif" }}>
              <button
                onClick={onLogout}
                className="w-full px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all text-left"
                style={{ fontSize: '13.5px' }}
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}