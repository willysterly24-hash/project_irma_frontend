import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { avisApi, hotelApi } from './services/api'
import { useAuth } from './useAuth'

export default function Avis() {
  const { user } = useAuth()
  const [note, setNote] = useState(0)
  const [hover, setHover] = useState(0)
  const [commentaire, setCommentaire] = useState('')
  const [hotel, setHotel] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hotels, setHotels] = useState<any[]>([])

  useEffect(() => {
  hotelApi.getAll().then(res => setHotels(res.data)).catch(() => {})
}, [])

  const handleSubmit = async () => {
    if (!note || !commentaire || !hotel) return
    setLoading(true)
    try {
      await avisApi.create({
        nom: user?.name || 'Anonyme',
        hotel,
        commentaire,
        note,
      })
      setSubmitted(true)
    } catch (error) {
      console.error('Erreur envoi avis:', error)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="text-4xl">🎉</div>
      <p className="text-lg font-semibold text-gray-700">Merci pour votre avis !</p>
      <button onClick={() => { setSubmitted(false); setNote(0); setCommentaire(''); setHotel('') }}
        className="text-amber-600 underline text-sm">Donner un autre avis</button>
    </div>
  )

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Laisser un avis</h1>

      <div className="bg-white rounded-xl p-5 shadow-sm border space-y-2">
        <label className="text-sm font-medium text-gray-700">Hôtel concerné</label>
        <select
          value={hotel}
          onChange={e => setHotel(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
        >
          <option value="">Sélectionnez un hôtel...</option>
          {hotels.map(h => (
            <option key={h.id} value={h.nom || h.name}>
              {h.nom || h.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border space-y-2">
        <label className="text-sm font-medium text-gray-700">Note</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button key={star}
              onClick={() => setNote(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            >
              <Star className={`w-8 h-8 transition-colors ${star <= (hover || note) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border space-y-2">
        <label className="text-sm font-medium text-gray-700">Commentaire</label>
        <textarea
          value={commentaire}
          onChange={e => setCommentaire(e.target.value)}
          placeholder="Décrivez votre expérience..."
          rows={4}
          className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!note || !commentaire || !hotel || loading}
        className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors"
      >
        {loading ? 'Envoi en cours...' : 'Envoyer mon avis'}
      </button>
    </div>
  )
}