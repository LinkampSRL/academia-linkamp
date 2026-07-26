import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

// Cliente de Supabase para Server Components, Server Actions y Route
// Handlers. Lee/escribe la sesión a través de las cookies de la request.
// El middleware (Paso 5.1.3) es el responsable de refrescar la sesión en
// cada navegación; este cliente solo la lee.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Llamado desde un Server Component (sin acceso de escritura a
            // cookies fuera de Server Actions/Route Handlers). Se ignora:
            // el middleware de la Etapa 4 se encarga de refrescar la sesión.
          }
        },
      },
    }
  )
}
