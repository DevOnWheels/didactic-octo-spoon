import { useId, useState, type FormEvent } from 'react'

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/subscribe`

type Status = 'idle' | 'loading' | 'success' | 'error'

export function NewsletterSignupForm({ stacked = false }: { stacked?: boolean }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const emailId = useId()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch(FUNCTIONS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'Anmeldung fehlgeschlagen.')
      }

      setStatus('success')
      setMessage('Fast geschafft — bitte bestätige die Anmeldung über den Link in der E-Mail, die wir dir geschickt haben.')
      setEmail('')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Anmeldung fehlgeschlagen.')
    }
  }

  if (status === 'success') {
    return (
      <p role="status" className={`font-bold ${stacked ? 'text-green-300' : 'text-green-700'}`}>
        {message}
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-3 ${stacked ? '' : 'sm:flex-row sm:gap-2'}`}>
      <label htmlFor={emailId} className="sr-only">
        E-Mail-Adresse
      </label>
      <input
        id={emailId}
        type="email"
        required
        placeholder="deine@email.de"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={`border-2 border-ink-300 bg-white px-4 py-2.5 text-sm focus:border-clay-600 focus:outline-none ${stacked ? 'w-full' : 'flex-1'}`}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-clay-400 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-clay-500 disabled:opacity-60"
      >
        {status === 'loading' ? 'Sendet…' : 'Abonnieren'}
      </button>
      <p role="status" className="sr-only">
        {status === 'loading' ? 'Anmeldung wird gesendet' : ''}
      </p>
      {status === 'error' && (
        <p
          role="alert"
          className={`text-sm ${stacked ? 'text-red-300' : 'text-red-700 sm:ml-2 sm:self-center'}`}
        >
          {message}
        </p>
      )}
    </form>
  )
}
