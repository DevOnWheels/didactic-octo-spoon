export function Datenschutz() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-ink-700">
      <h1 className="text-2xl font-bold text-ink-900">Datenschutzerklärung</h1>
      <p className="text-sm text-ink-500">
        Platzhalterinhalt für das Demo-Projekt — vor echtem Betrieb durch eine vollständige,
        rechtlich geprüfte Datenschutzerklärung ersetzen.
      </p>

      <section>
        <h2 className="mb-1 font-bold text-ink-900">Hosting & Datenhaltung</h2>
        <p className="text-sm">
          Diese Seite wird über Cloudflare Pages ausgeliefert. Nutzer- und Anwendungsdaten werden bei
          Supabase in einem Rechenzentrum in Frankfurt am Main (EU) gespeichert.
        </p>
      </section>

      <section>
        <h2 className="mb-1 font-bold text-ink-900">Newsletter</h2>
        <p className="text-sm">
          Bei der Anmeldung zum Newsletter wird deine E-Mail-Adresse gespeichert und der Versand
          erfolgt über Brevo (Frankreich, EU) erst nach Bestätigung per Double-Opt-In. Du kannst dich
          jederzeit über den Abmeldelink in jeder Newsletter-Mail wieder austragen.
        </p>
      </section>

      <section>
        <h2 className="mb-1 font-bold text-ink-900">Konto & Login</h2>
        <p className="text-sm">
          Bei der Registrierung werden E-Mail-Adresse und Anzeigename gespeichert, verwaltet über
          Supabase Auth.
        </p>
      </section>

      <section>
        <h2 className="mb-1 font-bold text-ink-900">Kein Tracking</h2>
        <p className="text-sm">
          Diese Seite verwendet kein Analytics, kein Tracking und keine externen Schriftarten. Daher
          ist kein Cookie-Banner erforderlich.
        </p>
      </section>
    </div>
  )
}
