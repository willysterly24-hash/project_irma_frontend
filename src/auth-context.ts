import { createContext } from 'react'
import type { User } from './Users'

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; redirect?: string; error?: string }>
  logout: () => void
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  getRedirect: () => string
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
