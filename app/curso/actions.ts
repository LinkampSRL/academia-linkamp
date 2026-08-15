'use server'

import { createClient } from '@/lib/supabase/server'
import { getCourse } from '@/lib/course'

// Registra que el alumno visitó un módulo (Etapa B del bloque "Progreso
// del alumno"). Nunca toca `completado`: visitar no es completar. El
// upsert es idempotente — revisitar el mismo módulo solo actualiza
// `visitado_at`, gracias al unique(alumno_id, modulo_slug) de la
// migración. Usa el cliente autenticado normal (nunca admin): RLS es la
// barrera real, pero además nunca se confía en un alumno_id que venga
// del cliente — sale siempre de la sesión server-side.
export async function registrarVisita(moduloSlug: string): Promise<void> {
  const course = getCourse()
  if (!course.modulos.some((m) => m.slug === moduloSlug)) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('progreso_modulos').upsert(
    {
      alumno_id: user.id,
      modulo_slug: moduloSlug,
      visitado_at: new Date().toISOString(),
    },
    { onConflict: 'alumno_id,modulo_slug' }
  )
}

// Marca o desmarca un módulo como completado (Etapa C). Acción explícita
// del alumno, independiente de la visita — nunca toca `visitado_at`. Al
// desmarcar, `completado_at` vuelve a null en vez de conservar la última
// fecha en que se había marcado.
export async function marcarModuloCompletado(moduloSlug: string, completado: boolean): Promise<void> {
  const course = getCourse()
  if (!course.modulos.some((m) => m.slug === moduloSlug)) return

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('progreso_modulos').upsert(
    {
      alumno_id: user.id,
      modulo_slug: moduloSlug,
      completado,
      completado_at: completado ? new Date().toISOString() : null,
    },
    { onConflict: 'alumno_id,modulo_slug' }
  )
}
