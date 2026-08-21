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

// Vista pública de una pregunta — sin `respuesta_correcta`, con `opciones` ya
// barajadas para este intento. Es lo único que puede cruzar al navegador.
export interface PreguntaPublica {
  id: string
  enunciado: string
  opciones: string[]
}

// El cliente nunca conoce el índice "correcto" de nada (ni el original ni el
// de su propio orden barajado), así que identifica su respuesta por el texto
// literal de la opción elegida. La corrección server-side compara ese texto
// contra `opciones[respuesta_correcta]` del banco real — ver
// registrarIntentoEvaluacion en app/curso/actions.ts.
export interface Respuesta {
  preguntaId: string
  opcionSeleccionada: string
}

// Fisher-Yates genérico, reutilizado tanto para elegir qué preguntas entran
// al intento como para barajar el orden de las opciones de cada una.
function barajar<T>(items: T[]): T[] {
  const copia = [...items]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

// Selecciona N preguntas al azar del banco, sin repetir dentro del mismo intento.
export function seleccionarAleatorias(preguntas: Pregunta[], cantidad: number): Pregunta[] {
  return barajar(preguntas).slice(0, Math.min(cantidad, preguntas.length))
}

// Server-only en la práctica (solo se debe llamar donde ya se tiene el banco
// real): quita `respuesta_correcta` y baraja el orden de `opciones` de cada
// pregunta antes de que el resultado cruce al Client Component. El mismo
// barajado se repite en cada intento (incluido "Reintentar"), así que el
// índice de la opción correcta nunca es estable entre intentos.
export function ocultarRespuestas(preguntas: Pregunta[]): PreguntaPublica[] {
  return preguntas.map((pregunta) => ({
    id: pregunta.id,
    enunciado: pregunta.enunciado,
    opciones: barajar(pregunta.opciones),
  }))
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
