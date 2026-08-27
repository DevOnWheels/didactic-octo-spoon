// Nimmt eine Newsletter-Anmeldung entgegen, legt den Subscriber an (confirmed = false)
// und verschickt die Double-Opt-In-Bestätigungsmail über Brevo.
// Läuft mit dem service_role key, deshalb bewusst als Edge Function statt Client-Insert:
// so bleibt der Brevo-API-Key serverseitig und der Bestätigungslink wird garantiert verschickt.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()

    if (typeof email !== 'string' || !isValidEmail(email)) {
      return new Response(JSON.stringify({ error: 'Ungültige E-Mail-Adresse.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: existing } = await supabaseAdmin
      .from('subscribers')
      .select('id, confirmed, confirm_token')
      .eq('email', email)
      .maybeSingle()

    let confirmToken: string

    if (existing) {
      if (existing.confirmed) {
        // Bereits bestätigt: keine erneute Mail, kein Hinweis nach außen (kein Email-Enumeration-Leak).
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      confirmToken = existing.confirm_token
    } else {
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('subscribers')
        .insert({ email })
        .select('confirm_token')
        .single()

      if (insertError || !inserted) {
        throw insertError ?? new Error('Insert fehlgeschlagen.')
      }
      confirmToken = inserted.confirm_token
    }

    const confirmUrl = `${SUPABASE_URL}/functions/v1/confirm-subscriber?token=${confirmToken}`

    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Keramikwerkstatt Lehmglück', email: 'newsletter@lehmglueck.example' },
        to: [{ email }],
        subject: 'Bitte bestätige deine Newsletter-Anmeldung',
        htmlContent: `
          <p>Hallo,</p>
          <p>bitte bestätige deine Anmeldung zum Newsletter der Keramikwerkstatt Lehmglück mit einem Klick:</p>
          <p><a href="${confirmUrl}">Anmeldung bestätigen</a></p>
          <p>Falls du dich nicht angemeldet hast, kannst du diese Mail ignorieren.</p>
        `,
      }),
    })

    if (!brevoResponse.ok) {
      const detail = await brevoResponse.text()
      throw new Error(`Brevo-Versand fehlgeschlagen: ${detail}`)
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: 'Anmeldung konnte nicht verarbeitet werden.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
