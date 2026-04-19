import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { type Role } from './Users'
import { useAuth } from './useAuth'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: Role[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <p className="text-xs sm:text-sm md:text-base text-gray-500 animate-pulse">
          Chargement...
        </p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === 'admin' ? '/dashboard/admin' : '/dashboards/user'}
        replace
      />
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
