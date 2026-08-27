// Verfasst und verschickt einen Newsletter an alle bestätigten Abonnenten.
// Nur für Admins: Rolle wird serverseitig über das Bearer-Token geprüft, nicht dem Client vertraut.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')!
const BREVO_SENDER_EMAIL = Deno.env.get('BREVO_SENDER_EMAIL')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const jwt = authHeader.replace('Bearer ', '')

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(jwt)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Nicht angemeldet.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Keine Admin-Berechtigung.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { subject, body } = await req.json()

    if (typeof subject !== 'string' || !subject.trim() || typeof body !== 'string' || !body.trim()) {
      return new Response(JSON.stringify({ error: 'Betreff und Inhalt dürfen nicht leer sein.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: subscribers, error: subscribersError } = await supabaseAdmin
      .from('subscribers')
      .select('email, confirm_token')
      .eq('confirmed', true)

    if (subscribersError) throw subscribersError

    let sentCount = 0
    for (const subscriber of subscribers ?? []) {
      const unsubscribeUrl = `${SUPABASE_URL}/functions/v1/unsubscribe?token=${subscriber.confirm_token}`
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'Keramikwerkstatt Lehmglück', email: BREVO_SENDER_EMAIL },
          to: [{ email: subscriber.email }],
          subject,
          htmlContent: `
            <div>${body}</div>
            <hr />
            <p style="font-size:12px;color:#666;">
              Diese Mail ging an ${subscriber.email}, weil du unseren Newsletter abonniert hast.
              <a href="${unsubscribeUrl}">Newsletter abbestellen</a>
            </p>
          `,
        }),
      })

      if (response.ok) {
        sentCount += 1
      } else {
        console.error(`Versand an ${subscriber.email} fehlgeschlagen:`, await response.text())
      }
    }

    await supabaseAdmin.from('newsletters').insert({
      subject,
      body,
      sent_at: new Date().toISOString(),
      recipient_count: sentCount,
      created_by: user.id,
    })

    return new Response(JSON.stringify({ ok: true, sentCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: 'Versand fehlgeschlagen.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
