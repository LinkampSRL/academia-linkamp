// Lógica pura del sistema de evaluaciones — sin dependencias de Node (fs/path),
// para poder importarse tanto desde Server Components como desde el Client
// Component que corre la evaluación en el navegador.

export interface Pregunta {
  id: string
  enunciado: string
  opciones: string[]
  respuesta_correcta: number
}

export interface BancoPreguntas {
  modulo: string
  nota_minima_aprobacion: number
  preguntas_por_intento: number
  preguntas: Pregunta[]
}

export interface Respuesta {
  preguntaId: string
  opcionSeleccionada: number
}

export interface Resultado {
  moduloSlug: string
  preguntasIds: string[]
  respuestas: Respuesta[]
  puntaje: number
  aprobado: boolean
}

// Fisher-Yates: selecciona N preguntas al azar del banco, sin repetir dentro del mismo intento.
export function seleccionarAleatorias(preguntas: Pregunta[], cantidad: number): Pregunta[] {
  const barajadas = [...preguntas]
  for (let i = barajadas.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[barajadas[i], barajadas[j]] = [barajadas[j], barajadas[i]]
  }
  return barajadas.slice(0, Math.min(cantidad, barajadas.length))
}

export interface IntentoPrevio {
  puntaje: number
  aprobado: boolean
  created_at: string
}

export interface ResumenIntentos {
  cantidad: number
  mejorPuntaje: number
  ultimoPuntaje: number
  ultimoAprobado: boolean
}

// Etapa C del bloque "Persistencia de evaluaciones": resumen mínimo para
// mostrar antes de un nuevo intento. `null` si el alumno nunca rindió
// esta evaluación — nada que resumir.
export function calcularResumenIntentos(intentos: IntentoPrevio[]): ResumenIntentos | null {
  if (intentos.length === 0) return null

  const ultimo = [...intentos].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0]

  return {
    cantidad: intentos.length,
    mejorPuntaje: Math.max(...intentos.map((i) => i.puntaje)),
    ultimoPuntaje: ultimo.puntaje,
    ultimoAprobado: ultimo.aprobado,
  }
}

export function calcularResultado(
  moduloSlug: string,
  preguntasIntento: Pregunta[],
  respuestas: Respuesta[],
  notaMinima: number
): Resultado {
  const correctas = preguntasIntento.filter((pregunta) => {
    const respuesta = respuestas.find((r) => r.preguntaId === pregunta.id)
    return respuesta?.opcionSeleccionada === pregunta.respuesta_correcta
  }).length

  const puntaje = Math.round((correctas / preguntasIntento.length) * 100)

  return {
    moduloSlug,
    preguntasIds: preguntasIntento.map((p) => p.id),
    respuestas,
    puntaje,
    aprobado: puntaje >= notaMinima,
  }
}
