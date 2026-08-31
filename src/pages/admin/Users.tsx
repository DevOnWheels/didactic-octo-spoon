import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`

type AdminUser = {
  id: string
  email: string | null
  display_name: string
  role: string
  created_at: string
}

export function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({})
  const [busyUserId, setBusyUserId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function callFunction(body: Record<string, unknown>) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const response = await fetch(FUNCTIONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(body),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error ?? 'Aktion fehlgeschlagen.')
    return data
  }

  async function loadUsers() {
    setLoading(true)
    setError(null)
    try {
      const data = await callFunction({ action: 'list' })
      setUsers(data.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nutzer konnten nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  async function handleSetPassword(userId: string) {
    const newPassword = passwordDrafts[userId] ?? ''
    if (newPassword.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen haben.')
      return
    }

    setBusyUserId(userId)
    setError(null)
    setMessage(null)
    try {
      await callFunction({ action: 'set-password', userId, newPassword })
      setPasswordDrafts((prev) => ({ ...prev, [userId]: '' }))
      setMessage('Neues Passwort gesetzt.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Passwort konnte nicht gesetzt werden.')
    } finally {
      setBusyUserId(null)
    }
  }

  async function handleDelete(targetUser: AdminUser) {
    if (!confirm(`Konto "${targetUser.email}" wirklich unwiderruflich löschen?`)) return

    setBusyUserId(targetUser.id)
    setError(null)
    setMessage(null)
    try {
      await callFunction({ action: 'delete', userId: targetUser.id })
      setMessage('Konto gelöscht.')
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Konto konnte nicht gelöscht werden.')
    } finally {
      setBusyUserId(null)
    }
  }

  if (loading) return <p className="text-ink-500">Lädt…</p>

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-bold text-ink-900">Nutzerkonten</h2>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-sm font-bold text-glaze-700">
          {message}
        </p>
      )}
      <div className="flex flex-col divide-y divide-ink-100 border-2 border-ink-100 bg-white">
        {users.map((u) => {
          const isSelf = u.id === currentUser?.id
          const busy = busyUserId === u.id
          const pwdFieldId = `pwd-${u.id}`
          return (
            <div key={u.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-ink-900">
                  {u.email}{' '}
                  {u.role === 'admin' && (
                    <span className="ml-1 bg-clay-100 px-1.5 py-0.5 text-xs font-bold text-clay-800">
                      Admin
                    </span>
                  )}
                  {isSelf && (
                    <span className="ml-1 bg-ink-200 px-1.5 py-0.5 text-xs font-bold text-ink-700">
                      Du
                    </span>
                  )}
                </p>
                <p className="text-xs text-ink-500">
                  {u.display_name} · registriert am {new Date(u.created_at).toLocaleDateString('de-DE')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor={pwdFieldId} className="sr-only">
                  Neues Passwort für {u.email}
                </label>
                <input
                  id={pwdFieldId}
                  type="text"
                  placeholder="Neues Passwort"
                  value={passwordDrafts[u.id] ?? ''}
                  onChange={(e) => setPasswordDrafts((prev) => ({ ...prev, [u.id]: e.target.value }))}
                  className="w-40 border-2 border-ink-300 px-2 py-1.5 text-sm focus:border-clay-600 focus:outline-none"
                />
                <button
                  onClick={() => handleSetPassword(u.id)}
                  disabled={busy}
                  className="border-2 border-ink-300 px-3 py-1.5 text-sm font-bold text-ink-700 hover:bg-ink-100 disabled:opacity-60"
                >
                  Setzen
                </button>
                <button
                  onClick={() => handleDelete(u)}
                  disabled={busy || isSelf}
                  title={isSelf ? 'Eigenes Konto kann hier nicht gelöscht werden' : undefined}
                  className="px-3 py-1.5 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-40"
                >
                  Löschen
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
