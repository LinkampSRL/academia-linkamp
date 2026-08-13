import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Cliente con SUPABASE_SERVICE_ROLE_KEY — bypassa RLS. Solo para el panel
// admin (Sprint 5.4), siempre después de re-verificar server-side que el
// usuario actual es rol='admin'. El import de 'server-only' hace fallar el
// build si este archivo se importa alguna vez desde un Client Component.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
