import { Link, useSearchParams } from 'react-router-dom'

const MESSAGES: Record<string, string> = {
  ok: 'Du wurdest erfolgreich vom Newsletter abgemeldet.',
  fehlt: 'Es fehlt ein Abmelde-Token in diesem Link.',
  fehler: 'Etwas ist schiefgelaufen. Bitte versuch es später erneut.',
}

export function NewsletterAbmeldung() {
  const [params] = useSearchParams()
  const status = params.get('status') ?? 'fehler'

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10">
      <h1 className="text-4xl font-semibold text-ink-900">Newsletter-Abmeldung</h1>
      <p className="text-ink-600">{MESSAGES[status] ?? MESSAGES.fehler}</p>
      <Link to="/" className="text-clay-700 hover:underline">
        Zur Startseite
      </Link>
    </div>
  )
}
