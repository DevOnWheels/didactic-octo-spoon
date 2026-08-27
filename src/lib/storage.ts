import { supabase } from './supabaseClient'

export function publicImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null
  return supabase.storage.from('media').getPublicUrl(imagePath).data.publicUrl
}
