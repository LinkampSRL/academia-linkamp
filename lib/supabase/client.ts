import { createBrowserClient } from '@supabase/ssr'

// Cliente de Supabase para Client Components (browser).
// Usa la anon key: el acceso real a los datos queda acotado por las
// políticas RLS de cada tabla (ver supabase/migrations/), no por esta clave.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
