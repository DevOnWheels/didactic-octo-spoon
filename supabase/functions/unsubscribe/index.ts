// Abmeldelink aus jeder Newsletter-Mail (DSGVO-Pflicht, siehe CLAUDE.md §8).
// Nutzt denselben Token wie die Bestätigung — löscht den Eintrag, kein Status-Workflow.
import { createClient } from 'jsr:@supabase/supabase-js@2'

const SITE_URL = Deno.env.get('SITE_URL') ?? 'http://localhost:5173'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

Deno.serve(async (req) => {
  const token = new URL(req.url).searchParams.get('token')

  if (!token) {
    return Response.redirect(`${SITE_URL}/newsletter-abmeldung?status=fehlt`, 302)
  }

  const { error } = await supabaseAdmin.from('subscribers').delete().eq('confirm_token', token)

  if (error) {
    console.error(error)
    return Response.redirect(`${SITE_URL}/newsletter-abmeldung?status=fehler`, 302)
  }

  return Response.redirect(`${SITE_URL}/newsletter-abmeldung?status=ok`, 302)
})
