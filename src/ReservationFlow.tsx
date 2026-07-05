import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, X, Calendar, Users, Bed, MapPin, Star, CreditCard, Check, Lock,
  Maximize, Waves, Umbrella, ParkingCircle, Sparkles, UtensilsCrossed, Wifi,
  Snowflake, Tv, Wine, DoorOpen, Eye, Droplet, ShieldCheck,
} from 'lucide-react'
import { chambreApi, reservationApi } from './services/api'
import { useAuth } from './useAuth'
import { useDevise } from './useDevise'
import visaMastercardLogo from './assets/visa-mastercard.jpg'
import visaLogo from './assets/visa-logo.jpg'
import mastercardLogo from './assets/mastercard-logo.jpg'
import paypalLogo from './assets/paypal-logo.jpg'
import { formatDateFr } from './utils/date'

type Step = 1 | 2 | 3

const STEPS = [
  { num: 1, label: 'Détails' },
  { num: 2, label: 'Récapitulatif' },
  { num: 3, label: 'Paiement' },
]

const CHAMBRE_EQUIPEMENT_ICONS: Record<string, { icon: any; label: string }> = {
  wifi: { icon: Wifi, label: 'Wifi gratuit' },
  clim: { icon: Snowflake, label: 'Climatisation' },
  tv: { icon: Tv, label: 'TV' },
  minibar: { icon: Wine, label: 'Minibar' },
  balcon: { icon: DoorOpen, label: 'Balcon' },
  vueMer: { icon: Eye, label: 'Vue mer' },
  jacuzzi: { icon: Droplet, label: 'Jacuzzi' },
}

const HOTEL_EQUIPEMENT_ICONS: Record<string, { icon: any; label: string }> = {
  piscine: { icon: Waves, label: 'Piscine' },
  plage: { icon: Umbrella, label: 'Plage' },
  parking: { icon: ParkingCircle, label: 'Parking' },
  spa: { icon: Sparkles, label: 'Spa' },
  restaurant: { icon: UtensilsCrossed, label: 'Restaurant' },
  wifi: { icon: Wifi, label: 'Wifi' },
}

function equipementsToArray(obj: any): string[] {
  if (!obj) return []
  return Object.keys(obj).filter(key => obj[key] === true)
}

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

// Détecte le réseau de la carte à partir des premiers chiffres (comme un vrai formulaire de paiement)
function detectCardType(value: string): 'visa' | 'mastercard' | null {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 0) return null
  if (/^4/.test(digits)) return 'visa'
  if (/^5[1-5]/.test(digits) || /^2(2[2-9][1-9]|2[3-9]\d|[3-6]\d\d|7[0-1]\d|720)/.test(digits)) return 'mastercard'
  return null
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

