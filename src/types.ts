export interface Hotel {
  id: number
  nom: string
  ville: string
  adresse?: string
  etoiles: number
  chambres: number
  statut: string
  description?: string
  photos?: string[]
  equipements?: string[]
}

export interface Chambre {
  id: number
  hotel: string
  type: "Standard" | "Luxe" | "Suite"
  prix: number
  dispo: boolean
  nbLits?: number
  nbPersonnes?: number
  surface?: number
  photo?: string
  equipements?: string[]
}

export interface Reservation {
  id: number
  client: string
  hotel: string
  chambre: string
  arrivee: string
  depart: string
  montant: number
  statut: string
}

export interface User {
  id: number
  nom: string
  email: string
  role: string
  reservations: number
  statut: string
}
