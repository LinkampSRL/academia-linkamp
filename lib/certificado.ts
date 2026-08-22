import type { Curso } from './course'
import type { Profile } from './profile'

// Lógica pura (sin acceso a datos), mismo patrón que lib/finalizacion.ts y
// lib/progreso.ts.

export interface SnapshotCertificado {
  alumno_id: string
  curso_slug: string
  curso_titulo: string
  curso_version: string
  carga_horaria_horas: number
  nombre_completo: string
  fecha_finalizacion: string
}

// Congela en un objeto plano todo lo que necesita el certificado en el
// momento de emitir — ninguno de estos valores se vuelve a leer desde
// `profiles` ni `curso.json` después del insert. `alumno_id` sale de
// `profile.id`, no de un parámetro aparte: el caller ya tiene el profile
// completo, no hace falta pasarlo dos veces. `emisor` y `fecha_emision`
// no van acá — tienen `default` en la tabla, una sola fuente de verdad
// para esos dos campos constantes.
export function construirSnapshotCertificado(
  profile: Profile,
  course: Curso,
  fechaFinalizacion: string
): SnapshotCertificado {
  return {
    alumno_id: profile.id,
    curso_slug: course.slug,
    curso_titulo: course.titulo,
    curso_version: course.version,
    carga_horaria_horas: course.carga_horaria_horas,
    nombre_completo: `${profile.nombre} ${profile.apellido}`.trim(),
    fecha_finalizacion: fechaFinalizacion,
  }
}

// Forma de un certificado ya emitido, tal como se lee de vuelta de
// `certificados_emitidos`. Vive acá (no en app/dashboard/certificado/
// actions.ts) porque ese archivo es 'use server' — solo puede exportar
// funciones async, no tipos con valor en runtime como CERTIFICADO_COLUMNAS
// — y porque tanto la Server Action de emisión como el Server Component
// del dashboard necesitan el mismo tipo y el mismo set de columnas, sin
// mantener dos listas a mano por separado.
export interface Certificado {
  id: string
  curso_slug: string
  curso_titulo: string
  curso_version: string
  carga_horaria_horas: number
  nombre_completo: string
  emisor: string
  fecha_finalizacion: string
  fecha_emision: string
}

export const CERTIFICADO_COLUMNAS =
  'id, curso_slug, curso_titulo, curso_version, carga_horaria_horas, nombre_completo, emisor, fecha_finalizacion, fecha_emision'
