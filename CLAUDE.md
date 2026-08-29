# CLAUDE.md — Abschlussprojekt "Webpräsenz für kleine Organisation"

Projektanweisungen für Claude Code. Diese Datei ist verbindlich für alle Implementierungsentscheidungen.

---

## 1. Projektkontext

Abschlussprojekt einer Fortbildung. Zu bauen ist eine vollständige Webpräsenz für eine kleine
Organisation: CMS, Newsletter/CRM, kleine Shop-Funktion, User-Login und ein selbst gebautes
Admin-Dashboard.

**Prüfungsrahmen:**
- Abgabe/Präsentation: **04.09.2026**
- Bestandteile: kurze Präsentation des Projekts + Quellcode in einem Git-Repository
- Bewertet werden ausdrücklich: fehlerfreier/stabiler Betrieb, Erweiterbarkeit, verständliche
  Dokumentation — sowie die **Recherche**, welche Tools in ein Zero-Cost-Konzept passen
- Das Projekt demonstriert AI-First-Entwicklung. Die Commit-Historie ist Teil des Nachweises.

**Wichtige Unterscheidung:** Der Prototyp muss nur bis zum 04.09.2026 laufen. Das **Kostenkonzept**
muss aber dauerhaft tragfähig sein, weil "max. 24 €/Jahr inkl. Domain" eine Anforderung der
Aufgabenstellung ist und nicht nur ein Betriebsrisiko. Deshalb gilt: Startguthaben und
zeitlich befristete Angebote sind keine gültige Grundlage der Architektur.

---

## 2. Harte Randbedingungen

| Bedingung | Wert |
|---|---|
| Gesamtkosten | max. 24 €/Jahr **inkl. Domain** |
| Monatliche Serverkosten | keine (Kunde lehnt strikt ab) |
| Zahlungsabwicklung | **nicht** implementieren — Flow endet am "Kauf"-Button |
| Wartungsaufwand nach Abgabe | soll gegen null gehen |

---

## 3. Tech-Stack

| Schicht | Wahl | Begründung |
|---|---|---|
| Frontend | React + Vite (SPA, TypeScript) | keine Server-Runtime nötig, schnellster Weg zum Ziel |
| Hosting | **Cloudflare Pages** | Free-Tier ohne Ablaufdatum, kommerzielle Nutzung erlaubt, keine Kreditkarte |
| Datenbank / Auth / Storage | **Supabase** (Free) | Postgres + Auth + Storage + RLS in einem Produkt, keine Kreditkarte |
| Backend-Logik | Supabase **Edge Functions** | nur für Mailversand — sonst kein eigenes Backend |
| Newsletter-Versand | **Brevo** (Free) | 300 Mails/Tag, unbegrenzte Kontakte, EU-Anbieter (Frankreich) → DSGVO |
| Domain | .de bei netcup/INWX, ca. 5 €/Jahr | im Namen des **Kunden** registrieren, nicht im eigenen |
| E-Mail-Tests | testmail.app (GitHub Student Pack) | Wegwerf-Postfächer per API, keine echten Adressen im Test |
| Styling | Tailwind CSS | Tempo, konsistente Optik |

**Supabase-Region: EU (Frankfurt).** Nicht die Default-Region übernehmen — Datenhaltung in der EU
ist Teil der DSGVO-Argumentation in der Dokumentation.

### Bewusst verworfene Alternativen (gehören in die Doku)

- **WordPress + WooCommerce** — scheitert am Budget: braucht dauerhaft PHP+MySQL. WordPress.com Free
  erlaubt keine Plugins, der günstigste plugin-fähige Tarif liegt bei ~48 $/Jahr. Kostenlose
  PHP-Hoster sind für Shops nicht empfehlenswert. Zusätzlich: permanente Update-Pflicht.
- **Vercel** — Hobby-Tarif verbietet laut AGB kommerzielle Nutzung. Für einen Prototyp vertretbar,
  für den Produktivbetrieb des Kunden nicht. Nur relevant, falls doch auf Next.js gewechselt wird;
  dann in der Doku als bewusste Prototyp-Entscheidung kennzeichnen.
- **Firebase** — Cloud Storage verlangt seit 03.02.2026 zwingend den Blaze-Plan, Cloud Functions
  ebenfalls. Damit wäre für den Bild-Upload eine Kreditkarte nötig — an einen Kunden mit dieser
  Kostenrestriktion nicht verkaufbar.
- **Mailchimp** — Free-Tier seit 17.02.2026 auf 250 Kontakte / 500 Mails pro Monat reduziert.
- **Azure for Students / DigitalOcean-Credits** — 100 $ bzw. 200 $ Guthaben für 12 Monate, danach
  wird die Subscription deaktiviert. Ein Guthaben ist kein Zero-Cost, sondern aufgeschobene Kosten,
  zusätzlich gebunden an den Studentenstatus einer einzelnen Person.

---

## 4. Architektur

