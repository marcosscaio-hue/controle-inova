import { Navigate } from 'react-router-dom'
import { useAuth } from '@/store/useAuth'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const usuario = useAuth((s) => s.usuario)
  if (!usuario) return <Navigate to="/login" replace />
  return <>{children}</>
}