export default function ReservationFlow() {
  const { chambreId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { formatPrice } = useDevise()

  const pourcentagePromo = Number(searchParams.get('promo')) || 0

  const [chambre, setChambre] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<Step>(1)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({ arrivee: '', depart: '', nbPersonnes: 1 })
  const [payment, setPayment] = useState({ cardNumber: '', cardName: '', expiry: '', cvv: '' })
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card')
  const [paypalEmail, setPaypalEmail] = useState('')
  const cardType = detectCardType(payment.cardNumber)

  useEffect(() => {
    if (!chambreId) return
    chambreApi.getOne(Number(chambreId))
      .then(res => setChambre(res.data))
      .catch(err => console.error('Erreur chargement chambre:', err))
      .finally(() => setLoading(false))
  }, [chambreId])

  const calculateNights = () => {
    if (!formData.arrivee || !formData.depart) return 0
    const diff = new Date(formData.depart).getTime() - new Date(formData.arrivee).getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const nights = calculateNights()
  const prixUnitaire = chambre
    ? pourcentagePromo > 0
      ? Number(chambre.prix) - (Number(chambre.prix) * pourcentagePromo) / 100
      : Number(chambre.prix)
    : 0
  const montant = prixUnitaire * nights

  const handleClose = () => navigate(-1)

  const validateStep1 = () => {
    if (!formData.arrivee || !formData.depart) { setError('Renseignez les deux dates.'); return false }
    const todayStr = new Date().toISOString().split('T')[0]
    if (formData.arrivee < todayStr) { setError('La date d\'arrivée ne peut pas être dans le passé.'); return false }
    if (nights <= 0) { setError('La date de départ doit être après la date d\'arrivée.'); return false }
    if (formData.nbPersonnes < 1 || formData.nbPersonnes > chambre.nbPersonnes) {
      setError(`Le nombre de personnes doit être entre 1 et ${chambre.nbPersonnes}.`)
      return false
    }
    setError('')
    return true
  }

  const validatePayment = () => {
    if (paymentMethod === 'paypal') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail.trim())) {
        setError('Adresse email PayPal invalide.')
        return false
      }
      setError('')
      return true
    }
    const digits = payment.cardNumber.replace(/\s/g, '')
    if (digits.length !== 16) { setError('Numéro de carte invalide (16 chiffres).'); return false }
    if (!cardType) { setError('Carte non reconnue. Seules les cartes Visa et Mastercard sont acceptées.'); return false }
    if (!payment.cardName.trim()) { setError('Nom du titulaire requis.'); return false }
    if (!/^\d{2}\/\d{2}$/.test(payment.expiry)) { setError('Date d\'expiration invalide (MM/AA).'); return false }
    if (payment.cvv.length !== 3) { setError('CVV invalide (3 chiffres).'); return false }
    setError('')
    return true
  }

  const goNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 3) { handlePay(); return }
    setStep(s => (s + 1) as Step)
  }

  const goBack = () => {
    if (step === 1) { handleClose(); return }
    setStep(s => (s - 1) as Step)
  }

  const handlePay = async () => {
    if (!validatePayment()) return
    setSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    try {
      await reservationApi.create({
        arrivee: formData.arrivee,
        depart: formData.depart,
        nbPersonnes: formData.nbPersonnes,
        userId: Number(user?.id),
        chambreId: Number(chambreId),
        pourcentagePromo: pourcentagePromo,
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la réservation.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-stone-400" style={{ fontSize: '14px' }}>Chargement...</div>
  }

  if (!chambre) {
    return <div className="min-h-screen flex items-center justify-center text-stone-400" style={{ fontSize: '14px' }}>Chambre introuvable</div>
  }

  const chambrePhoto = chambre.photos && chambre.photos.length > 0 ? `http://localhost:3000${chambre.photos[0]}` : null
  const hotelPhoto = chambre.hotel?.photos && chambre.hotel.photos.length > 0 ? `http://localhost:3000${chambre.hotel.photos[0]}` : null
  const bannerPhoto = chambrePhoto || hotelPhoto
  const chambreEquipements = equipementsToArray(chambre.equipements)
  const hotelEquipements = equipementsToArray(chambre.hotel?.equipements)

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#FAFAF8' }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600&family=Jost:wght@300;400;500&display=swap');`}</style>
        <div className="bg-white max-w-md w-full text-center p-10 space-y-5" style={{ borderRadius: '4px', border: '1px solid #F0EDE8' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: '#ECFDF5' }}>
            <Check className="w-8 h-8" style={{ color: '#059669' }} />
          </div>
          <h1
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '28px', fontWeight: '500', color: '#0F172A' }}
          >
            Réservation confirmée
          </h1>
          <p className="text-stone-500" style={{ fontSize: '14px', lineHeight: '1.7' }}>
            Votre réservation pour <strong>{chambre.hotel?.nom}</strong> a bien été enregistrée.
            Elle est actuellement en statut <em>« En attente »</em>.
          </p>
          <button
            onClick={() => navigate('/dashboards/user')}
            className="w-full py-3.5 transition-all duration-200 hover:opacity-90"
            style={{
              background: '#D4A853', color: '#0F172A', fontWeight: '600',
              fontSize: '13px', letterSpacing: '0.05em', textTransform: 'uppercase', borderRadius: '2px',
            }}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600&family=Jost:wght@300;400;500&display=swap');
        * { font-family: 'Jost', sans-serif; }
      `}</style>

      {/* ====== TOP BAR ====== */}
      <div className="bg-white sticky top-0 z-20" style={{ borderBottom: '1px solid #F0EDE8' }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={goBack} className="flex items-center gap-2 text-stone-500 hover:text-amber-600 transition-colors" style={{ fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '22px', fontWeight: '500', letterSpacing: '0.15em', color: '#0F172A' }}>
            IRMA
          </span>
          <button onClick={handleClose} className="w-9 h-9 flex items-center justify-center hover:bg-stone-50 transition-colors" style={{ borderRadius: '2px' }}>
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        {/* Stepper */}
        <div className="max-w-2xl mx-auto px-6 pb-5 flex items-center">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors"
                  style={{
                    background: step === s.num ? '#D4A853' : step > s.num ? '#059669' : '#F0EDE8',
                    color: step >= s.num ? 'white' : '#A8A29E',
                  }}
                >
                  {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span
                  className="hidden sm:block"
                  style={{ fontSize: '12px', fontWeight: step === s.num ? '600' : '400', color: step >= s.num ? '#0F172A' : '#A8A29E' }}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-3" style={{ background: step > s.num ? '#059669' : '#F0EDE8' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ====== BANNIÈRE PHOTO ====== */}
      <div className="relative" style={{ height: '260px', background: '#E7E2DA' }}>
        {bannerPhoto ? (
          <img src={bannerPhoto} alt={chambre.hotel?.nom} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400" style={{ fontSize: '13px' }}>
            Pas de photo
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.75) 0%, rgba(15,23,42,0.1) 55%, transparent 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: chambre.hotel?.etoiles || 0 }).map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <h1 className="text-white" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '400' }}>
              {chambre.hotel?.nom}
            </h1>
            <div className="flex items-center gap-1.5 text-white/70 mt-1" style={{ fontSize: '13px' }}>
              <MapPin className="w-3.5 h-3.5" /> {chambre.hotel?.ville}
            </div>
          </div>
        </div>
      </div>

      {/* ====== TRUST STRIP ====== */}
      <div style={{ background: '#0F172A', padding: '12px 0' }}>
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-center gap-8 flex-wrap">
          {[
            { icon: ShieldCheck, label: 'Paiement sécurisé' },
            { icon: Lock, label: 'Données protégées' },
          ].map(({ icon: Icon, label }, i) => (
            <div key={label} className="flex items-center gap-2">
              {i > 0 && <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)' }} />}
              <Icon className="w-3.5 h-3.5" style={{ color: '#D4A853' }} />
              <span className="text-white/50 uppercase" style={{ fontSize: '10px', letterSpacing: '0.12em' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ====== CONTENU ====== */}
      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="md:col-span-2 flex flex-col gap-5 h-full">
          {error && (
            <div className="px-4 py-3" style={{ background: '#FEF2F2', color: '#DC2626', fontSize: '13px', borderRadius: '2px' }}>
              {error}
            </div>
          )}

          {/* Étape 1 */}
          {step === 1 && (
            <div className="bg-white p-7 space-y-6 flex-1 flex flex-col" style={{ border: '1px solid #F0EDE8', borderRadius: '4px' }}>
              <div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '24px', fontWeight: '500', color: '#0F172A' }}>
                  Détails du séjour
                </h2>
                <p className="text-stone-400 mt-1" style={{ fontSize: '13px' }}>
                  Chambre {chambre.type} —{' '}
                  {pourcentagePromo > 0 ? (
                    <>
                      <span className="line-through text-stone-300 mr-1.5">{formatPrice(Number(chambre.prix))}</span>
                      <span style={{ color: '#D4A853', fontWeight: '600' }}>{formatPrice(prixUnitaire)}</span> / nuit
                      <span className="ml-1.5 px-1.5 py-0.5" style={{ background: '#FDF8ED', color: '#D4A853', fontSize: '11px', borderRadius: '2px', fontWeight: '600' }}>-{pourcentagePromo}%</span>
                    </>
                  ) : (
                    <>{formatPrice(Number(chambre.prix))} / nuit</>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 mb-2 text-stone-600" style={{ fontSize: '12px', fontWeight: '500' }}>
                    <Calendar className="w-4 h-4" style={{ color: '#D4A853' }} /> Arrivée
                  </label>
                  <input
                    type="date"
                    value={formData.arrivee}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setFormData({ ...formData, arrivee: e.target.value, depart: formData.depart && formData.depart < e.target.value ? '' : formData.depart })}
                    className="w-full px-4 py-3 outline-none focus:ring-1 focus:ring-amber-400 transition-all"
                    style={{ border: '1px solid #E7E2DA', borderRadius: '2px', fontSize: '14px' }}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-stone-600" style={{ fontSize: '12px', fontWeight: '500' }}>Départ</label>
                  <input
                    type="date"
                    value={formData.depart}
                    min={formData.arrivee || new Date().toISOString().split('T')[0]}
                    onChange={e => setFormData({ ...formData, depart: e.target.value })}
                    className="w-full px-4 py-3 outline-none focus:ring-1 focus:ring-amber-400 transition-all"
                    style={{ border: '1px solid #E7E2DA', borderRadius: '2px', fontSize: '14px' }}
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2 text-stone-600" style={{ fontSize: '12px', fontWeight: '500' }}>
                  <Users className="w-4 h-4" style={{ color: '#D4A853' }} /> Nombre de personnes
                  <span className="text-stone-400 font-normal">(max {chambre.nbPersonnes})</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={chambre.nbPersonnes}
                  value={formData.nbPersonnes}
                  onChange={e => {
                    const val = Math.max(1, Math.min(+e.target.value, chambre.nbPersonnes))
                    setFormData({ ...formData, nbPersonnes: val })
                  }}
                  className="w-full max-w-[200px] px-4 py-3 outline-none focus:ring-1 focus:ring-amber-400 transition-all"
                  style={{ border: '1px solid #E7E2DA', borderRadius: '2px', fontSize: '14px' }}
                />
              </div>

              {nights > 0 && (
                <div className="p-4 flex justify-between items-center" style={{ background: '#FDF8ED', borderRadius: '2px' }}>
                  <span className="text-stone-600" style={{ fontSize: '13px' }}>
                    {nights} nuit{nights > 1 ? 's' : ''} × {formatPrice(prixUnitaire)}
                  </span>
                  <span style={{ fontWeight: '700', color: '#D4A853', fontSize: '15px' }}>{formatPrice(montant)}</span>
                </div>
              )}
            </div>
          )}

          {/* Étape 2 */}
          {step === 2 && (
            <div className="bg-white p-7 space-y-5 flex-1 flex flex-col" style={{ border: '1px solid #F0EDE8', borderRadius: '4px' }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '24px', fontWeight: '500', color: '#0F172A' }}>
                Récapitulatif
              </h2>

              <div className="grid grid-cols-2 gap-5">
                {[
                  ['Hôtel', chambre.hotel?.nom],
                  ['Chambre', chambre.type],
                  ['Arrivée', formatDateFr(formData.arrivee)],
                  ['Départ', formatDateFr(formData.depart)],
                  ['Durée', `${nights} nuit${nights > 1 ? 's' : ''}`],
                  ['Personnes', String(formData.nbPersonnes)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-stone-400 uppercase mb-1" style={{ fontSize: '10px', letterSpacing: '0.08em' }}>{label}</p>
                    <p className="text-stone-800" style={{ fontSize: '14px', fontWeight: '500' }}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="pt-5 flex justify-between items-center" style={{ borderTop: '1px solid #F0EDE8' }}>
                <span className="text-stone-700" style={{ fontSize: '14px', fontWeight: '500' }}>Total à payer</span>
                <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '26px', fontWeight: '600', color: '#D4A853' }}>
                  {formatPrice(montant)}
                </span>
              </div>
            </div>
          )}

          {/* Étape 3 */}
          {step === 3 && (
            <div className="bg-white p-7 space-y-6 flex-1 flex flex-col" style={{ border: '1px solid #F0EDE8', borderRadius: '4px' }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-5 h-5" style={{ color: '#D4A853' }} />
                    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '24px', fontWeight: '500', color: '#0F172A' }}>
                      Paiement
                    </h2>
                  </div>
                  <p className="flex items-center gap-1.5 text-stone-400" style={{ fontSize: '12px' }}>
                    <Lock className="w-3.5 h-3.5" /> Aucun débit réel ne sera effectué.
                  </p>
                </div>
                <img
                  src={paymentMethod === 'paypal' ? paypalLogo : visaMastercardLogo}
                  alt={paymentMethod === 'paypal' ? 'PayPal' : 'Visa, Mastercard'}
                  className="h-6 w-auto object-contain shrink-0 mt-1"
                />
              </div>

              {/* Choix du mode de paiement */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className="flex-1 py-2.5 text-center transition-all"
                  style={{
                    fontSize: '13px', fontWeight: '600', borderRadius: '2px',
                    border: paymentMethod === 'card' ? '1px solid #D4A853' : '1px solid #E7E2DA',
                    background: paymentMethod === 'card' ? '#FDF8ED' : 'white',
                    color: paymentMethod === 'card' ? '#D4A853' : '#78716C',
                  }}
                >
                  Carte bancaire
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className="flex-1 py-2.5 flex items-center justify-center transition-all"
                  style={{
                    borderRadius: '2px',
                    border: paymentMethod === 'paypal' ? '1px solid #D4A853' : '1px solid #E7E2DA',
                    background: paymentMethod === 'paypal' ? '#FDF8ED' : 'white',
                  }}
                >
                  <img src={paypalLogo} alt="PayPal" className="h-5 w-auto object-contain" />
                </button>
              </div>

              {paymentMethod === 'card' ? (
                <>
                  <div>
                    <label className="block mb-2 text-stone-600" style={{ fontSize: '12px', fontWeight: '500' }}>Numéro de carte</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        value={payment.cardNumber}
                        onChange={e => setPayment({ ...payment, cardNumber: formatCardNumber(e.target.value) })}
                        maxLength={19}
                        className="w-full px-4 py-3 outline-none focus:ring-1 focus:ring-amber-400 transition-all font-mono"
                        style={{ border: '1px solid #E7E2DA', borderRadius: '2px', fontSize: '14px', paddingRight: cardType ? '56px' : undefined }}
                      />
                      {cardType && (
                        <img
                          src={cardType === 'visa' ? visaLogo : mastercardLogo}
                          alt={cardType === 'visa' ? 'Visa' : 'Mastercard'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-auto object-contain"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-stone-600" style={{ fontSize: '12px', fontWeight: '500' }}>Titulaire de la carte</label>
                    <input
                      type="text"
                      placeholder="Prénom Nom"
                      value={payment.cardName}
                      onChange={e => setPayment({ ...payment, cardName: e.target.value })}
                      className="w-full px-4 py-3 outline-none focus:ring-1 focus:ring-amber-400 transition-all"
                      style={{ border: '1px solid #E7E2DA', borderRadius: '2px', fontSize: '14px' }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-stone-600" style={{ fontSize: '12px', fontWeight: '500' }}>Expiration</label>
                      <input
                        type="text"
                        placeholder="MM/AA"
                        value={payment.expiry}
                        onChange={e => setPayment({ ...payment, expiry: formatExpiry(e.target.value) })}
                        maxLength={5}
                        className="w-full px-4 py-3 outline-none focus:ring-1 focus:ring-amber-400 transition-all font-mono"
                        style={{ border: '1px solid #E7E2DA', borderRadius: '2px', fontSize: '14px' }}
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-stone-600" style={{ fontSize: '12px', fontWeight: '500' }}>CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={payment.cvv}
                        onChange={e => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                        maxLength={3}
                        className="w-full px-4 py-3 outline-none focus:ring-1 focus:ring-amber-400 transition-all font-mono"
                        style={{ border: '1px solid #E7E2DA', borderRadius: '2px', fontSize: '14px' }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8 px-6" style={{ border: '1px dashed #E7E2DA', borderRadius: '4px' }}>
                  <img src={paypalLogo} alt="PayPal" className="h-8 w-auto object-contain" />
                  <p className="text-stone-500 text-center" style={{ fontSize: '13px' }}>
                    Connectez-vous avec votre compte PayPal pour finaliser le paiement.
                  </p>
                  <div className="w-full max-w-xs">
                    <label className="block mb-2 text-stone-600 text-center" style={{ fontSize: '12px', fontWeight: '500' }}>Email PayPal</label>
                    <input
                      type="email"
                      placeholder="prenom.nom@email.com"
                      value={paypalEmail}
                      onChange={e => setPaypalEmail(e.target.value)}
                      className="w-full px-4 py-3 outline-none focus:ring-1 focus:ring-amber-400 transition-all text-center"
                      style={{ border: '1px solid #E7E2DA', borderRadius: '2px', fontSize: '14px' }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={goNext}
            disabled={submitting}
            className="w-full py-4 transition-all duration-200 hover:opacity-90 disabled:opacity-50"
            style={{
              background: '#D4A853', color: '#0F172A', fontWeight: '600',
              fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', borderRadius: '2px',
            }}
          >
            {submitting ? 'Traitement en cours...' : step === 3 ? `${paymentMethod === 'paypal' ? 'Payer avec PayPal' : 'Payer'} ${formatPrice(montant)}` : 'Continuer'}
          </button>
        </div>

        {/* Sidebar récap */}
        <div className="md:col-span-1 h-full">
          <div className="bg-white overflow-hidden sticky top-40 h-full flex flex-col" style={{ border: '1px solid #F0EDE8', borderRadius: '4px' }}>
            <div style={{ height: '150px', background: '#F5F2EC' }}>
              {chambrePhoto ? (
                <img src={chambrePhoto} alt={chambre.type} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400" style={{ fontSize: '12px' }}>
                  Pas de photo
                </div>
              )}
            </div>

            <div className="p-5 space-y-4 flex-1 flex flex-col">
              <div>
                <div className="flex items-center gap-1.5 text-stone-400 mb-1.5" style={{ fontSize: '12px' }}>
                  <MapPin className="w-3.5 h-3.5" /> {chambre.hotel?.ville}
                </div>
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '19px', fontWeight: '500', color: '#0F172A' }}>
                  {chambre.hotel?.nom}
                </p>
                <div className="flex items-center gap-0.5 mt-1">
                  {Array.from({ length: chambre.hotel?.etoiles || 0 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 text-stone-500 pt-3" style={{ borderTop: '1px solid #F0EDE8', fontSize: '12px' }}>
                <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {chambre.nbLits} lit(s)</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {chambre.nbPersonnes} pers.</span>
                <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" /> {chambre.surface} m²</span>
              </div>

              {(chambreEquipements.length > 0 || hotelEquipements.length > 0) && (
                <div className="pt-3 space-y-2" style={{ borderTop: '1px solid #F0EDE8' }}>
                  <p className="text-stone-400 uppercase" style={{ fontSize: '10px', letterSpacing: '0.08em' }}>Ce qui est inclus</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {chambreEquipements.slice(0, 4).map(key => {
                      const eq = CHAMBRE_EQUIPEMENT_ICONS[key]
                      if (!eq) return null
                      const Icon = eq.icon
                      return (
                        <span key={key} className="flex items-center gap-1.5 text-stone-600" style={{ fontSize: '12px' }}>
                          <Icon className="w-3.5 h-3.5" style={{ color: '#D4A853' }} /> {eq.label}
                        </span>
                      )
                    })}
                    {hotelEquipements.slice(0, 2).map(key => {
                      const eq = HOTEL_EQUIPEMENT_ICONS[key]
                      if (!eq) return null
                      const Icon = eq.icon
                      return (
                        <span key={key} className="flex items-center gap-1.5 text-stone-600" style={{ fontSize: '12px' }}>
                          <Icon className="w-3.5 h-3.5" style={{ color: '#D4A853' }} /> {eq.label}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="pt-3" style={{ borderTop: '1px solid #F0EDE8' }}>
                <p className="text-stone-400" style={{ fontSize: '11px' }}>Prix</p>
                {pourcentagePromo > 0 && (
                  <p className="text-stone-300 line-through" style={{ fontSize: '12px' }}>
                    {formatPrice(Number(chambre.prix))}
                  </p>
                )}
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#D4A853' }}>
                  {formatPrice(prixUnitaire)}
                  <span className="text-stone-400 font-normal" style={{ fontSize: '12px' }}> /nuit</span>
                </p>
                {nights > 0 && (
                  <p className="text-stone-500 mt-1" style={{ fontSize: '12px' }}>
                    Total {nights} nuit{nights > 1 ? 's' : ''} : <strong style={{ color: '#0F172A' }}>{formatPrice(montant)}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}