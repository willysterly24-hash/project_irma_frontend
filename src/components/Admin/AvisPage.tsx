import { useState, useEffect } from "react"
import { avisApi } from "../../services/api"

export default function AvisPage() {
  const [avis, setAvis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAvis()
  }, [])

  const fetchAvis = async () => {
    try {
      const response = await avisApi.getAll()
      setAvis(response.data)
    } catch (error) {
      console.error('Erreur chargement avis:', error)
    } finally {
      setLoading(false)
    }
  }

  const del = async (id: number) => {
    if (!window.confirm("Supprimer cet avis ?")) return
    try {
      await avisApi.delete(id)
      setAvis(prev => prev.filter(a => a.id !== id))
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }

  if (loading) return <p style={{ padding: 32, color: "#9ca3af" }}>Chargement...</p>

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1f2937", margin: "0 0 2px" }}>Gestion des avis</h2>
          <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>{avis.length} avis enregistrés</p>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 14, border: "1px solid #f0f0f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Client", "Hôtel", "Note", "Commentaire", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {avis.map(a => (
              <tr key={a.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                <td style={{ padding: "14px 16px", fontWeight: 600, color: "#1f2937" }}>{a.nom}</td>
                <td style={{ padding: "14px 16px", color: "#6b7280" }}>{a.hotel}</td>
                <td style={{ padding: "14px 16px" }}>{"⭐".repeat(a.note)}</td>
                <td style={{ padding: "14px 16px", color: "#374151", maxWidth: 320 }}>{a.commentaire}</td>
                <td style={{ padding: "14px 16px" }}>
                  <button onClick={() => del(a.id)} style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {avis.length === 0 && (
          <p style={{ padding: 24, textAlign: "center", color: "#9ca3af" }}>Aucun avis pour le moment.</p>
        )}
      </div>
    </div>
  )
}
