import type { SupabaseClient } from '@supabase/supabase-js'

export type Profile = {
  id: string
  nombre: string
  apellido: string
  empresa: string
  rol: 'admin' | 'alumno'
  activo: boolean
  fecha_inicio: string
  fecha_vencimiento: string | null
  ultimo_login: string | null
  created_at: string
  updated_at: string
}

// Lee el profile del usuario autenticado. Reutilizable desde proxy.ts (con
// el cliente que arma a partir de las cookies de la request) y desde
// Server Components (con lib/supabase/server.ts). `null` cubre tanto el
// error de red/consulta como el caso legítimo de profile inexistente —
// en ambos casos el llamador debe negar el acceso de forma segura.
export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error || !data) return null
  return data as Profile
}
