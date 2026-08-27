import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Register() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error } = await signUp(email, password, displayName)

    setSubmitting(false)

    if (error) {
      setError(error)
      return
    }

    setSuccess(true)
    setTimeout(() => navigate('/'), 1500)
  }

  if (success) {
    return <p className="text-stone-600">Konto erstellt. Du wirst weitergeleitet…</p>
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4">
      <h1 className="text-2xl font-semibold text-stone-900">Registrieren</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          required
          placeholder="Anzeigename"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none"
        />
        <input
          type="email"
          required
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Passwort (mind. 6 Zeichen)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-60"
        >
          {submitting ? 'Erstellt Konto…' : 'Registrieren'}
        </button>
      </form>
      <p className="text-sm text-stone-600">
        Schon ein Konto?{' '}
        <Link to="/login" className="text-amber-700 hover:underline">
          Anmelden
        </Link>
      </p>
    </div>
  )
}
