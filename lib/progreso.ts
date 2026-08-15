import type { Modulo } from './course'

export type EstadoModulo = 'por_empezar' | 'en_curso' | 'completado'

export interface ProgresoModulo {
  modulo_slug: string
  visitado_at: string | null
  completado: boolean
}

// Lógica pura (sin acceso a datos), reutilizable donde haga falta —
// mismo patrón que lib/evaluacion.ts. Todas las funciones acotan el
// cálculo a los slugs reales de `curso.json`: una fila de progreso con
// un slug que ya no exista en el curso no cuenta para nada de esto.

export function calcularEstadoModulo(
  modulo: Modulo,
  progreso: ProgresoModulo[]
): EstadoModulo {
  const fila = progreso.find((p) => p.modulo_slug === modulo.slug)
  if (!fila) return 'por_empezar'
  return fila.completado ? 'completado' : 'en_curso'
}

export function calcularProgresoGeneral(modulos: Modulo[], progreso: ProgresoModulo[]) {
  const slugsValidos = new Set(modulos.map((m) => m.slug))
  const completados = progreso.filter((p) => slugsValidos.has(p.modulo_slug) && p.completado).length
  const total = modulos.length
  return {
    completados,
    total,
    porcentaje: total > 0 ? Math.round((completados / total) * 100) : 0,
  }
}

// Módulo con el visitado_at más reciente — "continuar donde lo dejaste",
// independiente del orden del curso. null si nunca visitó nada.
export function obtenerUltimoModuloVisitado(modulos: Modulo[], progreso: ProgresoModulo[]): string | null {
  const slugsValidos = new Set(modulos.map((m) => m.slug))
  const visitados = progreso.filter(
    (p): p is ProgresoModulo & { visitado_at: string } => slugsValidos.has(p.modulo_slug) && p.visitado_at !== null
  )
  if (visitados.length === 0) return null

  const ultimo = visitados.reduce((masReciente, actual) =>
    new Date(actual.visitado_at).getTime() > new Date(masReciente.visitado_at).getTime() ? actual : masReciente
  )
  return ultimo.modulo_slug
}
