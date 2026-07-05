import { useState } from 'react';
import { useDevise } from './useDevise';
import { formatDateFr } from './utils/date';

interface HistoriqueProps {
  reservations: any[];
}

export default function Historique({ reservations }: HistoriqueProps) {
  const { formatPrice } = useDevise()
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = reservations.filter(r =>
    r.chambre?.hotel?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.chambre?.type?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalMontant = reservations.reduce((sum, r) => sum + Number(r.montant), 0)

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Historique</h2>
          <p className="text-sm text-gray-500 mt-1">{reservations.length} réservation(s)</p>
        </div>
        <div className="bg-white rounded-xl px-4 py-2 border">
          <p className="text-xs text-gray-500">Montant total</p>
          <p className="text-lg font-bold text-amber-600">{formatPrice(totalMontant)}</p>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher..."
          className="w-full px-4 py-2 pl-10 border rounded-lg"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border">
            <p className="text-gray-500">Aucune réservation annulée</p>
          </div>
        ) : (
          filtered.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border p-4 hover:shadow-md">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-600">
                      {r.statut}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Hôtel</p>
                      <p className="font-medium">{r.chambre?.hotel?.nom}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Chambre</p>
                      <p>{r.chambre?.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Dates</p>
                      <p>{formatDateFr(r.arrivee)} → {formatDateFr(r.depart)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Montant</p>
                      <p className="font-bold text-amber-600">{formatPrice(Number(r.montant))}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}