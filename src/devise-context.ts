import { createContext } from 'react'

export interface Devise {
  code: string
  label: string
  symbole: string
}

export const DEVISES: Devise[] = [
  { code: 'XOF', label: 'Franc CFA', symbole: 'FCFA' },
  { code: 'EUR', label: 'Euro', symbole: '€' },
  { code: 'USD', label: 'Dollar américain', symbole: '$' },
  { code: 'GBP', label: 'Livre sterling', symbole: '£' },
  { code: 'CAD', label: 'Dollar canadien', symbole: 'CA$' },
]

export interface DeviseContextType {
  devise: Devise
  setDeviseCode: (code: string) => void
  loading: boolean
  // Convertit un montant exprimé en FCFA (devise de base stockée en BDD) vers la devise choisie
  convert: (montantFCFA: number) => number
  // Convertit + formate directement avec le symbole (ex: "12 500 FCFA" ou "19 €")
  formatPrice: (montantFCFA: number) => string
}

export const DeviseContext = createContext<DeviseContextType | undefined>(undefined)
