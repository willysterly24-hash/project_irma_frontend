import { useState, useEffect } from "react"
import type { Hotel } from "../../types"
import { chambreApi, hotelApi } from "../../services/api"
import Badge from "../ui/Badge"
import Modal from "../ui/Modal"
import { useDevise } from "../../useDevise"

const inp: React.CSSProperties = {
  width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb",
  borderRadius: 8, fontSize: 14, boxSizing: "border-box", marginBottom: 12,
}

const TYPES_CHAMBRE = ["Standard", "Luxe", "Suite"]

const EQUIPEMENTS_CHAMBRE = [
  { key: "wifi", label: "Wifi" },
  { key: "clim", label: "Climatisation" },
  { key: "tv", label: "TV" },
  { key: "minibar", label: "Minibar" },
  { key: "balcon", label: "Balcon" },
  { key: "vueMer", label: "Vue mer" },
  { key: "jacuzzi", label: "Jacuzzi" },
]

const MAX_PHOTOS = 4

const emptyForm = {
  type: "Standard", prix: 0, dispo: true, hotelId: 0,
  nbLits: 1, nbPersonnes: 2, surface: 20,
  equipements: [] as string[],
}

// Convertit le tableau de checkboxes cochées en objet attendu par le backend
const arrayToEquipementsObject = (arr: string[]) => {
  const obj: Record<string, boolean> = {}
  EQUIPEMENTS_CHAMBRE.forEach(eq => {
    obj[eq.key] = arr.includes(eq.key)
  })
  return obj
}

// Convertit l'objet reçu du backend en tableau pour les checkboxes
const equipementsObjectToArray = (obj: any): string[] => {
  if (!obj) return []
  return Object.keys(obj).filter(key => obj[key] === true)
}

