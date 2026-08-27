import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabaseClient'
import type { Newsletter } from '../../types/database'

const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-newsletter`

export function AdminNewsletter() {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<Newsletter[]>([])

  async function loadHistory() {
    const { data } = await supabase
      .from('newsletters')
      .select('*')
      .not('sent_at', 'is', null)
      .order('sent_at', { ascending: false })
    setHistory(data ?? [])
  }

  useEffect(() => {
    loadHistory()
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!confirm('Newsletter jetzt an alle bestätigten Abonnenten versenden?')) return

    setSending(true)
    setError(null)
    setMessage(null)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const response = await fetch(FUNCTIONS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ subject, body }),
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.error ?? 'Versand fehlgeschlagen.')

      setMessage(`Newsletter an ${data.sentCount} Abonnenten verschickt.`)
      setSubject('')
      setBody('')
      await loadHistory()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Versand fehlgeschlagen.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-5">
        <h2 className="font-medium text-stone-900">Newsletter verfassen</h2>
        <input
          type="text"
          required
          placeholder="Betreff"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
        <textarea
          required
          placeholder="Inhalt (einfacher HTML-Text erlaubt)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-700">{message}</p>}
        <button
          type="submit"
          disabled={sending}
          className="self-start rounded-md bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:opacity-60"
        >
          {sending ? 'Wird versendet…' : 'An alle Abonnenten senden'}
        </button>
      </form>

      <div>
        <h2 className="mb-3 font-medium text-stone-900">Versandhistorie</h2>
        {history.length === 0 ? (
          <p className="text-stone-500">Noch kein Newsletter versendet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
            {history.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-stone-900">{entry.subject}</p>
                  <p className="text-xs text-stone-500">
                    {entry.sent_at && new Date(entry.sent_at).toLocaleString('de-DE')}
                  </p>
                </div>
                <p className="text-sm text-stone-600">{entry.recipient_count} Empfänger</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
