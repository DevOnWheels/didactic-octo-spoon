// Nutzerverwaltung für Admins: Liste aller Nutzer, Passwort setzen, Konto löschen.
// Braucht den service_role key (Supabase Auth Admin API) — deshalb Edge Function statt Client-Call.
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { requireAdmin } from '../_shared/requireAdmin.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const adminCheck = await requireAdmin(req, supabaseAdmin, corsHeaders)
  if ('errorResponse' in adminCheck) return adminCheck.errorResponse
  const { user: admin } = adminCheck

  try {
    const { action, userId, newPassword } = await req.json()

    if (action === 'list') {
      const [{ data: authUsers, error: listError }, { data: profiles, error: profilesError }] =
        await Promise.all([
          supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
          supabaseAdmin.from('profiles').select('id, display_name, role'),
        ])

      if (listError) throw listError
      if (profilesError) throw profilesError

      const profileById = new Map((profiles ?? []).map((p) => [p.id, p]))

      const users = authUsers.users.map((u) => ({
        id: u.id,
        email: u.email,
        display_name: profileById.get(u.id)?.display_name ?? '—',
        role: profileById.get(u.id)?.role ?? 'user',
        created_at: u.created_at,
      }))

      return jsonResponse({ users })
    }

    if (action === 'set-password') {
      if (typeof userId !== 'string' || typeof newPassword !== 'string' || newPassword.length < 6) {
        return jsonResponse({ error: 'Passwort muss mindestens 6 Zeichen haben.' }, 400)
      }

      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword })
      if (error) throw error

      return jsonResponse({ ok: true })
    }

    if (action === 'delete') {
      if (typeof userId !== 'string') {
        return jsonResponse({ error: 'userId fehlt.' }, 400)
      }
      if (userId === admin.id) {
        return jsonResponse({ error: 'Du kannst dein eigenes Konto hier nicht löschen.' }, 400)
      }

      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (error) throw error

      return jsonResponse({ ok: true })
    }

    return jsonResponse({ error: 'Unbekannte Aktion.' }, 400)
  } catch (error) {
    console.error(error)
    return jsonResponse({ error: 'Aktion fehlgeschlagen.' }, 500)
  }
})
