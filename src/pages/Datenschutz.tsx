export function Datenschutz() {
  return (
    <div className="flex flex-col gap-4 text-stone-700">
      <h1 className="text-2xl font-semibold text-stone-900">Datenschutzerklärung</h1>
      <p className="text-sm text-stone-500">
        Platzhalterinhalt für das Demo-Projekt — vor echtem Betrieb durch eine vollständige,
        rechtlich geprüfte Datenschutzerklärung ersetzen.
      </p>

      <section>
        <h2 className="mb-1 font-medium text-stone-900">Hosting & Datenhaltung</h2>
        <p className="text-sm">
          Diese Seite wird über Cloudflare Pages ausgeliefert. Nutzer- und Anwendungsdaten werden bei
          Supabase in einem Rechenzentrum in Frankfurt am Main (EU) gespeichert.
        </p>
      </section>

      <section>
        <h2 className="mb-1 font-medium text-stone-900">Newsletter</h2>
        <p className="text-sm">
          Bei der Anmeldung zum Newsletter wird deine E-Mail-Adresse gespeichert und der Versand
          erfolgt über Brevo (Frankreich, EU) erst nach Bestätigung per Double-Opt-In. Du kannst dich
          jederzeit über den Abmeldelink in jeder Newsletter-Mail wieder austragen.
        </p>
      </section>

      <section>
        <h2 className="mb-1 font-medium text-stone-900">Konto & Login</h2>
        <p className="text-sm">
          Bei der Registrierung werden E-Mail-Adresse und Anzeigename gespeichert, verwaltet über
          Supabase Auth.
        </p>
      </section>

      <section>
        <h2 className="mb-1 font-medium text-stone-900">Kein Tracking</h2>
        <p className="text-sm">
          Diese Seite verwendet kein Analytics, kein Tracking und keine externen Schriftarten. Daher
          ist kein Cookie-Banner erforderlich.
        </p>
      </section>
    </div>
  )
}
