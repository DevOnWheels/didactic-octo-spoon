# Keramikwerkstatt Lehmglück — Webpräsenz

Abschlussprojekt: vollständige Webpräsenz für eine kleine Organisation (CMS, Newsletter/CRM, kleine
Shop-Funktion, User-Login, Admin-Dashboard). Demo-Organisation: eine fiktive Keramikwerkstatt.
Die ursprüngliche Aufgabenstellung steht in [`AUFGABENSTELLUNG.md`](./AUFGABENSTELLUNG.md).

**Live-URL:** https://didactic-octo-spoon.pages.dev (Custom Domain `www.labschis.biz` folgt)

---

## Architektur

```
Browser (React SPA, Cloudflare Pages)
   │
   ├─ supabase-js  ──►  Supabase  (Postgres + Auth + Storage)
   │                      ▲ Zugriffsschutz ausschließlich über Row Level Security (RLS)
   │
   └─ fetch ──►  Supabase Edge Functions
                     ├─ subscribe            (Newsletter-Anmeldung + Bestätigungsmail)
                     ├─ confirm-subscriber   (Double-Opt-In-Bestätigung per Link)
                     ├─ unsubscribe          (Newsletter-Abmeldung per Link)
                     └─ send-newsletter      (Admin-only, versendet an bestätigte Abonnenten)
                            └─►  Brevo API   (API-Key nur hier, serverseitig)
```

Kein eigener Server, kein Deployment-Zwang für Backend-Code außer den Edge Functions. Der
Warenkorb lebt im Client-State (React Context) und wird in `sessionStorage` gespiegelt.

---

## Tech-Stack

| Schicht | Wahl |
|---|---|
| Frontend | React 19 + Vite + TypeScript, Tailwind CSS |
| Hosting | Cloudflare Pages (Free-Tier) |
| Datenbank / Auth / Storage | Supabase (Free-Tier), Region EU (Frankfurt) |
| Newsletter-Versand | Brevo (Free-Tier, 300 Mails/Tag) |

Begründung und geprüfte Alternativen: siehe [`CLAUDE.md`](./CLAUDE.md) Abschnitt 3.

---

## Setup (frisches Clone → lauffähig)

### 1. Supabase-Projekt anlegen

