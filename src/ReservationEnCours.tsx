import { useState, useEffect } from 'react';
import { Calendar, MapPin, Bed, Users, Cloud } from 'lucide-react';
import { meteoApi, reservationApi } from './services/api';
import { useDevise } from './useDevise';
import { formatDateFr } from './utils/date';

interface ReservationsEnCoursProps {
  reservations: any[];
  profile: any;
  onRefresh: () => void;
  onBrowseHotels: () => void;
}

function MeteoWidget() {
  const [meteo, setMeteo] = useState<any[]>([])
  const [loadingMeteo, setLoadingMeteo] = useState(true)

  useEffect(() => {
    meteoApi.getVilles()
      .then(r => setMeteo(r.data))
      .catch(() => setMeteo([]))
      .finally(() => setLoadingMeteo(false))
  }, [])

  if (loadingMeteo) return <p className="text-stone-400" style={{ fontSize: '13px' }}>Chargement météo...</p>

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Cloud className="w-4 h-4" style={{ color: '#D4A853' }} />
        <h2
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '20px', fontWeight: '500', color: '#0F172A' }}
        >
          Météo des destinations
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {meteo.map((m: any) => (
          <div key={m.ville} className="bg-white p-4 text-center" style={{ border: '1px solid #F0EDE8', borderRadius: '2px' }}>
            <img src={m.icone} alt={m.description} className="w-10 h-10 mx-auto" />
            <p className="text-stone-700 mt-1" style={{ fontSize: '13px', fontWeight: '500' }}>{m.ville}</p>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#0369A1' }}>{Math.round(m.temperature)}°C</p>
            <p className="text-stone-400 capitalize" style={{ fontSize: '11px' }}>{m.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const STAT_ITEMS = (reservations: any[], formatPrice: (montant: number) => string) => {
  const cancelledCount = reservations.filter(r => r.statut === 'Annulé').length
  const confirmedCount = reservations.filter(r => r.statut === 'Confirmé').length
  const totalMontant = reservations.reduce((sum, r) => sum + Number(r.montant), 0)
  return [
    { label: 'Réservations actives', value: reservations.length, color: '#D4A853' },
    { label: 'Montant total', value: formatPrice(totalMontant), color: '#059669' },
    { label: 'Confirmées', value: confirmedCount, color: '#2563EB' },
    { label: 'Annulées', value: cancelledCount, color: '#DC2626' },
  ]
}

export default function ReservationEnCours({ reservations, profile, onRefresh, onBrowseHotels }: ReservationsEnCoursProps) {
  const { formatPrice } = useDevise()
  const handleAnnuler = async (id: number) => {
    if (confirm('Annuler cette réservation ?')) {
      try {
        await reservationApi.annuler(id)
        onRefresh()
      } catch (error) {
        console.error('Erreur annulation:', error)
      }
    }
  }

  const stats = STAT_ITEMS(reservations, formatPrice)

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600&family=Jost:wght@300;400;500&display=swap');
        * { font-family: 'Jost', sans-serif; }
      `}</style>

      <div className="max-w-5xl mx-auto px-8 py-10 space-y-8">
        {/* En-tête */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div style={{ width: '24px', height: '1px', background: '#D4A853' }} />
            <span className="text-amber-600 uppercase" style={{ fontSize: '10px', letterSpacing: '0.22em' }}>
              Mon espace
            </span>
          </div>
          <h1
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '300', color: '#0F172A' }}
          >
            Mes <em style={{ color: '#D4A853' }}>Réservations</em>
          </h1>
          <p className="text-stone-400 mt-1" style={{ fontSize: '13px' }}>Bienvenue, {profile?.name}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="bg-white p-5" style={{ border: '1px solid #F0EDE8', borderRadius: '2px' }}>
              <p className="text-stone-400" style={{ fontSize: '11px', letterSpacing: '0.03em' }}>{s.label}</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: s.color, marginTop: '4px' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Météo */}
        <MeteoWidget />

        {/* Liste réservations */}
        <div>
          <div className="flex justify-between items-center mb-5">
            <h2
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '22px', fontWeight: '500', color: '#0F172A' }}
            >
              Réservations en cours
            </h2>
            <button
              onClick={onBrowseHotels}
              className="transition-all duration-200 hover:opacity-90"
              style={{
                background: '#D4A853', color: '#0F172A', fontWeight: '600',
                fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '10px 20px', borderRadius: '2px',
              }}
            >
              Parcourir les hôtels
            </button>
          </div>

          <div className="space-y-3">
            {reservations.length === 0 ? (
              <div className="bg-white text-center py-16" style={{ border: '1px dashed #E7E2DA', borderRadius: '4px' }}>
                <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: '#E7E2DA' }} />
                <p className="text-stone-500" style={{ fontSize: '14px' }}>Aucune réservation en cours</p>
                <button
                  onClick={onBrowseHotels}
                  className="mt-3 hover:underline"
                  style={{ color: '#D4A853', fontSize: '13px', fontWeight: '500' }}
                >
                  Faire une réservation
                </button>
              </div>
            ) : (
              reservations.map(r => (
                <div key={r.id} className="bg-white p-5 transition-shadow hover:shadow-sm" style={{ border: '1px solid #F0EDE8', borderRadius: '2px' }}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <span
                        className="inline-block mb-3"
                        style={{
                          fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase',
                          padding: '4px 10px', borderRadius: '20px',
                          background: r.statut === 'Confirmé' ? '#ECFDF5' : r.statut === 'En attente' ? '#EFF6FF' : '#F5F5F4',
                          color: r.statut === 'Confirmé' ? '#059669' : r.statut === 'En attente' ? '#2563EB' : '#78716C',
                        }}
                      >
                        {r.statut}
                      </span>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-stone-400 flex items-center gap-1" style={{ fontSize: '10px' }}><MapPin className="w-3 h-3" /> Hôtel</p>
                          <p className="text-stone-800 mt-0.5" style={{ fontSize: '13px', fontWeight: '500' }}>{r.chambre?.hotel?.nom}</p>
                        </div>
                        <div>
                          <p className="text-stone-400 flex items-center gap-1" style={{ fontSize: '10px' }}><Bed className="w-3 h-3" /> Chambre</p>
                          <p className="text-stone-800 mt-0.5" style={{ fontSize: '13px', fontWeight: '500' }}>{r.chambre?.type}</p>
                        </div>
                        <div>
                          <p className="text-stone-400 flex items-center gap-1" style={{ fontSize: '10px' }}><Calendar className="w-3 h-3" /> Dates</p>
                          <p className="text-stone-800 mt-0.5" style={{ fontSize: '13px' }}>{formatDateFr(r.arrivee)} → {formatDateFr(r.depart)}</p>
                        </div>
                        <div>
                          <p className="text-stone-400 flex items-center gap-1" style={{ fontSize: '10px' }}><Users className="w-3 h-3" /> Personnes</p>
                          <p className="text-stone-800 mt-0.5" style={{ fontSize: '13px' }}>{r.nbPersonnes}</p>
                        </div>
                        <div>
                          <p className="text-stone-400" style={{ fontSize: '10px' }}>Montant</p>
                          <p className="mt-0.5" style={{ fontSize: '14px', fontWeight: '700', color: '#D4A853' }}>{formatPrice(Number(r.montant))}</p>
                        </div>
                      </div>
                    </div>
                    {r.statut === 'En attente' && (
                      <button
                        onClick={() => handleAnnuler(r.id)}
                        className="shrink-0 transition-colors hover:bg-red-100"
                        style={{
                          background: '#FEF2F2', color: '#DC2626', fontSize: '12px', fontWeight: '500',
                          padding: '8px 14px', borderRadius: '2px',
                        }}
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}