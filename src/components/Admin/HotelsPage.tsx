import { useState, useEffect } from "react"
import type { Hotel } from "../../types"
import { hotelApi, geoApi } from "../../services/api"
import Badge from "../ui/Badge"
import Modal from "../ui/Modal"
import { Check, AlertTriangle, Loader2 } from "lucide-react"

const inp: React.CSSProperties = {
  width: "100%", padding: "10px 12px", border: "1px solid #e5e7eb",
  borderRadius: 8, fontSize: 14, boxSizing: "border-box", marginBottom: 12,
}

const EQUIPEMENTS_HOTEL = [
  { key: "piscine", label: "Piscine" },
  { key: "plage", label: "Plage" },
  { key: "parking", label: "Parking" },
  { key: "spa", label: "Spa" },
  { key: "restaurant", label: "Restaurant" },
  { key: "wifi", label: "Wifi" },
]

const MAX_PHOTOS = 4

const emptyForm = {
  nom: "", ville: "", adresse: "", etoiles: 4, chambres: 50, statut: "Actif",
  description: "", equipements: [] as string[],
}

// Convertit le tableau de checkboxes cochées en objet attendu par le backend
const arrayToEquipementsObject = (arr: string[]) => {
  const obj: Record<string, boolean> = {}
  EQUIPEMENTS_HOTEL.forEach(eq => {
    obj[eq.key] = arr.includes(eq.key)
  })
  return obj
}

