import type { SupabaseClient, User } from 'jsr:@supabase/supabase-js@2'

// Prüft das Bearer-Token aus der Anfrage serverseitig gegen profiles.role — dem Client wird nicht
// vertraut. Gibt entweder den authentifizierten Admin-User zurück oder eine fertige Fehler-Response,
// die der Aufrufer direkt zurückgeben kann.
export async function requireAdmin(
  req: Request,
  supabaseAdmin: SupabaseClient,
  corsHeaders: Record<string, string>,
): Promise<{ user: User } | { errorResponse: Response }> {
  const authHeader = req.headers.get('Authorization') ?? ''
  const jwt = authHeader.replace('Bearer ', '')

  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(jwt)

  if (authError || !user) {
    return {
      errorResponse: new Response(JSON.stringify({ error: 'Nicht angemeldet.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }),
    }
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return {
      errorResponse: new Response(JSON.stringify({ error: 'Keine Admin-Berechtigung.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }),
    }
  }

  return { user }
}
