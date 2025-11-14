import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}