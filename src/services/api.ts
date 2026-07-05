import axios from 'axios'

const API_URL = 'http://localhost:3000'

// Créer une instance axios avec l'URL de base
const api = axios.create({
  baseURL: API_URL,
})

// Intercepteur — ajoute automatiquement le token JWT à chaque requête
api.interceptors.request.use((config) => {
  const auth = localStorage.getItem('auth_user')
  if (auth) {
    const user = JSON.parse(auth)
    if (user.access_token) {
      config.headers.Authorization = `Bearer ${user.access_token}`
    }
  }
  return config
})

// ===== AUTH =====
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
}

// ===== USERS =====
export const userApi = {
  getAll: () => api.get('/user'),
  getMe: () => api.get('/user/me'),
  update: (id: number, data: any) => api.put(`/user/${id}`, data),
  toggleBlock: (id: number) => api.put(`/user/${id}/toggle-block`),
  delete: (id: number) => api.delete(`/user/${id}`),
  updateMe: (data: { name?: string; email?: string; telephone?: string }) => api.put('/user/me', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) => api.put('/user/me/password', data),
  deleteMe: () => api.delete('/user/me'),
  uploadPhoto: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/user/me/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ===== HOTELS =====
export const hotelApi = {
  getAll: () => api.get('/hotel'),
  getOne: (id: number) => api.get(`/hotel/${id}`),
  create: (data: any) => api.post('/hotel', data),
  update: (id: number, data: any) => api.put(`/hotel/${id}`, data),
  delete: (id: number) => api.delete(`/hotel/${id}`),
  uploadPhotos: (id: number, files: File[]) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    return api.post(`/hotel/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  removePhoto: (id: number, url: string) =>
    api.delete(`/hotel/${id}/photos`, { data: { url } }),
}

// ===== CHAMBRES =====
export const chambreApi = {
  getAll: (dispo?: boolean) =>
    api.get('/chambre', { params: dispo !== undefined ? { dispo } : {} }),
  getByHotel: (hotelId: number) => api.get(`/chambre/hotel/${hotelId}`),
  getOne: (id: number) => api.get(`/chambre/${id}`),
  create: (data: any) => api.post('/chambre', data),
  update: (id: number, data: any) => api.put(`/chambre/${id}`, data),
  delete: (id: number) => api.delete(`/chambre/${id}`),
  uploadPhotos: (id: number, files: File[]) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    return api.post(`/chambre/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  removePhoto: (id: number, url: string) =>
    api.delete(`/chambre/${id}/photos`, { data: { url } }),
}

// ===== RESERVATIONS =====
export const reservationApi = {
  getAll: () => api.get('/reservation'),
  getByUser: (userId: number) => api.get(`/reservation/user/${userId}`),
  getOne: (id: number) => api.get(`/reservation/${id}`),
  create: (data: any) => api.post('/reservation', data),
  update: (id: number, data: any) => api.put(`/reservation/${id}`, data),
  confirmer: (id: number) => api.patch(`/reservation/${id}/confirmer`),
  annuler: (id: number) => api.patch(`/reservation/${id}/annuler`),
  delete: (id: number) => api.delete(`/reservation/${id}`),
}

// ===== STATS =====
export const statsApi = {
  getStats: () => api.get('/stats'),
}

// ===== AVIS =====
export const avisApi = {
  create: (data: { nom: string; hotel: string; commentaire: string; note: number }) => 
    api.post('/avis', data),
  getAll: () => api.get('/avis'),
  delete: (id: number) => api.delete(`/avis/${id}`),
}
// ===== OFFRES =====
export const offreApi = {
  getAll: () => api.get('/offre'),
  create: (data: any) => api.post('/offre', data),
  update: (id: number, data: any) => api.put(`/offre/${id}`, data),
  delete: (id: number) => api.delete(`/offre/${id}`),
}

// ===== METEO =====
export const meteoApi = {
  getVilles: () => api.get('/meteo'),
  getVille: (ville: string) => api.get(`/meteo/${ville}`),
}

// ===== FAVORIS =====
export const favoriApi = {
  getAll: () => api.get('/favori'),
  add: (hotelId: number) => api.post('/favori', { hotelId }),
  remove: (hotelId: number) => api.delete(`/favori/${hotelId}`),
}

// ===== GEO (géocodage) =====
export const geoApi = {
  geocode: (ville: string) => api.get('/geo/geocode', { params: { ville } }),
}

// ===== DEVISE (taux de change) =====
export const deviseApi = {
  getTaux: (base: string = 'XOF') => api.get('/devise/taux', { params: { base } }),
}