export default function ChambresPage() {
  const { formatPrice } = useDevise()
  const [chambres, setChambres] = useState<any[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<"add" | "edit" | null>(null)
  const [form, setForm] = useState<any>(emptyForm)

  // Photos déjà enregistrées côté serveur (mode édition uniquement)
  const [existingPhotos, setExistingPhotos] = useState<string[]>([])
  // Nouveaux fichiers sélectionnés, pas encore uploadés
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([])
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([])

  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [chambresRes, hotelsRes] = await Promise.all([chambreApi.getAll(), hotelApi.getAll()])
      setChambres(chambresRes.data)
      setHotels(hotelsRes.data)
    } catch (error) {
      console.error('Erreur chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetPhotoState = () => {
    setExistingPhotos([])
    setNewPhotoFiles([])
    setNewPhotoPreviews([])
  }

  const openAdd = () => {
    setForm({ ...emptyForm, hotelId: hotels[0]?.id || 0 })
    resetPhotoState()
    setModal("add")
  }

  const openEdit = (c: any) => {
    setForm({
      type: c.type,
      prix: c.prix,
      dispo: c.dispo,
      hotelId: c.hotel?.id,
      id: c.id,
      nbLits: c.nbLits || 1,
      nbPersonnes: c.nbPersonnes || 2,
      surface: c.surface || 20,
      equipements: equipementsObjectToArray(c.equipements),
    })
    setExistingPhotos(c.photos || [])
    setNewPhotoFiles([])
    setNewPhotoPreviews([])
    setModal("edit")
  }

  const del = async (id: number) => {
    try {
      await chambreApi.delete(id)
      setChambres(prev => prev.filter(c => c.id !== id))
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }

  const toggleEquipement = (key: string) => {
    setForm((prev: any) => {
      const current = prev.equipements || []
      const next = current.includes(key)
        ? current.filter((e: string) => e !== key)
        : [...current, key]
      return { ...prev, equipements: next }
    })
  }

  const totalPhotoCount = existingPhotos.length + newPhotoFiles.length

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const remainingSlots = MAX_PHOTOS - totalPhotoCount
    if (remainingSlots <= 0) {
      alert(`Maximum ${MAX_PHOTOS} photos par chambre.`)
      e.target.value = ""
      return
    }

    const filesToAdd = files.slice(0, remainingSlots)
    setNewPhotoFiles(prev => [...prev, ...filesToAdd])
    setNewPhotoPreviews(prev => [...prev, ...filesToAdd.map(f => URL.createObjectURL(f))])
    e.target.value = "" // permet de re-sélectionner le même fichier plus tard si besoin
  }

  const removeNewPhoto = (index: number) => {
    setNewPhotoFiles(prev => prev.filter((_, i) => i !== index))
    setNewPhotoPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingPhoto = async (url: string) => {
    if (modal !== "edit" || !form.id) return
    try {
      await chambreApi.removePhoto(form.id, url)
      setExistingPhotos(prev => prev.filter(p => p !== url))
      setChambres(prev => prev.map(c =>
        c.id === form.id ? { ...c, photos: (c.photos || []).filter((p: string) => p !== url) } : c
      ))
    } catch (error) {
      console.error('Erreur suppression photo:', error)
    }
  }

  const save = async () => {
    try {
      setSaving(true)

      const payload = {
        type: form.type,
        prix: +form.prix,
        dispo: form.dispo,
        hotelId: +form.hotelId,
        nbLits: +form.nbLits,
        nbPersonnes: +form.nbPersonnes,
        surface: +form.surface,
        equipements: arrayToEquipementsObject(form.equipements || []),
      }

      let savedChambre: any

      if (modal === "add") {
        const response = await chambreApi.create(payload)
        savedChambre = response.data
        setChambres(prev => [...prev, savedChambre])
      } else {
        const response = await chambreApi.update(form.id, payload)
        savedChambre = response.data
        setChambres(prev => prev.map(c => c.id === form.id ? savedChambre : c))
      }

      // Upload des nouvelles photos, s'il y en a
      if (newPhotoFiles.length > 0) {
        const photoResponse = await chambreApi.uploadPhotos(savedChambre.id, newPhotoFiles)
        setChambres(prev => prev.map(c =>
          c.id === savedChambre.id ? { ...c, photos: photoResponse.data.photos } : c
        ))
      }

      setModal(null)
      resetPhotoState()
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p style={{ padding: 32, color: "#9ca3af" }}>Chargement...</p>

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1f2937", margin: "0 0 2px" }}>Gestion des chambres</h2>
          <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>{chambres.length} chambres enregistrées</p>
        </div>
        <button onClick={openAdd} style={{ background: "#3B82F6", color: "white", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + Ajouter une chambre
        </button>
      </div>

      <div style={{ background: "white", borderRadius: 14, border: "1px solid #f0f0f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Photo", "Hôtel", "Type", "Lits", "Pers.", "Surface", "Prix", "Disponible", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(chambres) ? chambres : []).map(c => (
              <tr key={c.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                <td style={{ padding: "14px 16px" }}>
                  {c.photos && c.photos.length > 0 ? (
                    <div style={{ position: "relative", width: 48, height: 48 }}>
                      <img src={`http://localhost:3000${c.photos[0]}`} alt={c.type} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }} />
                      {c.photos.length > 1 && (
                        <span style={{
                          position: "absolute", bottom: -4, right: -4,
                          background: "#3B82F6", color: "white", fontSize: 10, fontWeight: 700,
                          borderRadius: 999, padding: "1px 5px",
                        }}>
                          +{c.photos.length - 1}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: 8, background: "#f3f4f6" }} />
                  )}
                </td>
                <td style={{ padding: "14px 16px", fontWeight: 600, color: "#1f2937" }}>{c.hotel?.nom}</td>
                <td style={{ padding: "14px 16px", color: "#374151" }}>{c.type}</td>
                <td style={{ padding: "14px 16px", color: "#6b7280" }}>{c.nbLits ?? "-"}</td>
                <td style={{ padding: "14px 16px", color: "#6b7280" }}>{c.nbPersonnes ?? "-"}</td>
                <td style={{ padding: "14px 16px", color: "#6b7280" }}>{c.surface ? `${c.surface} m²` : "-"}</td>
                <td style={{ padding: "14px 16px", color: "#3B82F6", fontWeight: 700 }}>{formatPrice(Number(c.prix))}</td>
                <td style={{ padding: "14px 16px" }}><Badge label={c.dispo ? "Disponible" : "Indisponible"} /></td>
                <td style={{ padding: "14px 16px" }}>
                  <button onClick={() => openEdit(c)} style={{ background: "#eff6ff", color: "#3B82F6", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", marginRight: 6 }}>Modifier</button>
                  <button onClick={() => del(c.id)} style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal === "add" || modal === "edit"} onClose={() => { setModal(null); resetPhotoState() }} title={modal === "add" ? "Ajouter une chambre" : "Modifier la chambre"}>
        <select style={inp} value={form.hotelId} onChange={e => setForm({ ...form, hotelId: +e.target.value })}>
          {hotels.map(h => <option key={h.id} value={h.id}>{h.nom}</option>)}
        </select>

        <select style={inp} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
          {TYPES_CHAMBRE.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: "#6b7280" }}>Nb lits</label>
            <input style={{ ...inp, marginTop: 4 }} type="number" min={1} value={form.nbLits} onChange={e => setForm({ ...form, nbLits: +e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#6b7280" }}>Nb personnes</label>
            <input style={{ ...inp, marginTop: 4 }} type="number" min={1} value={form.nbPersonnes} onChange={e => setForm({ ...form, nbPersonnes: +e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#6b7280" }}>Surface (m²)</label>
            <input style={{ ...inp, marginTop: 4 }} type="number" min={1} value={form.surface} onChange={e => setForm({ ...form, surface: +e.target.value })} />
          </div>
        </div>

        <input style={inp} type="number" placeholder="Prix" value={form.prix} onChange={e => setForm({ ...form, prix: +e.target.value })} />

        <select style={inp} value={form.dispo ? "true" : "false"} onChange={e => setForm({ ...form, dispo: e.target.value === "true" })}>
          <option value="true">Disponible</option>
          <option value="false">Indisponible</option>
        </select>

        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8, display: "block" }}>Équipements</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {EQUIPEMENTS_CHAMBRE.map(eq => (
            <label key={eq.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={(form.equipements || []).includes(eq.key)}
                onChange={() => toggleEquipement(eq.key)}
              />
              {eq.label}
            </label>
          ))}
        </div>

        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8, display: "block" }}>
          Photos ({totalPhotoCount}/{MAX_PHOTOS})
        </label>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          {/* Photos déjà enregistrées (mode édition) */}
          {existingPhotos.map(url => (
            <div key={url} style={{ position: "relative", width: 64, height: 64 }}>
              <img src={`http://localhost:3000${url}`} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }} />
              <button
                type="button"
                onClick={() => removeExistingPhoto(url)}
                style={{
                  position: "absolute", top: -6, right: -6,
                  width: 20, height: 20, borderRadius: "50%",
                  background: "#ef4444", color: "white", border: "2px solid white",
                  fontSize: 12, lineHeight: "16px", cursor: "pointer", padding: 0,
                }}
                title="Supprimer cette photo"
              >
                ×
              </button>
            </div>
          ))}

          {/* Nouvelles photos sélectionnées, pas encore uploadées */}
          {newPhotoPreviews.map((preview, index) => (
            <div key={index} style={{ position: "relative", width: 64, height: 64 }}>
              <img src={preview} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: "1px solid #93c5fd" }} />
              <button
                type="button"
                onClick={() => removeNewPhoto(index)}
                style={{
                  position: "absolute", top: -6, right: -6,
                  width: 20, height: 20, borderRadius: "50%",
                  background: "#ef4444", color: "white", border: "2px solid white",
                  fontSize: 12, lineHeight: "16px", cursor: "pointer", padding: 0,
                }}
                title="Retirer cette photo"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {totalPhotoCount < MAX_PHOTOS && (
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handlePhotosChange}
            style={{ fontSize: 13, marginBottom: 16 }}
          />
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button onClick={() => { setModal(null); resetPhotoState() }} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", fontSize: 13 }}>Annuler</button>
          <button onClick={save} disabled={saving} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#3B82F6", color: "white", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontSize: 13, opacity: saving ? 0.6 : 1 }}>
            {saving ? "Envoi..." : "Enregistrer"}
          </button>
        </div>
      </Modal>
    </div>
  )
}