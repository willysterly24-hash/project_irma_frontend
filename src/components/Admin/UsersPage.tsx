import { useState } from "react"
import type { User } from "../../types"
import { initialUsers } from "../../data"
import Badge from "../ui/Badge"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [search, setSearch] = useState("")

  const toggleBlock = (id: number) => setUsers(prev => prev.map(u => u.id === id ? { ...u, statut: u.statut === "Actif" ? "Bloqué" : "Actif" } : u))
  const deleteUser  = (id: number) => setUsers(prev => prev.filter(u => u.id !== id))

  const filtered = users.filter(u =>
    u.nom.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1f2937", margin: "0 0 2px" }}>Gestion des utilisateurs</h2>
          <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>{users.length} utilisateurs · {users.filter(u => u.statut === "Bloqué").length} bloqué(s)</p>
        </div>
        <input
          placeholder="Rechercher un utilisateur..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 14px", fontSize: 13, width: 240, outline: "none" }}
        />
      </div>

      <div style={{ background: "white", borderRadius: 14, border: "1px solid #f0f0f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Utilisateur", "Email", "Rôle", "Réservations", "Statut", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid #f9fafb", background: u.statut === "Bloqué" ? "#fff5f5" : "white" }}>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: u.role === "Admin" ? "#ede9fe" : "#dbeafe",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, color: u.role === "Admin" ? "#6d28d9" : "#1e40af"
                    }}>
                        {u.nom.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <span style={{ fontWeight: 600, color: "#1f2937" }}>{u.nom}</span>
                  </div>
                </td>
                <td style={{ padding: "14px 16px", color: "#6b7280" }}>{u.email}</td>
                <td style={{ padding: "14px 16px" }}><Badge label={u.role} /></td>
                <td style={{ padding: "14px 16px", color: "#374151", textAlign: "center" }}>{u.reservations}</td>
                <td style={{ padding: "14px 16px" }}><Badge label={u.statut} /></td>
                <td style={{ padding: "14px 16px" }}>
                  <button onClick={() => toggleBlock(u.id)} style={{
                    background: u.statut === "Actif" ? "#fef3c7" : "#dcfce7",
                    color:      u.statut === "Actif" ? "#92400e" : "#166534",
                    border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", marginRight: 6
                  }}>
                    {u.statut === "Actif" ? "Bloquer" : "Débloquer"}
                  </button>
                  <button onClick={() => deleteUser(u.id)} style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "#9ca3af", padding: 32, fontSize: 14 }}>Aucun utilisateur trouvé</p>
        )}
      </div>
    </div>
  )
}