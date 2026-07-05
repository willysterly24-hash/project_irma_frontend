import { useState, useEffect, useRef } from "react"
import  Modal  from "../ui/Modal"
import { offreApi, chambreApi } from "../../services/api"
import { useDevise } from "../../useDevise"
import { formatDateFr } from "../../utils/date"

interface Chambre {
  id: number
  type: string
  prix: number
  hotel: { id: number; nom: string }
}

interface Offre {
  id: number
  badge: string
  titre: string
  description: string
  image: string
  expiration: string
  pourcentageReduction: number
  chambre: Chambre
}

const API = "http://localhost:3000"

export default function OffresPage() {
  const { formatPrice } = useDevise()
  const [offres, setOffres] = useState<Offre[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Offre | null>(null)
  const [chambres, setChambres] = useState<Chambre[]>([])
  const [form, setForm] = useState({ titre: "", description: "", image: "", expiration: "", pourcentageReduction: "", chambreId: "" })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchOffres = async () => {
    try {
      const res = await offreApi.getAll()
      setOffres(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchChambres = async () => {
    try {
      const res = await chambreApi.getAll()
      setChambres(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => { fetchOffres(); fetchChambres() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ titre: "", description: "", image: "", expiration: "", pourcentageReduction: "", chambreId: "" })
    setImageFile(null)
    setImagePreview("")
    setShowModal(true)
  }

  const openEdit = (o: Offre) => {
    setEditing(o)
    setForm({
      titre: o.titre,
      description: o.description,
      image: o.image,
      expiration: o.expiration,
      pourcentageReduction: String(o.pourcentageReduction ?? ""),
      chambreId: String(o.chambre?.id ?? ""),
    })
    setImageFile(null)
    setImagePreview(o.image ? `${API}${o.image}` : "")
    setShowModal(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return form.image
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", imageFile)
      const res = await fetch(`${API}/offre/upload`, { method: "POST", body: fd })
      const data = await res.json()
      return data.url
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.chambreId) {
      alert("Veuillez sélectionner une chambre.")
      return
    }
    if (!form.pourcentageReduction) {
      alert("Veuillez saisir un pourcentage de réduction.")
      return
    }
    if (!form.titre.trim()) {
      alert("Veuillez saisir un titre.")
      return
    }
    if (!form.description.trim()) {
      alert("Veuillez saisir une description.")
      return
    }
    if (!form.expiration) {
      alert("Veuillez saisir une date d'expiration.")
      return
    }

    const imageUrl = await uploadImage()
    const payload = {
      titre: form.titre,
      description: form.description,
      image: imageUrl,
      expiration: form.expiration,
      badge: `-${form.pourcentageReduction}%`,
      pourcentageReduction: Number(form.pourcentageReduction),
      chambreId: Number(form.chambreId),
    }

    try {
      if (editing) {
        await offreApi.update(editing.id, payload)
      } else {
        await offreApi.create(payload)
      }
      setShowModal(false)
      fetchOffres()
    } catch (e) {
      console.error(e)
      alert("Erreur lors de l'enregistrement de l'offre.")
    }
  }
  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette offre ?")) return
    try {
      await offreApi.delete(id)
      fetchOffres()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 m-0">Gestion des offres</h1>
          <p className="text-sm text-gray-400 mt-1">{offres.length} offre{offres.length > 1 ? "s" : ""} au total</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <span className="text-lg leading-none">+</span> Ajouter une offre
        </button>
      </div>

      {/* Grille */}
      {loading ? (
        <p className="text-gray-400 text-sm">Chargement...</p>
      ) : offres.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">🏷️</div>
          <p className="text-gray-500 font-medium">Aucune offre pour l'instant</p>
          <p className="text-gray-400 text-sm mt-1">Cliquez sur "+ Ajouter une offre" pour commencer</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {offres.map((o) => (
            <div key={o.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              {/* Image */}
              <div className="h-44 bg-gray-100 relative overflow-hidden">
                {o.image ? (
                  <img
                    src={`${API}${o.image}`}
                    alt={o.titre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">🖼️</div>
                )}
                <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {o.badge}
                </span>
              </div>

              {/* Contenu */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-gray-800 text-base mb-1">{o.titre}</h3>
                <p className="text-sm text-gray-500 flex-1 line-clamp-2">{o.description}</p>
                {o.chambre && (
                  <p className="text-xs text-gray-400 mt-1">
                    {o.chambre.hotel?.nom} — {o.chambre.type} · {formatPrice(o.chambre.prix - (o.chambre.prix * o.pourcentageReduction) / 100)} <span className="line-through text-gray-300 ml-1">{formatPrice(o.chambre.prix)}</span>
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Expire le : <span className="font-medium text-gray-600">{formatDateFr(o.expiration)}</span>
                </p>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openEdit(o)}
                    className="flex-1 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 py-2 rounded-xl transition-colors"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(o.id)}
                    className="flex-1 text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 py-2 rounded-xl transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Modifier l'offre" : "Ajouter une offre"}>
        <div className="flex flex-col gap-3">

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">Chambre concernée</p>
            <select
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={form.chambreId}
              onChange={e => setForm({ ...form, chambreId: e.target.value })}
            >
              <option value="">Sélectionnez une chambre...</option>
              {(Array.isArray(chambres) ? chambres : []).map(c => (
                <option key={c.id} value={c.id}>
                  {c.hotel?.nom} — {c.type} ({formatPrice(c.prix)}/nuit)
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">Pourcentage de réduction</p>
            <input
              type="number"
              min={1}
              max={90}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Ex: 30"
              value={form.pourcentageReduction}
              onChange={e => setForm({ ...form, pourcentageReduction: e.target.value })}
            />
            {form.chambreId && form.pourcentageReduction && (
              <p className="text-xs text-gray-400 mt-1.5">
                {(() => {
                  const chambre = chambres.find(c => c.id === Number(form.chambreId))
                  if (!chambre) return null
                  const prixPromo = chambre.prix - (chambre.prix * Number(form.pourcentageReduction)) / 100
                  return `Prix promo : ${formatPrice(prixPromo)} (au lieu de ${formatPrice(chambre.prix)})`
                })()}
              </p>
            )}
          </div>

          <input
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Titre (ex: Escapade Week-end)"
            value={form.titre}
            onChange={e => setForm({ ...form, titre: e.target.value })}
          />

          <textarea
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />

          {/* Upload image */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">Image de l'offre</p>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="aperçu" className="w-full h-24 object-cover rounded-lg mb-2" />
              ) : (
                <div className="text-3xl mb-2">📁</div>
              )}
              <p className="text-sm text-gray-500">
                {imageFile ? imageFile.name : "Cliquez pour choisir une image"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Date expiration */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">Date d'expiration</p>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={form.expiration}
              onChange={e => setForm({ ...form, expiration: e.target.value })}
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={() => setShowModal(false)}
              className="px-5 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {uploading ? "Upload..." : editing ? "Mettre à jour" : "Enregistrer"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
