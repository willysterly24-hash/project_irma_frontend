import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Waves, Umbrella, ParkingCircle, Sparkles, UtensilsCrossed, Wifi } from 'lucide-react'
import { hotelApi, offreApi, avisApi, favoriApi } from './services/api'
import { Card } from './Card'
import { Button } from './Button'
import { OfferCard } from './OfferCard'
import { formatDateFr } from './utils/date'

const HERO_IMAGE = '/src/assets/lulu.jpg'
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'

const EQUIPEMENT_ICONS: Record<string, any> = {
  piscine: Waves,
  plage: Umbrella,
  parking: ParkingCircle,
  spa: Sparkles,
  restaurant: UtensilsCrossed,
  wifi: Wifi,
}

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
  if (hotel.photo) return [`http://localhost:3000${hotel.photo}`]
  return [FALLBACK_IMAGE]
}

interface AccueilPageProps {
  onSelectHotel: (hotelId: number) => void
  onViewAllHotels: () => void
}

export default function AccueilPage({ onSelectHotel, onViewAllHotels }: AccueilPageProps) {
  const navigate = useNavigate()
  const [hotels, setHotels] = useState<any[]>([])
  const [favoris, setFavoris] = useState<number[]>([])

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
  const [offres, setOffres] = useState<any[]>([])
  const [avis, setAvis] = useState<any[]>([])
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    hotelApi.getAll().then(res => setHotels(res.data)).catch(() => {})
    offreApi.getAll().then(res => setOffres(res.data)).catch(() => {})
    avisApi.getAll().then(res => setAvis(res.data)).catch(() => {})
    fetchFavoris()
  }, [])

  const handleNewsletter = () => {
    if (!email || !email.includes('@')) return
    setEmailSent(true)
    setEmail('')
    setTimeout(() => setEmailSent(false), 4000)
  }

  const previewHotels = hotels.slice(0, 3)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap');
        .fade-up { opacity: 0; transform: translateY(24px); animation: fadeUp 0.7s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
        @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ====== HERO ====== */}
      <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: '70vh' }}>
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Hero"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920&q=80'
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.4) 50%, rgba(15,23,42,0.75) 100%)',
            }}
          />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto py-24">
          <div className="inline-flex items-center gap-3 mb-8 fade-up" style={{ animationDelay: '0.1s' }}>
            <div style={{ width: '32px', height: '1px', background: '#D4A853' }} />
            <span className="text-white/60 uppercase" style={{ fontSize: '10px', letterSpacing: '0.3em' }}>
              Collection Prestige 2025
            </span>
            <div style={{ width: '32px', height: '1px', background: '#D4A853' }} />
          </div>

          <h1
            className="text-white mb-6 fade-up"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(36px, 6vw, 68px)',
              fontWeight: '300',
              lineHeight: '1.05',
              animationDelay: '0.2s',
            }}
          >
            L'Excellence au<br />
            <em style={{ color: '#D4A853' }}>Cœur de chaque</em>
            <br />
            Séjour
          </h1>

          <p
            className="text-white/55 max-w-lg mx-auto fade-up"
            style={{ fontSize: '15px', lineHeight: '1.8', fontWeight: '300', animationDelay: '0.35s' }}
          >
            Des hôtels d'exception soigneusement sélectionnés pour leur excellence. Une expérience
            unique vous attend à chaque destination.
          </p>
        </div>
      </section>

      {/* ====== STRIP ====== */}
      <section style={{ background: '#0F172A', padding: '18px 0' }}>
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-center gap-8 flex-wrap">
          {['Meilleur prix garanti', 'Paiement 100% sécurisé', 'Support 24h/24', 'Annulation gratuite'].map((item, i) => (
            <div key={item} className="flex items-center gap-2.5">
              {i > 0 && <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }} />}
              <span className="text-white/50 uppercase" style={{ fontSize: '10px', letterSpacing: '0.18em' }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ====== HOTELS ====== */}
<section id="hotels-section" style={{ background: '#FAFAF8', padding: '90px 0' }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div style={{ width: '24px', height: '1px', background: '#D4A853' }} />
                <span className="text-amber-600 uppercase" style={{ fontSize: '10px', letterSpacing: '0.22em' }}>
                  Notre sélection
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(30px, 4vw, 48px)',
                  fontWeight: '300',
                  color: '#0F172A',
                  lineHeight: '1.1',
                }}
              >
                Hôtels <em style={{ color: '#D4A853' }}>Disponibles</em>
              </h2>
            </div>
            <button
              onClick={onViewAllHotels}
              className="mt-6 md:mt-0 transition-all duration-200 hover:bg-stone-900 hover:text-white"
              style={{
                color: '#0F172A',
                border: '1px solid #0F172A',
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                padding: '10px 24px',
                borderRadius: '2px',
                background: 'none',
                cursor: 'pointer',
              }}
            >
              Voir tout
            </button>
          </div>

          {previewHotels.length === 0 ? (
            <p className="text-stone-400 text-center py-10" style={{ fontSize: '14px' }}>
              Aucun hôtel disponible pour le moment.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {previewHotels.map(hotel => {
                const equipements = equipementsToArray(hotel.equipements)
                const villeNorm = normalizeVille(hotel.ville)
                return (
                  <div key={hotel.id} className="fade-up" onClick={() => onSelectHotel(hotel.id)}>
                    <Card
                      images={getHotelImages(hotel)}
                      badge={`${hotel.etoiles} étoile${hotel.etoiles > 1 ? 's' : ''}`}
                      favorite={favoris.includes(hotel.id)}
                      onFavoriteToggle={() => toggleFavori(hotel.id)}
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
                        {hotel.nom}
                      </h3>
                      <div className="flex items-center gap-1.5 text-stone-400 mb-3" style={{ fontSize: '13px' }}>
                        <MapPin className="w-3.5 h-3.5" />
                        {villeNorm}
                      </div>
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
              })}
            </div>
          )}
        </div>
      </section>

      {/* ====== OFFRES ====== */}
      {offres.length > 0 && (
  <section id="offres-section" style={{ background: '#FFFFFF', padding: '90px 0' }}>
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-14">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div style={{ width: '24px', height: '1px', background: '#D4A853' }} />
                <span className="text-amber-600 uppercase" style={{ fontSize: '10px', letterSpacing: '0.22em' }}>
                  Promotions exclusives
                </span>
                <div style={{ width: '24px', height: '1px', background: '#D4A853' }} />
              </div>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(30px, 4vw, 48px)',
                  fontWeight: '300',
                  color: '#0F172A',
                }}
              >
                Offres <em style={{ color: '#D4A853' }}>Spéciales</em>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {offres.map((offer) => (
                <OfferCard
                  key={offer.id}
                  badge={offer.badge}
                  title={offer.titre}
                  desc={offer.description}
                  img={offer.image ? `http://localhost:3000${offer.image}` : FALLBACK_IMAGE}
                  expires={formatDateFr(offer.expiration)}
                  onButtonClick={() => {
                    if (offer.chambre?.id) {
                      navigate(`/reservation/${offer.chambre.id}?promo=${offer.pourcentageReduction}`)
                    } else {
                      onViewAllHotels()
                    }
                  }}
                />
              ))}
            </div>

            {/* Newsletter */}
            <div
              className="mt-12 flex flex-col md:flex-row items-center justify-between gap-8 px-10 py-10"
              style={{ background: '#0F172A', borderRadius: '4px' }}
            >
              <div>
                <p className="text-amber-500/80 uppercase mb-1" style={{ fontSize: '9px', letterSpacing: '0.25em' }}>
                  Newsletter exclusive
                </p>
                <h3
                  className="text-white"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '24px', fontWeight: '300' }}
                >
                  Recevez nos offres en avant-première
                </h3>
              </div>
              <div className="flex flex-col items-start gap-2 w-full md:w-auto">
                {emailSent ? (
                  <p className="text-emerald-400" style={{ fontSize: '13px', maxWidth: '320px' }}>
                    ✓ Merci pour votre inscription ! Vous recevrez désormais nos offres exclusives en avant-première.
                  </p>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNewsletter()}
                      className="text-white placeholder-white/30 outline-none"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '12px 18px',
                        borderRadius: '2px',
                        fontSize: '14px',
                        minWidth: '260px',
                      }}
                    />
                    <Button onClick={handleNewsletter}>
                      S'inscrire
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ====== AVIS ====== */}
      {avis.length > 0 && (
  <section id="avis-section" style={{ background: '#FAFAF8', padding: '90px 0' }}>
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-14">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div style={{ width: '24px', height: '1px', background: '#D4A853' }} />
                <span className="text-amber-600 uppercase" style={{ fontSize: '10px', letterSpacing: '0.22em' }}>
                  Témoignages
                </span>
                <div style={{ width: '24px', height: '1px', background: '#D4A853' }} />
              </div>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 'clamp(30px, 4vw, 48px)',
                  fontWeight: '300',
                  color: '#0F172A',
                }}
              >
                Ce que disent nos <em style={{ color: '#D4A853' }}>Clients</em>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {avis.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  className="bg-white p-8 transition-all duration-300"
                  style={{ borderRadius: '4px', border: '1px solid #F0EDE8' }}
                >
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(t.note)].map((_, i) => (
                      <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: '64px',
                      color: '#D4A853',
                      lineHeight: '0.5',
                      marginBottom: '16px',
                      opacity: 0.4,
                    }}
                  >
                    "
                  </div>
                  <p className="text-stone-500 mb-7" style={{ fontSize: '14px', lineHeight: '1.75' }}>
                    {t.commentaire}
                  </p>
                  <div className="flex items-center gap-3 pt-5" style={{ borderTop: '1px solid #F0EDE8' }}>
                    {t.user?.photo ? (
                      <img
                        src={`http://localhost:3000${t.user.photo}`}
                        alt={t.nom}
                        className="object-cover shrink-0"
                        style={{ width: '38px', height: '38px', borderRadius: '50%' }}
                      />
                    ) : (
                      <div
                        className="flex items-center justify-center text-amber-700 font-semibold shrink-0"
                        style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#FEF3C7', fontSize: '14px' }}
                      >
                        {(t.nom || '?').charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-stone-900 font-medium" style={{ fontSize: '13px' }}>{t.nom}</p>
                      <p className="text-stone-400" style={{ fontSize: '11px' }}>{t.hotel}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}