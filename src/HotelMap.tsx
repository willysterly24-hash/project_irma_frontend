import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { geoApi } from './services/api'

// Marqueur personnalisé — pastille blanche transparente avec point doré, dans le style du reste de l'app
const hotelIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width: 28px; height: 28px; border-radius: 9999px;
      background: rgba(255,255,255,0.92);
      box-shadow: 0 2px 10px rgba(15,23,42,0.35);
      display: flex; align-items: center; justify-content: center;
    ">
      <div style="width: 10px; height: 10px; border-radius: 9999px; background: #D4A853;"></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
})

interface HotelMapProps {
  nom: string
  ville: string
  adresse?: string
  interactive?: boolean
}

export default function HotelMap({ nom, ville, adresse, interactive = true }: HotelMapProps) {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [zoom, setZoom] = useState(12)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(false)

    const requetePrecise = adresse ? `${adresse}, ${ville}` : ville

    geoApi.geocode(requetePrecise)
      .then(res => {
        if (cancelled) return
        setCoords({ lat: res.data.lat, lon: res.data.lon })
        setZoom(adresse ? 15 : 12) // zoom plus serré si on a une adresse précise
      })
      .catch(() => {
        // L'adresse précise n'a rien donné → on retombe sur la ville seule
        if (adresse) {
          geoApi.geocode(ville)
            .then(res => {
              if (!cancelled) { setCoords({ lat: res.data.lat, lon: res.data.lon }); setZoom(12) }
            })
            .catch(() => { if (!cancelled) setError(true) })
        } else if (!cancelled) {
          setError(true)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [ville, adresse])

  if (loading) {
    return (
      <div className="w-full h-full min-h-[220px] flex items-center justify-center text-gray-300 text-sm">
        Chargement de la carte…
      </div>
    )
  }

  if (error || !coords) {
    return (
      <div className="w-full h-full min-h-[220px] flex items-center justify-center text-gray-300 text-sm text-center px-4">
        Carte indisponible pour "{ville}"
      </div>
    )
  }

  return (
    <MapContainer
      center={[coords.lat, coords.lon]}
      zoom={zoom}
      scrollWheelZoom={interactive}
      dragging={interactive}
      doubleClickZoom={interactive}
      touchZoom={interactive}
      zoomControl={interactive}
      attributionControl={interactive}
      className="w-full h-full min-h-[220px] rounded-2xl"
      style={{ pointerEvents: interactive ? 'auto' : 'none' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[coords.lat, coords.lon]} icon={hotelIcon}>
        <Popup>{nom} — {ville}</Popup>
      </Marker>
    </MapContainer>
  )
}
