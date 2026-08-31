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
    return (
      <p role="status" className="mx-auto max-w-6xl px-4 py-10 text-ink-700">
        Konto erstellt. Du wirst weitergeleitet…
      </p>
    )
  }

  return (
    <div className="mx-4 my-10 flex max-w-sm flex-col gap-5 border-2 border-ink-100 bg-white p-8 sm:mx-auto">
      <h1 className="text-3xl font-semibold text-ink-900">Registrieren</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="register-name" className="text-sm font-bold text-ink-800">
            Anzeigename
          </label>
          <input
            id="register-name"
            type="text"
            required
            autoComplete="nickname"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="border-2 border-ink-300 px-3.5 py-2.5 text-sm focus:border-clay-600 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="register-email" className="text-sm font-bold text-ink-800">
            E-Mail
          </label>
          <input
            id="register-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-2 border-ink-300 px-3.5 py-2.5 text-sm focus:border-clay-600 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="register-password" className="text-sm font-bold text-ink-800">
            Passwort (mind. 6 Zeichen)
          </label>
          <input
            id="register-password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border-2 border-ink-300 px-3.5 py-2.5 text-sm focus:border-clay-600 focus:outline-none"
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="bg-clay-400 px-4 py-2.5 text-sm font-semibold uppercase tracking-[2px] text-white transition-colors hover:bg-clay-500 border-2 border-clay-400 hover:border-clay-500 disabled:opacity-60"
        >
          {submitting ? 'Erstellt Konto…' : 'Registrieren'}
        </button>
      </form>
      <p className="text-sm text-ink-700">
        Schon ein Konto?{' '}
        <Link to="/login" className="font-bold text-clay-700 hover:underline">
          Anmelden
        </Link>
      </p>
    </div>
  )
}
