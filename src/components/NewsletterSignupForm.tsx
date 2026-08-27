import { useState, type FormEvent } from 'react'

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/subscribe`

type Status = 'idle' | 'loading' | 'success' | 'error'

export function NewsletterSignupForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

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
    return <p className="text-sm text-green-700">{message}</p>
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        placeholder="deine@email.de"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-amber-600 focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-60"
      >
        {status === 'loading' ? 'Sendet…' : 'Newsletter abonnieren'}
      </button>
      {status === 'error' && <p className="text-sm text-red-600 sm:ml-2 sm:self-center">{message}</p>}
    </form>
  )
}
