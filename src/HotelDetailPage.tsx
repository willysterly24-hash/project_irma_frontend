import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, MapPin, Star, Users, Bed, Maximize, Waves, Umbrella, ParkingCircle, Sparkles, UtensilsCrossed, Wifi, Snowflake, Tv, Wine, DoorOpen, Eye, Droplet, X } from "lucide-react"
import { hotelApi, chambreApi } from "./services/api"
import HotelMap from "./HotelMap"
import { useDevise } from "./useDevise"

interface HotelDetailPageProps {
  hotelId: number
  onBack: () => void
}

const HOTEL_EQUIPEMENT_ICONS: Record<string, { icon: any; label: string }> = {
  piscine: { icon: Waves, label: "Piscine" },
  plage: { icon: Umbrella, label: "Plage" },
  parking: { icon: ParkingCircle, label: "Parking" },
  spa: { icon: Sparkles, label: "Spa" },
  restaurant: { icon: UtensilsCrossed, label: "Restaurant" },
  wifi: { icon: Wifi, label: "Wifi" },
}

const CHAMBRE_EQUIPEMENT_ICONS: Record<string, { icon: any; label: string }> = {
  wifi: { icon: Wifi, label: "Wifi" },
  clim: { icon: Snowflake, label: "Climatisation" },
  tv: { icon: Tv, label: "TV" },
  minibar: { icon: Wine, label: "Minibar" },
  balcon: { icon: DoorOpen, label: "Balcon" },
  vueMer: { icon: Eye, label: "Vue mer" },
  jacuzzi: { icon: Droplet, label: "Jacuzzi" },
}

function equipementsToArray(obj: any): string[] {
  if (!obj) return []
  return Object.keys(obj).filter(key => obj[key] === true)
}

