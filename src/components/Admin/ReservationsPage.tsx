import { useState } from "react"
import type { Reservation } from "../../types"
import { initialReservations } from "../../data"
import Badge from "../ui/Badge"

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations)
  const [search, setSearch] = useState("")

  const confirm = (id: number) => setReservations(prev => prev.map(r => r.id === id ? { ...r, statut: "Confirmé" } : r))
  const cancel  = (id: number) => setReservations(prev => prev.map(r => r.id === id ? { ...r, statut: "Annulé"   } : r))

  const filtered = reservations.filter(r =>
    r.client.toLowerCase().includes(search.toLowerCase()) ||
    r.hotel.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1f2937", margin: "0 0 2px" }}>Gestion des réservations</h2>
          <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>{reservations.length} réservations au total</p>
        </div>
        <input
          placeholder="Rechercher client ou hôtel..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 14px", fontSize: 13, width: 240, outline: "none" }}
        />
      </div>

      <div style={{ background: "white", borderRadius: 14, border: "1px solid #f0f0f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Client", "Hôtel", "Chambre", "Arrivée", "Départ", "Montant", "Statut", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                <td style={{ padding: "13px 14px", fontWeight: 600, color: "#1f2937" }}>{r.client}</td>
                <td style={{ padding: "13px 14px", color: "#6b7280" }}>{r.hotel}</td>
                <td style={{ padding: "13px 14px", color: "#374151" }}>{r.chambre}</td>
                <td style={{ padding: "13px 14px", color: "#6b7280" }}>{r.arrivee}</td>
                <td style={{ padding: "13px 14px", color: "#6b7280" }}>{r.depart}</td>
                <td style={{ padding: "13px 14px", fontWeight: 700, color: "#3B82F6" }}>€ {r.montant.toLocaleString()}</td>
                <td style={{ padding: "13px 14px" }}><Badge label={r.statut} /></td>
                <td style={{ padding: "13px 14px" }}>
                  {r.statut === "En attente" && <>
                    <button onClick={() => confirm(r.id)} style={{ background: "#dcfce7", color: "#166534", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer", marginRight: 4 }}>Confirmer</button>
                    <button onClick={() => cancel(r.id)}  style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Annuler</button>
                  </>}
                  {r.statut === "Confirmé" && (
                    <button onClick={() => cancel(r.id)} style={{ background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Annuler</button>
                  )}
                  {r.statut === "Annulé" && (
                    <button onClick={() => confirm(r.id)} style={{ background: "#dbeafe", color: "#1e40af", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Rétablir</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "#9ca3af", padding: 32, fontSize: 14 }}>Aucun résultat pour "{search}"</p>
        )}
      </div>
    </div>
  )
}