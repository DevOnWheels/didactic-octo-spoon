import { Link, useSearchParams } from 'react-router-dom'

const MESSAGES: Record<string, string> = {
  ok: 'Deine Newsletter-Anmeldung ist bestätigt. Willkommen!',
  ungueltig: 'Dieser Bestätigungslink ist ungültig oder wurde bereits verwendet.',
  fehlt: 'Es fehlt ein Bestätigungs-Token in diesem Link.',
  fehler: 'Etwas ist schiefgelaufen. Bitte versuch es später erneut.',
}

export function NewsletterBestaetigung() {
  const [params] = useSearchParams()
  const status = params.get('status') ?? 'fehler'

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-semibold text-stone-900">Newsletter-Anmeldung</h1>
      <p className="text-stone-600">{MESSAGES[status] ?? MESSAGES.fehler}</p>
      <Link to="/" className="text-amber-700 hover:underline">
        Zur Startseite
      </Link>
    </div>
  )
}
