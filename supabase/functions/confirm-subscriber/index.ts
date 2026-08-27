// Wird per Klick auf den Bestätigungslink aus der Double-Opt-In-Mail aufgerufen (GET, kein Login).
// Setzt confirmed = true für den passenden Token und leitet auf eine Danke-Seite weiter.
import { createClient } from 'jsr:@supabase/supabase-js@2'

const SITE_URL = Deno.env.get('SITE_URL') ?? 'http://localhost:5173'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

Deno.serve(async (req) => {
  const token = new URL(req.url).searchParams.get('token')

  if (!token) {
    return Response.redirect(`${SITE_URL}/newsletter-bestaetigung?status=fehlt`, 302)
  }

  const { data, error } = await supabaseAdmin
    .from('subscribers')
    .update({ confirmed: true })
    .eq('confirm_token', token)
    .eq('confirmed', false)
    .select('id')
    .maybeSingle()

  if (error) {
    console.error(error)
    return Response.redirect(`${SITE_URL}/newsletter-bestaetigung?status=fehler`, 302)
  }

  if (!data) {
    return Response.redirect(`${SITE_URL}/newsletter-bestaetigung?status=ungueltig`, 302)
  }

  return Response.redirect(`${SITE_URL}/newsletter-bestaetigung?status=ok`, 302)
})
