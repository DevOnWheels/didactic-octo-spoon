import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Reine UX-Absicherung, kein Sicherheitsmechanismus — der eigentliche Schutz läuft
// über die RLS-Policies in der Datenbank (siehe CLAUDE.md §5). Ohne die Policy wäre
// dieser Guard nur "unsichtbar", nicht "geschützt".
export function ProtectedAdminRoute() {
  const { loading, user, isAdmin } = useAuth()

  if (loading) {
    return <div className="p-8 text-center text-ink-500">Lädt…</div>
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
