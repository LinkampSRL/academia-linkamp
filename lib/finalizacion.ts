import type { Modulo } from './course'

// Lógica pura (sin acceso a datos), mismo patrón que lib/progreso.ts y
// lib/evaluacion.ts. No depende de los tipos de esas tablas: recibe
// exactamente los campos que necesita, así el caller (dashboard, futuro
// certificado, futuro panel admin) arma el select que le convenga sin
// acoplarse a un tipo intermedio.

export interface ProgresoModuloFinalizacion {
  modulo_slug: string
  completado: boolean
  completado_at: string | null
}

export interface IntentoFinalizacion {
  modulo_slug: string
  aprobado: boolean
  created_at: string
}

export interface EstadoFinalizacion {
  finalizado: boolean
  modulos: { completados: number; total: number; pendientes: string[] }
  evaluaciones: { aprobadas: number; total: number; pendientes: string[] }
  fechaFinalizacion: string | null
}

// Curso finalizado = todos los módulos completados Y al menos un intento
// aprobado en cada evaluación obligatoria (todo módulo con
// tiene_evaluacion=true — hoy son los módulos 01-04, pero se deriva de
// curso.json, nunca de un rango fijo). Se calcula siempre dinámicamente
// contra el curso actual: no hay ningún booleano persistido que pueda
// desincronizarse si el curso cambia.
export function calcularFinalizacion(
  modulos: Modulo[],
  progreso: ProgresoModuloFinalizacion[],
  intentos: IntentoFinalizacion[]
): EstadoFinalizacion {
  const slugsValidos = new Set(modulos.map((m) => m.slug))
  const progresoValido = progreso.filter((p) => slugsValidos.has(p.modulo_slug))
  const intentosValidos = intentos.filter((i) => slugsValidos.has(i.modulo_slug))

  const totalModulos = modulos.length
  const completadosSlugs = new Set(
    progresoValido.filter((p) => p.completado).map((p) => p.modulo_slug)
  )
  const modulosPendientes = modulos.filter((m) => !completadosSlugs.has(m.slug)).map((m) => m.slug)

  const modulosConEvaluacion = modulos.filter((m) => m.tiene_evaluacion)
  const totalEvaluaciones = modulosConEvaluacion.length

  // Solo interesa el intento aprobado más antiguo por módulo: es el que
  // satisfizo el requisito por primera vez. Intentos no aprobados, o
  // aprobados posteriores al primero, no cambian nada.
  const primerAprobadoPorModulo = new Map<string, IntentoFinalizacion>()
  for (const intento of intentosValidos) {
    if (!intento.aprobado) continue
    const actual = primerAprobadoPorModulo.get(intento.modulo_slug)
    if (!actual || new Date(intento.created_at).getTime() < new Date(actual.created_at).getTime()) {
      primerAprobadoPorModulo.set(intento.modulo_slug, intento)
    }
  }

  const evaluacionesPendientes = modulosConEvaluacion
    .filter((m) => !primerAprobadoPorModulo.has(m.slug))
    .map((m) => m.slug)

  const requisitosCumplidos = modulosPendientes.length === 0 && evaluacionesPendientes.length === 0

  // Contrato: finalizado=true exige una fechaFinalizacion real. Si los
  // booleanos dicen que todo está cumplido pero falta (o es inválida) la
  // fecha que sustenta algún requisito, el estado se trata como
  // inconsistente y NO se reporta finalizado — nunca finalizado=true con
  // fechaFinalizacion=null. No se intenta recuperar el dato, solo evitar
  // devolver una finalización que no se puede fechar.
  let fechaFinalizacion: string | null = null
  let datosConsistentes = true

  if (requisitosCumplidos) {
    const fechas: number[] = []

    for (const m of modulos) {
      const fila = progresoValido.find((p) => p.modulo_slug === m.slug && p.completado)
      const fecha = fila?.completado_at ? new Date(fila.completado_at).getTime() : NaN
      if (!fila || Number.isNaN(fecha)) {
        datosConsistentes = false
        break
      }
      fechas.push(fecha)
    }

    if (datosConsistentes) {
      for (const m of modulosConEvaluacion) {
        const intento = primerAprobadoPorModulo.get(m.slug)
        const fecha = intento?.created_at ? new Date(intento.created_at).getTime() : NaN
        if (!intento || Number.isNaN(fecha)) {
          datosConsistentes = false
          break
        }
        fechas.push(fecha)
      }
    }

    // fechas.length === 0 solo puede pasar con un curso sin módulos ni
    // evaluaciones (caso vacío, no real hoy) — tratarlo también como no
    // finalizable en vez de una finalización vacía sin fecha.
    if (datosConsistentes && fechas.length > 0) {
      fechaFinalizacion = new Date(Math.max(...fechas)).toISOString()
    } else {
      datosConsistentes = false
    }
  }

  const finalizado = requisitosCumplidos && datosConsistentes

  return {
    finalizado,
    modulos: {
      completados: totalModulos - modulosPendientes.length,
      total: totalModulos,
      pendientes: modulosPendientes,
    },
    evaluaciones: {
      aprobadas: totalEvaluaciones - evaluacionesPendientes.length,
      total: totalEvaluaciones,
      pendientes: evaluacionesPendientes,
    },
    fechaFinalizacion,
  }
}
