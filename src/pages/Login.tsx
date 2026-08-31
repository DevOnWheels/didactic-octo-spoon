import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error } = await signIn(email, password)

    setSubmitting(false)

    if (error) {
      setError('Anmeldung fehlgeschlagen. Bitte E-Mail und Passwort prüfen.')
      return
    }

    navigate('/')
  }

  return (
    <div className="mx-4 my-10 flex max-w-sm flex-col gap-5 border-2 border-ink-100 bg-white p-8 sm:mx-auto">
      <h1 className="text-3xl font-semibold text-ink-900">Anmelden</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="login-email" className="text-sm font-bold text-ink-800">
            E-Mail
          </label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-2 border-ink-300 px-3.5 py-2.5 text-sm focus:border-clay-600 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="login-password" className="text-sm font-bold text-ink-800">
            Passwort
          </label>
          <input
            id="login-password"
            type="password"
            required
            autoComplete="current-password"
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
          {submitting ? 'Meldet an…' : 'Anmelden'}
        </button>
      </form>
      <p className="text-sm text-ink-700">
        Noch kein Konto?{' '}
        <Link to="/registrieren" className="font-bold text-clay-700 hover:underline">
          Jetzt registrieren
        </Link>
      </p>
    </div>
  )
}
