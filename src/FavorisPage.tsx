import { useState, useEffect } from 'react'
import { MapPin } from 'lucide-react'
import { favoriApi } from './services/api'
import { Card } from './Card'
import Avis from './Avis'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'

function getHotelImages(hotel: any): string[] {
  if (hotel.photos && hotel.photos.length > 0) {
    return hotel.photos.map((p: string) => `http://localhost:3000${p}`)
  }
  return [FALLBACK_IMAGE]
}

interface FavorisPageProps {
  onSelectHotel: (hotelId: number) => void
}

export default function FavorisPage({ onSelectHotel }: FavorisPageProps) {
  const [favoris, setFavoris] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFavoris = () => {
    favoriApi.getAll()
      .then(res => setFavoris(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchFavoris() }, [])

  const toggleFavori = async (hotelId: number) => {
    setFavoris(prev => prev.filter(f => f.hotel.id !== hotelId))
    try {
      await favoriApi.remove(hotelId)
    } catch (e) {
      console.error(e)
      fetchFavoris()
    }
  }

  if (loading) {
    return <div className="p-10 text-center text-stone-400">Chargement...</div>
  }

  return (
    <>
      <section style={{ background: '#FAFAF8', padding: '60px 0', minHeight: '70vh' }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-3">
              <div style={{ width: '24px', height: '1px', background: '#D4A853' }} />
              <span className="text-amber-600 uppercase" style={{ fontSize: '10px', letterSpacing: '0.22em' }}>
                Mes préférés
              </span>
            </div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(30px, 4vw, 48px)',
                fontWeight: '300',
                color: '#0F172A',
              }}
            >
              Hôtels <em style={{ color: '#D4A853' }}>Favoris</em>
            </h2>
          </div>

          {favoris.length === 0 ? (
            <p className="text-stone-400 text-center py-16" style={{ fontSize: '14px' }}>
              Vous n'avez pas encore ajouté d'hôtel à vos favoris.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favoris.map(f => (
                <div key={f.id} onClick={() => onSelectHotel(f.hotel.id)}>
                  <Card
                    images={getHotelImages(f.hotel)}
                    badge={`${f.hotel.etoiles} étoile${f.hotel.etoiles > 1 ? 's' : ''}`}
                    favorite={true}
                    onFavoriteToggle={() => toggleFavori(f.hotel.id)}
                  >
                    <h3
                      style={{
                        fontFamily: "'Cormorant Garamond', Georgia, serif",
                        fontSize: '20px',
                        fontWeight: '500',
                        color: '#0F172A',
                        marginBottom: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      {f.hotel.nom}
                    </h3>
                    <div className="flex items-center gap-1.5 text-stone-400" style={{ fontSize: '13px' }}>
                      <MapPin className="w-3.5 h-3.5" />
                      {f.hotel.ville}
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ====== AVIS ====== */}
      <section style={{ background: '#FFFFFF', padding: '60px 0' }}>
        <div className="max-w-3xl mx-auto px-8">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <div style={{ width: '24px', height: '1px', background: '#D4A853' }} />
              <span className="text-amber-600 uppercase" style={{ fontSize: '10px', letterSpacing: '0.22em' }}>
                Votre expérience
              </span>
            </div>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 'clamp(26px, 3.5vw, 38px)',
                fontWeight: '300',
                color: '#0F172A',
              }}
            >
              Laisser un <em style={{ color: '#D4A853' }}>Avis</em>
            </h2>
          </div>

          <Avis />
        </div>
      </section>
    </>
  )
}