export default function HotelDetailPage({ hotelId, onBack }: HotelDetailPageProps) {
  const navigate = useNavigate()
  const { formatPrice } = useDevise()
  const [hotel, setHotel] = useState<any>(null)
  const [chambres, setChambres] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activePhoto, setActivePhoto] = useState(0)
  const [mapExpanded, setMapExpanded] = useState(false)

  const [roomGallery, setRoomGallery] = useState<{ photos: string[]; index: number } | null>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      hotelApi.getOne(hotelId),
      chambreApi.getByHotel(hotelId),
    ])
      .then(([hotelRes, chambresRes]) => {
        setHotel(hotelRes.data)
        setChambres(chambresRes.data)
        setActivePhoto(0)
      })
      .catch(err => console.error('Erreur chargement détail hôtel:', err))
      .finally(() => setLoading(false))
  }, [hotelId])

  const openRoomGallery = (photos: string[], startIndex = 0) => {
    if (!photos || photos.length === 0) return
    setRoomGallery({ photos, index: startIndex })
  }

  if (loading) return <div className="p-6 text-gray-400">Chargement...</div>
  if (!hotel) return <div className="p-6 text-gray-400">Hôtel introuvable</div>

  const photos = hotel.photos || []
  const hotelEquipements = equipementsToArray(hotel.equipements)

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Retour aux hôtels
      </button>

      {/* Galerie photos hôtel */}
      <div className="relative">
        <div className="h-96 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
          {photos.length > 0 ? (
            <img
              src={`http://localhost:3000${photos[activePhoto]}`}
              alt={hotel.nom}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">Pas de photo</div>
          )}
        </div>
        {photos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg">
            {photos.map((p: string, i: number) => (
              <button
                key={i}
                onClick={() => setActivePhoto(i)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  activePhoto === i ? 'border-amber-500 scale-105' : 'border-white opacity-80 hover:opacity-100 hover:scale-105'
                }`}
              >
                <img src={`http://localhost:3000${p}`} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Infos hôtel + carte */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        <div className="flex-1 md:basis-3/4 bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{hotel.nom}</h1>
              <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                <MapPin className="w-4 h-4" /> {hotel.ville}
              </div>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              {Array.from({ length: hotel.etoiles }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>

          {hotel.description && (
            <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
          )}

          {hotelEquipements.length > 0 && (
            <div className="pt-4 border-t border-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-3">Équipements</p>
              <div className="flex flex-wrap gap-3">
                {hotelEquipements.map(key => {
                  const eq = HOTEL_EQUIPEMENT_ICONS[key]
                  if (!eq) return null
                  const Icon = eq.icon
                  return (
                    <div key={key} className="flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-lg text-sm text-amber-700">
                      <Icon className="w-4 h-4" />
                      {eq.label}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Carte OpenStreetMap — coordonnées récupérées via Nominatim (backend /geo/geocode) */}
        <div
          onClick={() => setMapExpanded(true)}
          className="md:basis-1/4 min-h-[220px] bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden cursor-pointer relative group"
        >
          <div className="absolute inset-0 z-[500] group-hover:bg-black/5 transition-colors pointer-events-none" />
          <HotelMap nom={hotel.nom} ville={hotel.ville} adresse={hotel.adresse} interactive={false} />
        </div>
      </div>

      {/* Modal carte agrandie */}
      {mapExpanded && (
        <div
          className="fixed inset-0 z-[1000] bg-black/60 flex items-center justify-center p-4 md:p-10"
          onClick={() => setMapExpanded(false)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden w-full h-[80vh] max-w-5xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMapExpanded(false)}
              className="absolute top-4 right-4 z-[1100] w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-50 transition"
              aria-label="Fermer la carte"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <HotelMap nom={hotel.nom} ville={hotel.ville} adresse={hotel.adresse} interactive={true} />
          </div>
        </div>
      )}

      {/* Chambres disponibles */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Chambres disponibles</h2>

        {chambres.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
            <p className="text-gray-500">Aucune chambre disponible pour cet hôtel</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {chambres.map(chambre => {
              const chambreEquipements = equipementsToArray(chambre.equipements)
              const chambrePhotos = chambre.photos || []
              const photo = chambrePhotos.length > 0 ? chambrePhotos[0] : null

              return (
                <div key={chambre.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex">
                  <button
                    onClick={() => openRoomGallery(chambrePhotos)}
                    className="w-32 shrink-0 bg-gray-100 relative group cursor-pointer"
                    disabled={chambrePhotos.length === 0}
                  >
                    {photo ? (
                      <>
                        <img src={`http://localhost:3000${photo}`} alt={chambre.type} className="w-full h-full object-cover" />
                        {chambrePhotos.length > 1 && (
                          <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                            +{chambrePhotos.length - 1}
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Pas de photo</div>
                    )}
                  </button>

                  <div className="flex-1 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800">{chambre.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        chambre.dispo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {chambre.dispo ? 'Disponible' : 'Indisponible'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {chambre.nbLits} lit(s)</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {chambre.nbPersonnes} pers.</span>
                      <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" /> {chambre.surface} m²</span>
                    </div>

                    {chambreEquipements.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {chambreEquipements.slice(0, 4).map(key => {
                          const eq = CHAMBRE_EQUIPEMENT_ICONS[key]
                          if (!eq) return null
                          const Icon = eq.icon
                          return (
                            <div key={key} className="w-6 h-6 rounded bg-gray-50 flex items-center justify-center" title={eq.label}>
                              <Icon className="w-3.5 h-3.5 text-gray-500" />
                            </div>
                          )
                        })}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <span className="font-bold text-amber-600">{formatPrice(Number(chambre.prix))}<span className="text-xs text-gray-400 font-normal">/nuit</span></span>
                      <button
                        onClick={() => navigate(`/reservation/${chambre.id}`)}
                        disabled={!chambre.dispo}
                        className="px-4 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Réserver
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Lightbox galerie chambre */}
      {roomGallery && (
        <div
          className="fixed inset-0 bg-black/80 z-[2000] flex items-center justify-center p-4"
          onClick={() => setRoomGallery(null)}
        >
          <button
            onClick={() => setRoomGallery(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="max-w-3xl w-full space-y-4" onClick={e => e.stopPropagation()}>
            <div className="h-96 rounded-2xl overflow-hidden bg-white flex items-center justify-center">
              <img
                src={`http://localhost:3000${roomGallery.photos[roomGallery.index]}`}
                alt=""
                className="w-full h-full object-contain"
              />
            </div>

            {roomGallery.photos.length > 1 && (
              <div className="flex justify-center gap-3">
                {roomGallery.photos.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setRoomGallery(prev => prev ? { ...prev, index: i } : null)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      roomGallery.index === i ? 'border-amber-500 scale-105' : 'border-white/30 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={`http://localhost:3000${p}`} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}