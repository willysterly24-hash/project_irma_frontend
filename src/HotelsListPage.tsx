import { useState, useEffect } from "react"
import { MapPin, Star, Waves, Umbrella, ParkingCircle, Sparkles, UtensilsCrossed, Wifi, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { hotelApi, meteoApi, favoriApi } from "./services/api"
import { Card } from "./Card"

interface HotelsListPageProps {
  onSelectHotel: (hotelId: number) => void
}

const EQUIPEMENT_ICONS: Record<string, any> = {
  piscine: Waves,
  plage: Umbrella,
  parking: ParkingCircle,
  spa: Sparkles,
  restaurant: UtensilsCrossed,
  wifi: Wifi,
}

const HOTELS_PER_PAGE = 6
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'

function equipementsToArray(obj: any): string[] {
  if (!obj) return []
  return Object.keys(obj).filter(key => obj[key] === true)
}

function normalizeVille(ville: string): string {
  if (!ville) return ville
  return ville.trim().charAt(0).toUpperCase() + ville.trim().slice(1).toLowerCase()
}

function getHotelImages(hotel: any): string[] {
  if (hotel.photos && hotel.photos.length > 0) {
    return hotel.photos.map((p: string) => `http://localhost:3000${p}`)
  }
  if (hotel.photo) {
    return [`http://localhost:3000${hotel.photo}`]
  }
  return [FALLBACK_IMAGE]
}

function HotelCard({ hotel, meteo, onSelect, isFav, onToggleFavori }: { hotel: any; meteo: any; onSelect: () => void; isFav: boolean; onToggleFavori: () => void }) {
  const equipements = equipementsToArray(hotel.equipements)
  const villeNorm = normalizeVille(hotel.ville)

  return (
    <div onClick={onSelect} className="fade-up">
      <Card
        images={getHotelImages(hotel)}
        badge={`${hotel.etoiles} étoile${hotel.etoiles > 1 ? 's' : ''}`}
        favorite={isFav}
        onFavoriteToggle={onToggleFavori}
      >
        <div className="flex items-start justify-between mb-1.5">
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '20px',
              fontWeight: '500',
              color: '#0F172A',
            }}
          >
            {hotel.nom}
          </h3>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-stone-400" style={{ fontSize: '13px' }}>
            <MapPin className="w-3.5 h-3.5" />
            {villeNorm}
          </div>
          {meteo && (
            <div className="flex items-center gap-1 text-blue-600" style={{ fontSize: '13px', fontWeight: '600' }}>
              {meteo.icone && <img src={meteo.icone} alt="" className="w-5 h-5" />}
              {Math.round(meteo.temperature)}°C
            </div>
          )}
        </div>

        {hotel.description && (
          <p className="text-stone-400 mb-3 line-clamp-2" style={{ fontSize: '13px', lineHeight: '1.6' }}>
            {hotel.description}
          </p>
        )}

        {equipements.length > 0 && (
          <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
            {equipements.slice(0, 5).map(key => {
              const Icon = EQUIPEMENT_ICONS[key]
              return Icon ? (
                <div
                  key={key}
                  title={key}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: '#FEF3C7' }}
                >
                  <Icon className="w-4 h-4" style={{ color: '#D4A853' }} />
                </div>
              ) : null
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

export default function HotelsListPage({ onSelectHotel }: HotelsListPageProps) {
  const [hotels, setHotels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [villeFilter, setVilleFilter] = useState<string>("Toutes")
  const [searchTerm, setSearchTerm] = useState("")
  const [meteoByVille, setMeteoByVille] = useState<Record<string, any>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [favoris, setFavoris] = useState<number[]>([])

  useEffect(() => {
    hotelApi.getAll()
      .then(res => {
        setHotels(res.data)
        fetchMeteoForHotels(res.data)
      })
      .catch(err => console.error('Erreur chargement hôtels:', err))
      .finally(() => setLoading(false))
    fetchFavoris()
  }, [])

  const fetchFavoris = () => {
    favoriApi.getAll()
      .then(res => setFavoris(res.data.map((f: any) => f.hotel.id)))
      .catch(() => {})
  }

  const toggleFavori = async (hotelId: number) => {
    const isFavori = favoris.includes(hotelId)
    setFavoris(prev => isFavori ? prev.filter(id => id !== hotelId) : [...prev, hotelId])
    try {
      if (isFavori) {
        await favoriApi.remove(hotelId)
      } else {
        await favoriApi.add(hotelId)
      }
    } catch (e) {
      console.error(e)
      fetchFavoris()
    }
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [villeFilter, searchTerm])

  const fetchMeteoForHotels = async (hotelsList: any[]) => {
    const uniqueVilles = Array.from(new Set(hotelsList.map(h => normalizeVille(h.ville).toLowerCase())))
    const results = await Promise.allSettled(
      uniqueVilles.map(ville => meteoApi.getVille(ville))
    )
    const map: Record<string, any> = {}
    uniqueVilles.forEach((ville, i) => {
      const result = results[i]
      if (result.status === 'fulfilled') {
        map[ville] = result.value.data
      }
    })
    setMeteoByVille(map)
  }

  const villes = ["Toutes", ...Array.from(new Set(hotels.map(h => normalizeVille(h.ville))))]

  const filteredHotels = hotels.filter(h => {
    const hotelVilleNorm = normalizeVille(h.ville)
    const matchesVille = villeFilter === "Toutes" || hotelVilleNorm === villeFilter
    const matchesSearch = searchTerm.trim() === "" ||
      h.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.ville.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesVille && matchesSearch
  })

  const totalPages = Math.max(1, Math.ceil(filteredHotels.length / HOTELS_PER_PAGE))
  const paginatedHotels = filteredHotels.slice(
    (currentPage - 1) * HOTELS_PER_PAGE,
    currentPage * HOTELS_PER_PAGE
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-stone-400" style={{ fontSize: '14px' }}>Chargement des hôtels...</p>
      </div>
    )
  }

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap');
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* En-tête */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div style={{ width: '24px', height: '1px', background: '#D4A853' }} />
            <span className="text-amber-600 uppercase" style={{ fontSize: '10px', letterSpacing: '0.22em' }}>
              Notre sélection
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(32px, 4vw, 48px)',
              fontWeight: '300',
              color: '#0F172A',
              lineHeight: '1.1',
            }}
          >
            Nos <em style={{ color: '#D4A853' }}>Hôtels</em>
          </h1>
          <p className="text-stone-400 mt-2" style={{ fontSize: '14px' }}>
            {filteredHotels.length} hôtel{filteredHotels.length > 1 ? 's' : ''} disponible{filteredHotels.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Recherche */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Rechercher un hôtel ou une ville..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 outline-none transition-all"
            style={{
              border: '1px solid #F0EDE8',
              borderRadius: '2px',
              fontSize: '14px',
              background: 'white',
            }}
          />
        </div>

        {/* Filtre villes */}
        <div className="flex items-center gap-2 flex-wrap mb-12">
          {villes.map(v => (
            <button
              key={v}
              onClick={() => setVilleFilter(v)}
              className="transition-all duration-200"
              style={{
                padding: '9px 20px',
                borderRadius: '2px',
                fontSize: '11px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                background: villeFilter === v ? '#0F172A' : 'white',
                color: villeFilter === v ? '#D4A853' : '#78716C',
                border: villeFilter === v ? '1px solid #0F172A' : '1px solid #F0EDE8',
              }}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Grille */}
        {filteredHotels.length === 0 ? (
          <div
            className="text-center py-20"
            style={{ border: '1px dashed #E7E2DA', borderRadius: '4px' }}
          >
            <p className="text-stone-400" style={{ fontSize: '14px' }}>
              Aucun hôtel ne correspond à votre recherche
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedHotels.map(hotel => {
                const villeNorm = normalizeVille(hotel.ville)
                const meteo = meteoByVille[villeNorm.toLowerCase()]
                return (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    meteo={meteo}
                    onSelect={() => onSelectHotel(hotel.id)}
                    isFav={favoris.includes(hotel.id)}
                    onToggleFavori={() => toggleFavori(hotel.id)}
                  />
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-14">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center transition-all disabled:opacity-30"
                  style={{ border: '1px solid #F0EDE8', borderRadius: '2px', color: '#57534E' }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-9 h-9 flex items-center justify-center transition-all"
                      style={{
                        borderRadius: '2px',
                        fontSize: '13px',
                        background: currentPage === pageNum ? '#0F172A' : 'white',
                        color: currentPage === pageNum ? '#D4A853' : '#57534E',
                        border: currentPage === pageNum ? '1px solid #0F172A' : '1px solid #F0EDE8',
                      }}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center transition-all disabled:opacity-30"
                  style={{ border: '1px solid #F0EDE8', borderRadius: '2px', color: '#57534E' }}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}