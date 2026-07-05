import { useCallback, useState, type ReactNode } from 'react'
import { AuthContext } from './auth-context'
import { authApi } from './services/api'

const ROLE_REDIRECTS: Record<string, string> = {
  admin: '/dashboard/admin',
  user: '/dashboards/user',
}

const getStoredUser = () => {
  const stored = localStorage.getItem('auth_user')
  return stored ? JSON.parse(stored) : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await authApi.login(email, password)
      const data = response.data

      // Stocker le token ET les infos user ensemble
      const authUser = {
        ...data.user,
        access_token: data.access_token,
      }

      setUser(authUser)
      localStorage.setItem('auth_user', JSON.stringify(authUser))
      setLoading(false)
      return { success: true, redirect: ROLE_REDIRECTS[data.user.role] }
    } catch (error: any) {
      setLoading(false)
      const message = error.response?.data?.message || 'Email ou mot de passe incorrect.'
      return { success: false, error: message }
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true)
    try {
      const response = await authApi.register(name, email, password)
      const data = response.data

      const authUser = {
        ...data.user,
        access_token: data.access_token,
      }

      setUser(authUser)
      localStorage.setItem('auth_user', JSON.stringify(authUser))
      setLoading(false)
      return { success: true }
    } catch (error: any) {
      setLoading(false)
      const message = error.response?.data?.message || 'Erreur lors de la création du compte.'
      return { success: false, error: message }
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('auth_user')
  }, [])

  const getRedirect = useCallback(() => {
    if (!user) return '/login'
    return ROLE_REDIRECTS[user.role]
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        register,
        getRedirect,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}