// Convertit l'objet reçu du backend en tableau pour les checkboxes
const equipementsObjectToArray = (obj: any): string[] => {
  if (!obj) return []
  return Object.keys(obj).filter(key => obj[key] === true)
}

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<"add" | "edit" | null>(null)
  const [form, setForm] = useState<Omit<Hotel, "id"> & { id?: number }>(emptyForm)

  // Photos déjà enregistrées côté serveur (mode édition uniquement)
  const [existingPhotos, setExistingPhotos] = useState<string[]>([])
  // Nouveaux fichiers sélectionnés, pas encore uploadés
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([])
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([])

  const [saving, setSaving] = useState(false)

  // Vérification en direct que l'adresse saisie est bien localisable (via Nominatim/OpenStreetMap)
  const [geoStatus, setGeoStatus] = useState<"idle" | "checking" | "found" | "notfound">("idle")

  useEffect(() => {
    const requete = [form.adresse, form.ville].filter(Boolean).join(", ")
    if (!requete.trim()) { setGeoStatus("idle"); return }

    setGeoStatus("checking")
    const timeout = setTimeout(() => {
      geoApi.geocode(requete)
        .then(() => setGeoStatus("found"))
        .catch(() => setGeoStatus("notfound"))
    }, 700) // debounce — évite d'interroger l'API à chaque frappe

    return () => clearTimeout(timeout)
  }, [form.adresse, form.ville])

  useEffect(() => {
    fetchHotels()
  }, [])

  const fetchHotels = async () => {
    try {
      const response = await hotelApi.getAll()
      setHotels(response.data)
    } catch (error) {
      console.error('Erreur chargement hôtels:', error)
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
    setForm(emptyForm)
    resetPhotoState()
    setModal("add")
  }

  const openEdit = (h: Hotel) => {
    setForm({ ...h, equipements: equipementsObjectToArray(h.equipements) })
    setExistingPhotos(h.photos || [])
    setNewPhotoFiles([])
    setNewPhotoPreviews([])
    setModal("edit")
  }

  const del = async (id: number) => {
    try {
      await hotelApi.delete(id)
      setHotels(prev => prev.filter(h => h.id !== id))
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }

  const toggleEquipement = (key: string) => {
    setForm(prev => {
      const current = (prev.equipements as string[]) || []
      const next = current.includes(key)
        ? current.filter(e => e !== key)
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
      alert(`Maximum ${MAX_PHOTOS} photos par hôtel.`)
      e.target.value = ""
      return
    }

    const filesToAdd = files.slice(0, remainingSlots)
    setNewPhotoFiles(prev => [...prev, ...filesToAdd])
    setNewPhotoPreviews(prev => [...prev, ...filesToAdd.map(f => URL.createObjectURL(f))])
    e.target.value = ""
  }

  const removeNewPhoto = (index: number) => {
    setNewPhotoFiles(prev => prev.filter((_, i) => i !== index))
    setNewPhotoPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingPhoto = async (url: string) => {
    if (modal !== "edit" || !form.id) return
    try {
      await hotelApi.removePhoto(form.id, url)
      setExistingPhotos(prev => prev.filter(p => p !== url))
      setHotels(prev => prev.map(h =>
        h.id === form.id ? { ...h, photos: (h.photos || []).filter(p => p !== url) } : h
      ))
    } catch (error) {
      console.error('Erreur suppression photo:', error)
    }
  }

  const save = async () => {
  try {
    setSaving(true)

    const { id, photos, ...formWithoutIdAndPhotos } = form as any

    const payload = {
      ...formWithoutIdAndPhotos,
      etoiles: +form.etoiles,
      chambres: +form.chambres,
      description: form.description || '',
      equipements: arrayToEquipementsObject((form.equipements as string[]) || []),
    }

      let savedHotel: Hotel

      if (modal === "add") {
        const response = await hotelApi.create(payload)
        savedHotel = response.data
        setHotels(prev => [...prev, savedHotel])
      } else {
        const response = await hotelApi.update(form.id!, payload)
        savedHotel = response.data
        setHotels(prev => prev.map(h => h.id === form.id ? savedHotel : h))
      }

      if (newPhotoFiles.length > 0) {
        const photoResponse = await hotelApi.uploadPhotos(savedHotel.id, newPhotoFiles)
        setHotels(prev => prev.map(h =>
          h.id === savedHotel.id ? { ...h, photos: photoResponse.data.photos } : h
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
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1f2937", margin: "0 0 2px" }}>Gestion des hôtels</h2>
          <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>{hotels.length} hôtels enregistrés</p>
        </div>
        <button onClick={openAdd} style={{ background: "#3B82F6", color: "white", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + Ajouter un hôtel
        </button>
      </div>

      <div style={{ background: "white", borderRadius: 14, border: "1px solid #f0f0f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Photo", "Hôtel", "Ville", "Étoiles", "Chambres", "Statut", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, color: "#6b7280", borderBottom: "1px solid #f0f0f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hotels.map(h => (
              <tr key={h.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                <td style={{ padding: "14px 16px" }}>
                  {h.photos && h.photos.length > 0 ? (
                    <div style={{ position: "relative", width: 48, height: 48 }}>
                      <img src={`http://localhost:3000${h.photos[0]}`} alt={h.nom} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }} />
                      {h.photos.length > 1 && (
                        <span style={{
                          position: "absolute", bottom: -4, right: -4,
                          background: "#3B82F6", color: "white", fontSize: 10, fontWeight: 700,
                          borderRadius: 999, padding: "1px 5px",
                        }}>
                          +{h.photos.length - 1}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: 8, background: "#f3f4f6" }} />
                  )}
                </td>
                <td style={{ padding: "14px 16px", fontWeight: 600, color: "#1f2937" }}>{h.nom}</td>
                <td style={{ padding: "14px 16px", color: "#6b7280" }}>{h.ville}</td>
                <td style={{ padding: "14px 16px" }}>{"⭐".repeat(h.etoiles)}</td>
                <td style={{ padding: "14px 16px", color: "#374151" }}>{h.chambres}</td>
                <td style={{ padding: "14px 16px" }}><Badge label={h.statut} /></td>
                <td style={{ padding: "14px 16px" }}>
                  <button onClick={() => openEdit(h)} style={{ background: "#eff6ff", color: "#3B82F6", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", marginRight: 6 }}>Modifier</button>
                  <button onClick={() => del(h.id)} style={{ background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modal === "add" || modal === "edit"} onClose={() => { setModal(null); resetPhotoState() }} title={modal === "add" ? "Ajouter un hôtel" : "Modifier l'hôtel"}>
        <input style={inp} placeholder="Nom de l'hôtel" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
        <input style={inp} placeholder="Ville" value={form.ville} onChange={e => setForm({ ...form, ville: e.target.value })} />

        <input
          style={{ ...inp, marginBottom: 4 }}
          placeholder="Adresse précise (optionnel, ex: Route de la Corniche Ouest)"
          value={form.adresse}
          onChange={e => setForm({ ...form, adresse: e.target.value })}
        />
        <div style={{ marginBottom: 12, minHeight: 18, display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
          {geoStatus === "checking" && (
            <span style={{ color: "#9ca3af", display: "flex", alignItems: "center", gap: 6 }}>
              <Loader2 size={13} className="animate-spin" /> Vérification de la localisation…
            </span>
          )}
          {geoStatus === "found" && (
            <span style={{ color: "#059669", display: "flex", alignItems: "center", gap: 6 }}>
              <Check size={13} /> Adresse localisable sur la carte
            </span>
          )}
          {geoStatus === "notfound" && (
            <span style={{ color: "#DC2626", display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={13} /> Adresse introuvable, précise un peu plus (ou laisse vide pour rester sur la ville)
            </span>
          )}
        </div>

        <textarea
          style={{ ...inp, minHeight: 70, fontFamily: "inherit", resize: "vertical" }}
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <input style={{ ...inp, marginBottom: 0 }} type="number" min={1} max={5} placeholder="Étoiles" value={form.etoiles} onChange={e => setForm({ ...form, etoiles: +e.target.value })} />
          <input style={{ ...inp, marginBottom: 0 }} type="number" placeholder="Nb chambres" value={form.chambres} onChange={e => setForm({ ...form, chambres: +e.target.value })} />
        </div>

        <select style={{ ...inp, marginTop: 12 }} value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
          <option>Actif</option><option>Maintenance</option><option>Fermé</option>
        </select>

        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8, display: "block" }}>Équipements</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {EQUIPEMENTS_HOTEL.map(eq => (
            <label key={eq.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={((form.equipements as string[]) || []).includes(eq.key)}
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