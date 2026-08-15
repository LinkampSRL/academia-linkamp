'use server'

import { createClient } from '@/lib/supabase/server'
import { getCourse } from '@/lib/course'
import { getPreguntas, tienePreguntas } from '@/lib/preguntas'
import type { Respuesta } from '@/lib/evaluacion'

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

export interface ResultadoIntento {
  puntaje: number
  aprobado: boolean
  cantidadPreguntas: number
  cantidadCorrectas: number
}

export type RegistrarIntentoResult =
  | { ok: true; resultado: ResultadoIntento }
  | { ok: false; error: string }

// Registra un intento de evaluación (Etapa B del bloque "Persistencia de
// evaluaciones"). El navegador manda únicamente qué preguntas contestó y
// con qué opción — nunca un puntaje ni un "aprobado": ambos se calculan
// acá, exclusivamente contra el banco real leído server-side, después de
// validar que el intento es legítimo (cantidad correcta de respuestas,
// sin preguntas repetidas, todas pertenecientes a este módulo). Cada
// llamada válida inserta una fila nueva e inmutable — nunca se actualiza
// un intento ya guardado.
export async function registrarIntentoEvaluacion(
  moduloSlug: string,
  respuestas: Respuesta[]
): Promise<RegistrarIntentoResult> {
  const course = getCourse()
  if (!course.modulos.some((m) => m.slug === moduloSlug)) {
    return { ok: false, error: 'Módulo inválido.' }
  }
  if (!tienePreguntas(moduloSlug)) {
    return { ok: false, error: 'Este módulo no tiene evaluación.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: 'No autenticado.' }
  }

  const banco = getPreguntas(moduloSlug)

  if (respuestas.length !== banco.preguntas_por_intento) {
    return { ok: false, error: 'La cantidad de respuestas no coincide con la evaluación.' }
  }

  const idsRecibidos = respuestas.map((r) => r.preguntaId)
  if (new Set(idsRecibidos).size !== idsRecibidos.length) {
    return { ok: false, error: 'El intento incluye preguntas repetidas.' }
  }

  const preguntasPorId = new Map(banco.preguntas.map((p) => [p.id, p]))
  for (const id of idsRecibidos) {
    if (!preguntasPorId.has(id)) {
      return { ok: false, error: 'El intento incluye una pregunta que no pertenece a este módulo.' }
    }
  }

  const cantidadPreguntas = respuestas.length
  const cantidadCorrectas = respuestas.filter(
    (r) => preguntasPorId.get(r.preguntaId)!.respuesta_correcta === r.opcionSeleccionada
  ).length
  const puntaje = Math.round((cantidadCorrectas / cantidadPreguntas) * 100)
  const aprobado = puntaje >= banco.nota_minima_aprobacion

  const { error } = await supabase.from('intentos_evaluacion').insert({
    alumno_id: user.id,
    modulo_slug: moduloSlug,
    puntaje,
    aprobado,
    cantidad_preguntas: cantidadPreguntas,
    cantidad_correctas: cantidadCorrectas,
  })

  if (error) {
    return { ok: false, error: 'No se pudo registrar el intento. Intentá de nuevo.' }
  }

  return { ok: true, resultado: { puntaje, aprobado, cantidadPreguntas, cantidadCorrectas } }
}
