import { useState, useEffect, useRef } from 'react'
import { User, Mail, Phone, Edit2, Save, X, Camera, Lock, Trash2, AlertTriangle, ShieldCheck, ShieldAlert, Plus } from 'lucide-react'
import { userApi, favoriApi } from './services/api'

interface ProfileProps {
  profile: any
  onUpdateProfile: (profile: any) => void
  onLogout?: () => void
}

const AMBER_BG = '#FAEEDA'
const AMBER_TEXT = '#854F0B'
const AMBER_ACCENT = '#FAC775'
const AMBER_DARK = '#412402'

function formatMoisAnnee(dateStr?: string) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
}

export default function Profile({ profile, onUpdateProfile, onLogout }: ProfileProps) {
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({ name: profile.name, email: profile.email, telephone: profile.telephone || '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [favorisCount, setFavorisCount] = useState<number | null>(null)

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    favoriApi.getAll()
      .then(res => setFavorisCount(res.data.length))
      .catch(() => setFavorisCount(null))
  }, [profile.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const response = await userApi.updateMe(formData)
      onUpdateProfile(response.data)
      setEditing(false)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du profil.')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoClick = () => fileInputRef.current?.click()

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      const response = await userApi.uploadPhoto(file)
      onUpdateProfile({ ...profile, photo: response.data.photo })
    } catch (err) {
      console.error('Erreur upload photo:', err)
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.')
      return
    }
    setChangingPassword(true)
    try {
      await userApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setPasswordSuccess('Mot de passe modifié avec succès.')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => { setShowPasswordForm(false); setPasswordSuccess('') }, 1800)
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Erreur lors du changement de mot de passe.')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      await userApi.deleteMe()
      onLogout?.()
    } catch (err) {
      console.error('Erreur suppression compte:', err)
      setDeleting(false)
    }
  }

  const getInitials = (name: string) =>
    name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()

  const photoUrl = profile.photo ? `http://localhost:3000${profile.photo}` : null
  const membreDepuis = formatMoisAnnee(profile.createdAt)
  const profilSecurise = !!profile.telephone

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800">Mon profil</h1>
      <p className="text-gray-500 text-sm mt-1">Gérez vos informations personnelles</p>

      <div className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8">

          {/* ===== Colonne gauche : identité + stats ===== */}
          <div className="bg-white rounded-2xl p-5 flex flex-col items-center text-center gap-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold overflow-hidden shadow-sm" style={{ background: AMBER_BG, color: AMBER_TEXT }}>
                {photoUrl ? (
                  <img src={photoUrl} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  getInitials(profile.name)
                )}
              </div>
              <button
                onClick={handlePhotoClick}
                disabled={uploadingPhoto}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md transition-colors disabled:opacity-50"
                style={{ background: AMBER_ACCENT, color: AMBER_DARK }}
                title="Changer la photo de profil"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
            </div>

            <div>
              <p className="font-semibold text-gray-800" style={{ fontSize: '15px' }}>{profile.name}</p>
              <p className="text-gray-500 flex items-center justify-center gap-1.5 mt-1" style={{ fontSize: '12px' }}>
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: AMBER_TEXT }} /> Client IRMA
              </p>
              {membreDepuis && (
                <p className="text-gray-400 mt-1" style={{ fontSize: '11px' }}>Membre depuis {membreDepuis}</p>
              )}
            </div>

            {uploadingPhoto && <p className="text-gray-400" style={{ fontSize: '11px' }}>Envoi de la photo…</p>}

            <div className="w-full flex flex-col gap-2">
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-xl font-bold text-gray-800">{profile.reservations ?? 0}</p>
                <p className="text-gray-500" style={{ fontSize: '11px' }}>Réservations</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-xl font-bold text-gray-800">{favorisCount ?? '—'}</p>
                <p className="text-gray-500" style={{ fontSize: '11px' }}>Favoris</p>
              </div>
            </div>

            {onLogout && (
              <button onClick={onLogout} className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg font-medium border" style={{ fontSize: '13px' }}>
                Se déconnecter
              </button>
            )}
          </div>

          {/* ===== Colonne droite : contenu ===== */}
          <div className="flex flex-col gap-3 min-w-0">

            {!profilSecurise && (
              <div className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: AMBER_BG, border: `1px solid ${AMBER_ACCENT}` }}>
                <ShieldAlert className="w-5 h-5 shrink-0" style={{ color: AMBER_TEXT }} />
                <div className="flex-1">
                  <p className="font-medium" style={{ fontSize: '13px', color: AMBER_DARK }}>Profil non sécurisé</p>
                  <p style={{ fontSize: '12px', color: AMBER_TEXT }}>Ajoutez un numéro de téléphone pour sécuriser votre compte.</p>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="shrink-0 px-3 py-1.5 rounded-lg font-medium"
                  style={{ background: AMBER_ACCENT, color: AMBER_DARK, fontSize: '12px' }}
                >
                  Ajouter
                </button>
              </div>
            )}

            <div className="bg-white rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800" style={{ fontSize: '15px' }}>Informations personnelles</h3>
                {!editing && (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-1.5" style={{ color: AMBER_TEXT, fontSize: '13px', fontWeight: 500 }}>
                    <Edit2 className="w-3.5 h-3.5" /> Modifier
                  </button>
                )}
              </div>

              {error && (
                <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 text-red-600" style={{ fontSize: '13px' }}>{error}</div>
              )}

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-gray-700 mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>Nom complet</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text" required
                        className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        style={{ fontSize: '14px' }}
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email" required
                        className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        style={{ fontSize: '14px' }}
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1" style={{ fontSize: '13px', fontWeight: 500 }}>Téléphone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        placeholder="+221 XX XXX XX XX"
                        className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        style={{ fontSize: '14px' }}
                        value={formData.telephone}
                        onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button type="submit" disabled={saving} className="flex-1 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: AMBER_TEXT, fontSize: '13px' }}>
                      <Save className="w-4 h-4" /> {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button type="button" onClick={() => { setEditing(false); setError(''); setFormData({ name: profile.name, email: profile.email, telephone: profile.telephone || '' }) }} className="flex-1 border py-2 rounded-lg flex items-center justify-center gap-2" style={{ fontSize: '13px' }}>
                      <X className="w-4 h-4" /> Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border-t pt-2">
                    <p className="text-gray-400 flex items-center gap-1.5" style={{ fontSize: '11px' }}><User className="w-3.5 h-3.5" /> Nom</p>
                    <p className="text-gray-800 mt-1" style={{ fontSize: '13px' }}>{profile.name}</p>
                  </div>
                  <div className="border-t pt-2">
                    <p className="text-gray-400 flex items-center gap-1.5" style={{ fontSize: '11px' }}><Mail className="w-3.5 h-3.5" /> Email</p>
                    <p className="text-gray-800 mt-1" style={{ fontSize: '13px' }}>{profile.email}</p>
                  </div>
                  <div className="border-t pt-2 sm:col-span-2">
                    <p className="text-gray-400 flex items-center gap-1.5" style={{ fontSize: '11px' }}><Phone className="w-3.5 h-3.5" /> Téléphone</p>
                    {profile.telephone ? (
                      <p className="text-gray-800 mt-1" style={{ fontSize: '13px' }}>{profile.telephone}</p>
                    ) : (
                      <button onClick={() => setEditing(true)} className="flex items-center gap-1 mt-1" style={{ color: AMBER_TEXT, fontSize: '13px' }}>
                        <Plus className="w-3.5 h-3.5" /> Ajouter un numéro
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ===== Paramètres ===== */}
            <div className="bg-white rounded-2xl p-5">
              <h3 className="font-bold text-gray-800 mb-3" style={{ fontSize: '15px' }}>Paramètres</h3>

              <div className="border rounded-xl p-3.5">
                <button onClick={() => setShowPasswordForm(s => !s)} className="w-full flex items-center justify-between text-left">
                  <span className="flex items-center gap-2 text-gray-700 font-medium" style={{ fontSize: '13.5px' }}>
                    <Lock className="w-4 h-4 text-gray-400" /> Changer le mot de passe
                  </span>
                  <span style={{ color: AMBER_TEXT, fontSize: '12.5px' }}>{showPasswordForm ? 'Fermer' : 'Modifier'}</span>
                </button>

                {showPasswordForm && (
                  <form onSubmit={handleChangePassword} className="mt-3 space-y-2.5">
                    {passwordError && <div className="px-3 py-2 rounded-lg bg-red-50 text-red-600" style={{ fontSize: '12.5px' }}>{passwordError}</div>}
                    {passwordSuccess && <div className="px-3 py-2 rounded-lg bg-green-50 text-green-600" style={{ fontSize: '12.5px' }}>{passwordSuccess}</div>}
                    <input
                      type="password" required placeholder="Mot de passe actuel"
                      className="w-full px-4 py-2 border rounded-lg" style={{ fontSize: '13.5px' }}
                      value={passwordData.currentPassword}
                      onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                    <input
                      type="password" required placeholder="Nouveau mot de passe (6 caractères min.)"
                      className="w-full px-4 py-2 border rounded-lg" style={{ fontSize: '13.5px' }}
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                    <input
                      type="password" required placeholder="Confirmer le nouveau mot de passe"
                      className="w-full px-4 py-2 border rounded-lg" style={{ fontSize: '13.5px' }}
                      value={passwordData.confirmPassword}
                      onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                    <button type="submit" disabled={changingPassword} className="w-full text-white py-2 rounded-lg font-semibold disabled:opacity-50" style={{ background: '#1f2937', fontSize: '13px' }}>
                      {changingPassword ? 'Modification...' : 'Confirmer le nouveau mot de passe'}
                    </button>
                  </form>
                )}
              </div>

              <div className="border rounded-xl p-3.5 mt-3" style={{ borderColor: '#FECACA' }}>
                <p className="flex items-center gap-2 font-medium mb-1" style={{ fontSize: '13.5px', color: '#DC2626' }}>
                  <AlertTriangle className="w-4 h-4" /> Zone de danger
                </p>
                <p className="text-gray-500 mb-2.5" style={{ fontSize: '12px' }}>
                  La suppression de votre compte est définitive et irréversible.
                </p>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg font-semibold border border-red-100 flex items-center justify-center gap-2"
                    style={{ fontSize: '12.5px' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Supprimer mon compte
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-gray-700 font-medium" style={{ fontSize: '12.5px' }}>
                      Es-tu sûr ? Cette action ne peut pas être annulée.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
                        style={{ fontSize: '12.5px' }}
                      >
                        {deleting ? 'Suppression...' : 'Oui, supprimer'}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 border py-2 rounded-lg font-medium"
                        style={{ fontSize: '12.5px' }}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
