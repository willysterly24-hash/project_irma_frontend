import { useState } from 'react'
import { User, Mail, Phone, MapPin, Edit2, Save, X } from 'lucide-react'

interface ProfileData {
  name: string
  email: string
  phone: string
  address: string
  avatar: string
}

interface ProfileProps {
  profile: ProfileData
  onUpdateProfile: (profile: ProfileData) => void
  onLogout?: () => void
}

export default function Profile({ profile, onUpdateProfile, onLogout }: ProfileProps) {
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState(profile)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdateProfile({
      ...formData,
      avatar: formData.name.split(' ').map(part => part[0]).join('').toUpperCase()
    })
    setEditing(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800">Mon profil</h1>
      <p className="text-gray-500 text-sm mt-1">Gérez vos informations personnelles</p>

      <div className="bg-white rounded-2xl border shadow-sm mt-6">
        <div className="p-6 border-b flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            {profile.avatar}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
            <p className="text-gray-500">Client IRMA</p>
          </div>
        </div>

        <div className="p-6">
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" required className="w-full pl-10 pr-4 py-2 border rounded-lg" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" required className="w-full pl-10 pr-4 py-2 border rounded-lg" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" className="w-full pl-10 pr-4 py-2 border rounded-lg" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" className="w-full pl-10 pr-4 py-2 border rounded-lg" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-amber-500 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Enregistrer
                </button>
                <button type="button" onClick={() => setEditing(false)} className="flex-1 border py-2 rounded-lg flex items-center justify-center gap-2">
                  <X className="w-4 h-4" /> Annuler
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 py-3 border-b">
                <span className="text-gray-500 flex items-center gap-2"><User className="w-4 h-4" /> Nom</span>
                <span className="font-medium">{profile.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-3 border-b">
                <span className="text-gray-500 flex items-center gap-2"><Mail className="w-4 h-4" /> Email</span>
                <span>{profile.email}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-3 border-b">
                <span className="text-gray-500 flex items-center gap-2"><Phone className="w-4 h-4" /> Téléphone</span>
                <span>{profile.phone || 'Non renseigné'}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-3 border-b">
                <span className="text-gray-500 flex items-center gap-2"><MapPin className="w-4 h-4" /> Adresse</span>
                <span>{profile.address || 'Non renseignée'}</span>
              </div>
              <button onClick={() => setEditing(true)} className="w-full mt-6 bg-amber-500 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2">
                <Edit2 className="w-4 h-4" /> Modifier mon profil
              </button>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full bg-red-50 text-red-600 py-2.5 rounded-lg font-semibold border border-red-100"
                >
                  Se déconnecter
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