```
Browser (React SPA, Cloudflare Pages)
   │
   ├─ supabase-js  ──►  Supabase  (Postgres + Auth + Storage)
   │                      ▲ Zugriffsschutz ausschließlich über RLS
   │
   └─ fetch ──►  Supabase Edge Function "send-newsletter"
                     └─►  Brevo API   (API-Key nur hier, serverseitig)
```

Kein eigener Server, kein Deployment-Zwang für Backend-Code außer der einen Edge Function.
Der Warenkorb lebt im Client-State und wird in `sessionStorage` gespiegelt.

---

## 5. Sicherheitsregeln — nicht verhandelbar

Das ist die wahrscheinlichste kritische Frage in der Präsentation. Entsprechend sauber umsetzen.

### Keys

| Key | Wohin | Anmerkung |
|---|---|---|
| Supabase **anon key** | Frontend / Repo | öffentlich **by design** — nur sicher, weil RLS greift |
| Supabase **service_role key** | ausschließlich Edge-Function-Secrets | **niemals** ins Frontend oder Repo |
| **Brevo API-Key** | ausschließlich Edge-Function-Secrets | **niemals** ins Frontend oder Repo |

- `.env` in `.gitignore`, dazu eine committete `.env.example` mit leeren Werten.
- In der README einen Absatz, **warum** der anon key öffentlich sein darf. Das ist der Unterschied
  zwischen "konfiguriert" und "verstanden".

### Row Level Security

- **RLS auf jeder Tabelle aktivieren.** Keine Ausnahme, auch nicht "temporär zum Testen".
- Der Admin-Schutz darf **nicht** nur eine Route Guard im React-Router sein. Die Rollenprüfung muss
  in der Policy stattfinden, sonst ist der geschützte Bereich nur unsichtbar, nicht geschützt.
- Rolle in `profiles.role` (`'user' | 'admin'`), Policies prüfen gegen `auth.uid()`.
- Storage-Bucket für Beitragsbilder: öffentlich lesbar, Schreibrecht nur für Admins.

---

## 6. Datenmodell (Ausgangsentwurf)

- `profiles` — id (FK auf auth.users), display_name, role, created_at
- `posts` — id, title, slug, excerpt, body, image_path, published, created_at
- `products` — id, name, slug, description, price_cents, image_path, active
- `subscribers` — id, email (unique), confirmed, confirm_token, created_at
- `newsletters` — id, subject, body, sent_at, recipient_count, created_by
- `orders` — id, user_id (nullable), items (jsonb), total_cents, created_at
  → nur Protokoll des "Kauf"-Klicks, **keine** Zahlung, kein Status-Workflow

Beim Anlegen: Migrationen als SQL-Dateien im Repo ablegen (`/supabase/migrations`), nicht nur im
Dashboard klicken. Ohne das ist das Projekt nicht reproduzierbar und die Doku nicht belegbar.

---

## 7. Funktionsumfang

### Subtask 1 — öffentlicher Bereich
- Landing Page: Hero, Services, Über uns
- News-Feed dynamisch aus der Datenbank + Detailansicht
- Shop: Produktübersicht, Detailansicht, Warenkorb, "Kauf"-Button → Bestätigungsseite
- Registrierung und Login
- Newsletter-Anmeldeformular mit Validierung

### Subtask 2 — Admin-Dashboard unter `/admin`
- Protected Route, Zugriff nur nach Login **und** Admin-Rolle
- Kennzahlen: Abonnentenzahl, Anzahl Beiträge, Anzahl Produkte
- Beiträge anlegen, bearbeiten und löschen, inkl. Bild-Upload nach Supabase Storage
- Produkte anlegen, bearbeiten und löschen, inkl. Bild-Upload nach Supabase Storage
  (nachträglich ergänzt am 29.08.2026 — ursprünglich nur öffentliche Produktanzeige geplant,
  Produktpflege lief zunächst nur über Seed-Daten/Supabase Studio)
- Newsletter verfassen und an bestätigte Abonnenten versenden

### Ausdrücklich außerhalb des Scopes
Zahlungsabwicklung, Stripe-Integration, Lagerbestände, Versandlogik, Bestellstatus, Volltextsuche,
Mehrsprachigkeit, Kommentarfunktion, WYSIWYG-Editor (Markdown genügt).
Stripe nur in der Doku als vorbereiteter Erweiterungspunkt beschreiben.

---

## 8. DSGVO und Pflichtangaben

Für eine echte Organisationsseite in Deutschland relevant — und ein dankbares Präsentationsthema:

- **Double Opt-In** für den Newsletter ist Pflicht, nicht optional: Eintrag mit
  `confirmed = false`, Bestätigungsmail mit Token, erst danach `confirmed = true`. Versand
  ausschließlich an bestätigte Adressen.
- Abmeldelink in jedem Newsletter.
- Seiten **Impressum** und **Datenschutzerklärung** anlegen (Platzhalterinhalte genügen, aber im
  Menü verlinkt und erreichbar).