1. Account auf [supabase.com](https://supabase.com) anlegen, neues Projekt erstellen.
   **Region: EU (Frankfurt)** wählen — nicht die Standardregion.
2. [Supabase CLI](https://supabase.com/docs/guides/cli) installieren und einloggen:
   ```bash
   npx supabase login
   npx supabase link --project-ref <dein-projekt-ref>
   ```
3. Migrationen und Demo-Daten einspielen:
   ```bash
   npx supabase db push
   npx supabase db execute --file supabase/seed.sql
   ```
4. Storage-Bucket `media` wird von der Migration `20260827100008_storage_media_bucket.sql`
   automatisch angelegt (öffentlich lesbar, Schreibrecht nur für Admins).
5. Edge-Function-Secrets setzen (niemals ins Repo/Frontend):
   ```bash
   npx supabase secrets set BREVO_API_KEY=<dein-brevo-key>
   npx supabase secrets set BREVO_SENDER_EMAIL=<deine-bei-brevo-verifizierte-absenderadresse>
   npx supabase secrets set SITE_URL=http://localhost:5173
   ```
   `SUPABASE_URL` und `SUPABASE_SERVICE_ROLE_KEY` setzt Supabase für Edge Functions automatisch.
6. Edge Functions deployen:
   ```bash
   npx supabase functions deploy subscribe confirm-subscriber unsubscribe send-newsletter
   ```

### 2. Ersten Admin-Nutzer anlegen

1. Über die App unter `/registrieren` ein Konto erstellen.
2. In der Supabase-Tabelle `profiles` die Zeile mit der eigenen `id` von `role = 'user'` auf
   `role = 'admin'` setzen (Supabase Studio → Table Editor, oder per SQL).

### 3. Frontend lokal starten (zum Entwickeln/Testen)

`npm run dev` startet nur einen Entwicklungsserver auf deinem eigenen Rechner
(`localhost:5173`) — mit Hot-Reload, für schnelles Iterieren beim Programmieren. Das ist
**nicht** die Live-Seite; die entsteht erst durch das Deployment in Schritt 5.

```bash
npm install
cp .env.example .env   # VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY eintragen
npm run dev
```

### 4. Brevo einrichten

1. Account auf [brevo.com](https://www.brevo.com) anlegen (Free-Tier, keine Kreditkarte nötig).
2. Absenderadresse verifizieren (Domain oder Single Sender), API-Key erzeugen.
3. Bei der Meldung "Nicht autorisierte IP-Adressen sind blockiert": die IP-Beschränkung
   deaktivieren statt einzelne IPs einzutragen (Settings → SMTP & API → API Keys). Supabase Edge
   Functions laufen auf serverloser Infrastruktur ohne feste, dokumentierte Absender-IP — eine
   Allowlist ist damit nicht pflegbar. Der API-Key bleibt trotzdem geschützt, da er ausschließlich
   als Edge-Function-Secret existiert und nie ins Frontend/Repo gelangt.
4. Key und verifizierte Absenderadresse als Edge-Function-Secrets setzen (siehe oben).

### 5. Deployment auf Cloudflare Pages (Live-Betrieb)

Das Frontend ist eine statische SPA (`npm run build` erzeugt reines HTML/JS/CSS im Ordner
`dist/`) — Cloudflare Pages liefert diese Dateien weltweit über ein CDN aus. Das ist der
tatsächliche "Server im Netz", den Besucher unter der Live-URL aufrufen.

1. Account auf [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) anlegen
   (Free-Tier, keine Kreditkarte nötig).
2. Im Dashboard **Workers & Pages** → **Create application**. Cloudflare hat sein UI 2026 auf
   ein vereinheitlichtes "Workers"-Produkt umgestellt; der Standard-Flow ("Continue with GitHub")
   klont das Repo einmalig in ein von Cloudflare verwaltetes Kopie-Repo und ist **nicht** die
   fortlaufende Git-Anbindung, die wir wollen. Stattdessen ganz unten auf der Seite
   **"Looking to deploy Pages? Get started"** klicken → das ist der klassische Pages-Flow mit
   echter Continuous-Deployment-Anbindung an das bestehende Repo.
3. GitHub-Account verbinden (ggf. Repository-Zugriff für die Cloudflare-Pages-App auf GitHub
   erweitern), Repository auswählen, "Begin setup". Build-Einstellungen:
   | Feld | Wert |
   |---|---|
   | Framework preset | None |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory (advanced) | leer / `/` (Repo-Root, wo `package.json` liegt) |

   Klassisches Pages liefert `dist/` direkt aus (kein `wrangler.toml`/`wrangler.jsonc` nötig).
   Für clientseitiges Routing (React Router) sorgt stattdessen
   [`public/_redirects`](./public/_redirects) (`/* /index.html 200`) dafür, dass z.B.
   `/blog/mein-artikel` bei direktem Aufruf nicht 404 wirft.
4. Umgebungsvariablen im Cloudflare-Pages-Projekt eintragen (Settings → Environment variables):
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — dieselben Werte wie in der lokalen `.env`.
5. Deploy auslösen. Jeder Push auf `main` löst danach automatisch ein neues Deployment aus.
6. Die von Cloudflare vergebene `*.pages.dev`-URL oben bei "Live-URL" eintragen.
7. Das Edge-Function-Secret `SITE_URL` (Schritt 1.5) von `http://localhost:5173` auf die
   echte `*.pages.dev`-URL umstellen, sonst zeigen die Bestätigungs-/Abmeldelinks aus den
   Newsletter-Mails ins Leere:
   ```bash
   npx supabase secrets set SITE_URL=https://<dein-projekt>.pages.dev
   ```

---

## Datenmodell

| Tabelle | Zweck |
|---|---|
| `profiles` | Rolle (`user`/`admin`) pro Nutzer, 1:1 zu `auth.users` |
| `posts` | Blogartikel (CMS) |
| `products` | Shop-Artikel |
| `subscribers` | Newsletter-Abonnenten mit Double-Opt-In (`confirmed`, `confirm_token`) |
| `newsletters` | Versandhistorie |
| `orders` | Protokoll des "Kauf"-Klicks — keine Zahlung, kein Status-Workflow |
| `ping` | Nur für den Keep-Alive-Cron, siehe unten |

Migrationen liegen unter [`supabase/migrations`](./supabase/migrations), Demo-Daten unter
[`supabase/seed.sql`](./supabase/seed.sql).

### RLS-Modell (Kurzfassung)

- **RLS ist auf jeder Tabelle aktiv**, ohne Ausnahme.
- Öffentlich lesbar: veröffentlichte `posts`, aktive `products`.
- Schreibend nur für Admins: `posts`, `products`, `newsletters`.
- `subscribers`: öffentliches Insert (unbestätigt), Lesen/Löschen nur für Admins; die
  Bestätigung/Abmeldung läuft über Edge Functions mit dem `service_role`-Key.
- `orders`: Insert für eigene oder Gast-Bestellungen, Lesen nur der eigenen Bestellungen
  bzw. für Admins alle.
- Die Admin-Rollenprüfung findet **in der Policy** statt (`public.is_admin()`), nicht nur als
  Route Guard im Frontend — sonst wäre `/admin` nur unsichtbar, nicht geschützt.

### Warum darf der `anon key` im Frontend öffentlich sein?

Der `anon key` identifiziert nur, *welches* Supabase-Projekt angesprochen wird — er verleiht keine
Rechte. Jede Anfrage läuft trotzdem durch die RLS-Policies der jeweiligen Tabelle; ohne passende
Policy liefert die Datenbank schlicht keine Zeilen zurück. Der `service_role`-Key dagegen umgeht
RLS vollständig und bleibt deshalb ausschließlich in den Edge-Function-Secrets.

---

## Kostenkonzept

| Posten | Kosten/Jahr |
|---|---|
| Cloudflare Pages | 0 € |
| Supabase Free | 0 € |
| Brevo Free (300 Mails/Tag) | 0 € |
| Domain (`labschis.biz`) | 0 € — Inklusiv-Domain im bereits vorhandenen Hosting-Paket |
| **Gesamt** | **0 € / Jahr**, deutlich unter der 24-€-Grenze |

Ursprünglich war laut CLAUDE.md §3 eine eigens gekaufte `.de`-Domain (~5 €/Jahr bei netcup/INWX)
vorgesehen. Stattdessen wird eine `.biz`-Domain genutzt, die im bereits bestehenden Hosting-Paket
des Nutzers als Inklusiv-Domain kostenlos enthalten ist — für dieses Demo-Projekt ohne echten
zahlenden Kunden ein sinnvoller Kompromiss. Für eine echte Organisation ohne eigenes Hosting-Paket
bliebe die ursprüngliche Kalkulation (eigene `.de`-Domain, ~5 €/Jahr) der realistischere Ansatz.

Geprüfte und bewusst verworfene Alternativen (WordPress+WooCommerce, Vercel, Firebase, Mailchimp,
Azure/DigitalOcean-Guthaben) inkl. Begründung: siehe [`CLAUDE.md`](./CLAUDE.md) Abschnitt 3.

---

## Bekannte Grenzen der Free-Tiers

- **Supabase**: Free-Projekte pausieren nach 7 Tagen ohne Datenbankaktivität. Dagegen läuft ein
  täglicher GitHub-Actions-Cron ([`.github/workflows/keepalive.yml`](./.github/workflows/keepalive.yml)),
  der einen minimalen Insert/Delete in der `ping`-Tabelle ausführt.
- **Brevo**: 300 Mails/Tag, unbegrenzte Kontakte im Free-Tier; Mails tragen ein Brevo-Branding.
- **Cloudflare Pages**: 100.000 Requests/Tag für Functions (hier ungenutzt, da kein eigenes
  Cloudflare-Backend).

---

## Erweiterungspunkte (außerhalb des aktuellen Scopes)

- **Zahlungsabwicklung**: Stripe wäre die naheliegende Ergänzung, da Stripe Connect/Checkout ohne
  eigene PCI-Pflichten auskommt. Aktuell endet der Kaufprozess bewusst am "Kauf"-Button.
- **Rollen**: aktuell nur `user`/`admin`; erweiterbar um z.B. `editor` für Redakteure ohne
  Newsletter-Zugriff.
- **Mehrsprachigkeit**: aktuell nur Deutsch; Inhalte liegen in normalen Textspalten, keine
  strukturellen Hürden für i18n.

---

## Sicherheit & Datenschutz

- Double-Opt-In für den Newsletter, Abmeldelink in jeder Mail (siehe `subscribers`-Policies oben).
- Kein Analytics, kein Tracking, keine externen Schriftarten → kein Cookie-Banner nötig.
- Datenhaltung in der EU (Supabase Frankfurt, Brevo Frankreich).
- Impressum und Datenschutzerklärung sind im Footer verlinkt (`/impressum`, `/datenschutz`,
  aktuell mit Platzhalterinhalten für das Demo-Projekt).

### Bewusste Entscheidung: keine E-Mail-Bestätigung beim User-Login

Supabase Auth verlangt im Standardzustand, dass Nutzer ihre E-Mail-Adresse per Klick auf einen
Bestätigungslink verifizieren, bevor der erste Login klappt. Der dafür genutzte Mailversand ist im
Free-Tier stark ratelimitiert und unzuverlässig (landet häufig im Spam) — unabhängig von Brevo, das
ausschließlich für den Newsletter zuständig ist. Für dieses Projekt ist `mailer_autoconfirm` in den
Supabase-Auth-Einstellungen deshalb bewusst aktiviert: Registrierung und Login funktionieren sofort,
ohne dass ein zusätzlicher Mailversand für die Konto-Bestätigung aufgesetzt werden muss.

**Trade-off:** Wer sich registriert, muss die angegebene E-Mail-Adresse nicht tatsächlich besitzen.
Für den Shop-/Blog-Login einer kleinen Organisation (kein Zahlungsverkehr, keine sensiblen Daten im
Nutzerkonto) ist das ein akzeptables Risiko. Erweiterungspunkt: `mailer_autoconfirm` in den
Supabase-Auth-Einstellungen deaktivieren, sobald ein zuverlässiger Mailversand (z.B. über Brevo als
Auth-SMTP-Provider) eingerichtet ist.

---

## Entwicklungsstand

- [x] Projekt-Setup (Vite + React + TS + Tailwind), Routing
- [x] Datenmodell, RLS-Policies, Storage-Policies (Migrationen)
- [x] Auth (Registrierung/Login/Logout), Admin-Rollenprüfung serverseitig
- [x] Öffentlicher Bereich: Landing Page, Blog, Shop, Warenkorb, Kauf-Bestätigung
- [x] Newsletter: Double-Opt-In-Anmeldung, Bestätigung, Abmeldung (Edge Functions)
- [x] Admin-Dashboard: Statistiken, Beiträge (inkl. Bild-Upload), Newsletter-Versand
- [x] Supabase-Account: Migrationen + Seed-Daten live eingespielt, Admin-Account eingerichtet
- [x] Brevo-Account: Newsletter-Anmeldung, Bestätigung und Versand live getestet
- [x] Cloudflare-Pages-Account, Deployment, Live-URL (https://didactic-octo-spoon.pages.dev)
- [ ] Custom Domain `www.labschis.biz` verknüpft
- [ ] GitHub-Actions-Secrets für Keep-Alive-Cron gesetzt
- [ ] `REFLEXION.md`
