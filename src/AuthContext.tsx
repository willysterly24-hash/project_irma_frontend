import { useCallback, useState, type ReactNode } from 'react'
import { type User, MOCK_USERS, ROLE_REDIRECTS, type Role } from './Users'
import { AuthContext } from './auth-context'

let usersStore: User[] = [...MOCK_USERS]

const getStoredUser = (): User | null => {
  const stored = localStorage.getItem('auth_user')
  return stored ? JSON.parse(stored) : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getStoredUser())
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    await new Promise(res => setTimeout(res, 800))

    const found = usersStore.find(
      existingUser =>
        existingUser.email.toLowerCase() === email.toLowerCase() &&
        existingUser.password === password
    )

    if (!found) {
      setLoading(false)
      return { success: false, error: 'Email ou mot de passe incorrect.' }
    }

    setUser(found)
    localStorage.setItem('auth_user', JSON.stringify(found))
    setLoading(false)
    return { success: true, redirect: ROLE_REDIRECTS[found.role] }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('auth_user')
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true)
    await new Promise(res => setTimeout(res, 800))

    const exists = usersStore.find(existingUser => existingUser.email.toLowerCase() === email.toLowerCase())
    if (exists) {
      setLoading(false)
      return { success: false, error: 'Un compte avec cet email existe déjà.' }
    }

    const newUser: User = {
      id: String(Date.now()),
      name,
      email,
      password,
      role: 'user' as Role
    }

    usersStore = [...usersStore, newUser]
    setUser(newUser)
    localStorage.setItem('auth_user', JSON.stringify(newUser))
    setLoading(false)
    return { success: true }
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
        getRedirect
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