- Kein Analytics, kein Tracking, keine externen Fonts → damit ist kein Cookie-Banner nötig. Das
  ist eine bewusste Entscheidung und gehört als solche in die Doku.
- Datenhaltung in der EU (Supabase Frankfurt, Brevo als französischer Anbieter).

---

## 9. Repository und Commits

- **Ab sofort committen, nicht am Vorabend.** Eine nachvollziehbare Historie über den gesamten
  Zeitraum ist Teil des Nachweises; ein einzelner Initial-Commit wirft Fragen auf.
- Kleine, thematisch abgegrenzte Commits mit sprechenden Nachrichten (Conventional Commits:
  `feat:`, `fix:`, `docs:`, `chore:`).
- Vor dem ersten Push prüfen: keine Secrets in der Historie. Falls doch — Key rotieren, nicht
  nur den Commit "überschreiben".
- Sichtbarkeit des Repos und Zugriff für die Mentorin früh klären.

---

## 10. Dokumentation = README.md

Die README ist die Abgabe-Dokumentation, kein separates Dokument. Struktur:

1. Kurzbeschreibung + **Live-URL ganz oben**
2. Architekturdiagramm (Textdiagramm genügt)
3. Setup in nachvollziehbaren Schritten (frisches Clone → lauffähig)
4. Datenmodell inkl. RLS-Policies und Erklärung des anon-key-Modells
5. Kostenkonzept: Aufstellung gegen die 24 €/Jahr + geprüfte und verworfene Alternativen (§3)
6. Bekannte Grenzen der Free-Tiers (Supabase-Pause, Brevo 300/Tag, Brevo-Branding im Free-Tier)
7. Erweiterungspunkte (Zahlungsabwicklung, Rollen, Mehrsprachigkeit)

Dazu die geforderte **Abschluss-Reflexion** als eigene Datei `REFLEXION.md`:
Gedanken zum Projekt und zur Frage, ob damit eine Agentur ersetzbar ist.

---

## 11. Betriebshinweise

- **Supabase Keep-Alive einrichten** (GitHub Actions, täglicher Cron, minimaler Insert in eine
  Ping-Tabelle mit rollierendem Delete). Free-Projekte werden nach 7 Tagen ohne Datenbankaktivität
  pausiert; ein Cold Start am Prüfungstag ist der teuerste vermeidbare Fehler des Projekts.
- Rate Limits im Blick behalten: Brevo 300 Mails/Tag, Cloudflare Workers 100k Requests/Tag.

---

## 12. Zeitplan (Stand 27.08.2026, 8 Tage inkl. heute)

| Datum | Inhalt |
|---|---|
| 27.–28.08. | Repo-Setup, Supabase-Projekt (EU), Datenmodell, RLS-Policies, Auth |
| 29.–30.08. | Öffentlicher Bereich: Landing Page, News, Shop, Warenkorb |
| 31.08.–01.09. | Admin-Dashboard, Bild-Upload, Newsletter-Edge-Function, Double Opt-In |
| **01.09.** | **Feature-Freeze** |
| 02.09. | Seed-Daten, kompletter Demo-Durchlauf, Bildschirmaufnahme als Absicherung |
| 03.09. | README, REFLEXION.md, Präsentation |
| 04.09. | Puffer + Prüfung |

Ab 01.09. keine neuen Features. Doku und Präsentation sind bewertete Hauptanforderungen und
brauchen echte Zeit, nicht den Rest eines Abends.

---

## 13. Vorbereitung der Präsentation

- **Realistische Seed-Daten**: 3 echte Blogartikel und 4 Produkte mit Bildern. Kein Lorem ipsum.
- **Zweiter Testnutzer** (normaler User zusätzlich zum Admin), damit Kunden- und Admin-Sicht ohne
  Ab- und Anmelden vorgeführt werden können.
- Bildschirmaufnahme des gesamten Ablaufs als Rückfalloption gegen WLAN, Cold Start oder ein
  Free-Tier-Limit zur falschen Minute.
- Auf diese Fragen eine Antwort parat haben:
  - Warum darf der anon key öffentlich sein?
  - Wie ist `/admin` tatsächlich geschützt — und was passiert bei direktem API-Zugriff?
  - Was kostet der Betrieb pro Jahr, und was passiert, wenn die Organisation wächst?
  - Warum nicht WordPress?

---

## 14. Arbeitsweise für Claude Code

- Vor größeren Schritten kurz den Plan nennen, dann umsetzen.
- Bei Konflikt zwischen Tempo und den Sicherheitsregeln aus §5 gewinnen immer die Sicherheitsregeln.
- Kein Feature vorschlagen, das in §7 als außerhalb des Scopes markiert ist — die Deadline ist
  fix und der Puffer klein.
- Bei Unsicherheit über Free-Tier-Grenzen oder aktuelle API-Versionen nachfragen oder
  verifizieren, statt aus dem Gedächtnis zu antworten. Die Tarife haben sich 2026 mehrfach geändert.
