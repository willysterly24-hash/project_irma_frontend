export interface Hotel {
  id: number
  nom: string
  ville: string
  etoiles: number
  chambres: number
  statut: string
}

export interface Chambre {
  id: number
  hotel: string
  type: string
  prix: number
  dispo: boolean
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
