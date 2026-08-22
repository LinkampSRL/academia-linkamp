'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProfile } from '@/lib/profile'
import { getCourse } from '@/lib/course'
import {
  calcularFinalizacion,
  type ProgresoModuloFinalizacion,
  type IntentoFinalizacion,
} from '@/lib/finalizacion'
import { construirSnapshotCertificado, CERTIFICADO_COLUMNAS, type Certificado } from '@/lib/certificado'

export type EmitirCertificadoResult =
  | { ok: true; certificado: Certificado }
  | { ok: false; error: string }

// Emite el certificado del alumno autenticado para "el" curso (getCourse(),
// igual que el resto de la app — sin soporte multi-curso todavía). Sin
// parámetros: no recibe nada del navegador, todo sale de la sesión
// server-side y de calcularFinalizacion(), nunca de lo que mande el
// cliente.
//
// Orden crítico, distinto de "revalidar siempre": un certificado ya
// emitido es un registro histórico inmutable — se busca ANTES de evaluar
// nada, y si existe se devuelve tal cual, sin recalcular finalización. Que
// el alumno desmarque un módulo o que cambien los requisitos del curso
// después no puede hacer "desaparecer" un certificado ya emitido. Recién
// si no existe se evalúa el estado ACTUAL contra calcularFinalizacion().
export async function emitirCertificado(): Promise<EmitirCertificadoResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, error: 'No autenticado.' }
  }

  const profile = await getProfile(supabase, user.id)
  if (!profile) {
    return { ok: false, error: 'Perfil no encontrado.' }
  }
  if (profile.rol !== 'alumno') {
    return { ok: false, error: 'Solo los alumnos pueden emitir certificados.' }
  }

  const course = getCourse()

  const { data: existente } = await supabase
    .from('certificados_emitidos')
    .select(CERTIFICADO_COLUMNAS)
    .eq('alumno_id', profile.id)
    .eq('curso_slug', course.slug)
    .maybeSingle()

  if (existente) {
    return { ok: true, certificado: existente as unknown as Certificado }
  }

  // Sin certificado previo: recién acá se evalúa el estado actual.
  const { data: progresoRows } = await supabase
    .from('progreso_modulos')
    .select('modulo_slug, completado, completado_at')
    .eq('alumno_id', profile.id)

  const { data: intentosRows } = await supabase
    .from('intentos_evaluacion')
    .select('modulo_slug, aprobado, created_at')
    .eq('alumno_id', profile.id)

  const progreso: ProgresoModuloFinalizacion[] = progresoRows ?? []
  const intentos: IntentoFinalizacion[] = intentosRows ?? []

  const estado = calcularFinalizacion(course.modulos, progreso, intentos)
  if (!estado.finalizado || !estado.fechaFinalizacion) {
    return { ok: false, error: 'Todavía no cumplís los requisitos para emitir el certificado.' }
  }

  const snapshot = construirSnapshotCertificado(profile, course, estado.fechaFinalizacion)

  // Única vía de escritura posible: la tabla no tiene ninguna policy de
  // INSERT para 'authenticated', así que esto requiere service_role.
  const admin = createAdminClient()
  const { data: nuevo, error } = await admin
    .from('certificados_emitidos')
    .insert(snapshot)
    .select(CERTIFICADO_COLUMNAS)
    .single()

  if (error) {
    // 23505 = unique_violation sobre un_certificado_por_alumno_y_curso:
    // otra request concurrente (doble clic, dos pestañas) insertó el
    // certificado un instante antes. No es un error real — se recupera
    // esa fila y se devuelve igual que si hubiera existido desde el
    // principio.
    if (error.code === '23505') {
      const { data: creadoPorOtraRequest } = await supabase
        .from('certificados_emitidos')
        .select(CERTIFICADO_COLUMNAS)
        .eq('alumno_id', profile.id)
        .eq('curso_slug', course.slug)
        .maybeSingle()

      if (creadoPorOtraRequest) {
        return { ok: true, certificado: creadoPorOtraRequest as unknown as Certificado }
      }
    }
    return { ok: false, error: 'No se pudo emitir el certificado. Intentá de nuevo.' }
  }

  return { ok: true, certificado: nuevo as unknown as Certificado }
}
