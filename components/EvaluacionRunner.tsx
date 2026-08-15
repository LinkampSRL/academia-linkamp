'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  seleccionarAleatorias,
  type BancoPreguntas,
  type Respuesta,
  type ResumenIntentos,
} from '@/lib/evaluacion'
import type { Modulo } from '@/lib/course'
import { registrarIntentoEvaluacion, type ResultadoIntento } from '@/app/curso/actions'

interface EvaluacionRunnerProps {
  banco: BancoPreguntas
  moduloSlug: string
  moduloOrden: number
  moduloTitulo: string
  modulos: Modulo[]
  resumenIntentos: ResumenIntentos | null
}

type Fase = 'en-progreso' | 'resultado'

export default function EvaluacionRunner({
  banco,
  moduloSlug,
  moduloOrden,
  moduloTitulo,
  modulos,
  resumenIntentos,
}: EvaluacionRunnerProps) {
  const [preguntasIntento, setPreguntasIntento] = useState(() =>
    seleccionarAleatorias(banco.preguntas, banco.preguntas_por_intento)
  )
  const [respuestas, setRespuestas] = useState<Record<string, number>>({})
  const [fase, setFase] = useState<Fase>('en-progreso')
  const [resultado, setResultado] = useState<ResultadoIntento | null>(null)
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const todasContestadas = preguntasIntento.every((p) => respuestas[p.id] !== undefined)

  function handleSeleccionar(preguntaId: string, opcionIndex: number) {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: opcionIndex }))
  }

  function handleEnviar() {
    const respuestasArray: Respuesta[] = preguntasIntento.map((p) => ({
      preguntaId: p.id,
      opcionSeleccionada: respuestas[p.id],
    }))

    setErrorEnvio(null)
    startTransition(async () => {
      const registro = await registrarIntentoEvaluacion(moduloSlug, respuestasArray)
      if (!registro.ok) {
        setErrorEnvio(registro.error)
        return
      }
      setResultado(registro.resultado)
      setFase('resultado')
    })
  }

  function handleReintentar() {
    setPreguntasIntento(seleccionarAleatorias(banco.preguntas, banco.preguntas_por_intento))
    setRespuestas({})
    setResultado(null)
    setErrorEnvio(null)
    setFase('en-progreso')
  }

  const moduloLabel = `Módulo ${String(moduloOrden).padStart(2, '0')}`

  // Orden y "siguiente módulo" derivados dinámicamente de curso.json — nada hardcodeado.
  const modulosOrdenados = [...modulos].sort((a, b) => a.orden - b.orden)
  const modulosConEvaluacion = modulosOrdenados.filter((m) => m.tiene_evaluacion)
  const ultimoModuloConEvaluacion = modulosConEvaluacion[modulosConEvaluacion.length - 1]
  const esUltimoModuloConEvaluacion = ultimoModuloConEvaluacion?.slug === moduloSlug
  const siguienteModulo = modulosOrdenados.find((m) => m.orden === moduloOrden + 1) ?? null

  if (fase === 'resultado' && resultado) {
    return (
      <div className="text-center py-10">
        <div
          className={[
            'inline-flex items-center gap-2 text-[13px] font-medium px-4 py-1.5 rounded-full border mb-6',
            resultado.aprobado
              ? 'bg-green-50 text-green-700 border-green-100'
              : 'bg-amber-50 text-amber-700 border-amber-100',
          ].join(' ')}
        >
          <span
            className={[
              'w-1.5 h-1.5 rounded-full',
              resultado.aprobado ? 'bg-green-500' : 'bg-amber-500',
            ].join(' ')}
          />
          {resultado.aprobado ? 'Aprobado' : 'No aprobado'}
        </div>

        <p className="text-[28px] font-medium text-gray-900 mb-2">{resultado.puntaje}%</p>

        <p className="text-[14px] text-gray-600 max-w-[480px] mx-auto leading-relaxed mb-10">
          {resultado.aprobado
            ? `¡Felicitaciones! Has aprobado la evaluación del ${moduloLabel} con ${resultado.puntaje}%. Ya podés continuar con el siguiente módulo.`
            : 'No alcanzaste el puntaje mínimo. Podés volver a intentarlo.'}
        </p>

        {resultado.aprobado && esUltimoModuloConEvaluacion && (
          <div className="mb-8">
            <p className="text-[14px] font-medium text-gray-900 mb-4 max-w-[480px] mx-auto leading-relaxed">
              🎉 ¡Felicitaciones! Completaste todas las evaluaciones disponibles del curso.
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Volver al curso
            </Link>
          </div>
        )}

        {resultado.aprobado && !esUltimoModuloConEvaluacion && siguienteModulo && (
          <div className="mb-8">
            <Link
              href={`/curso/${siguienteModulo.slug}`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              ➡️ Continuar al siguiente módulo
            </Link>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={handleReintentar}
            className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Reintentar
          </button>
          <Link
            href={`/curso/${moduloSlug}`}
            className="border border-gray-200 hover:border-gray-300 text-gray-600 text-[13px] font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Volver al módulo
          </Link>
          <Link
            href="/"
            className="border border-gray-200 hover:border-gray-300 text-gray-600 text-[13px] font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Volver al curso
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-[11px] font-medium text-blue-600 uppercase tracking-wider mb-1">
          Evaluación — {moduloLabel}
        </p>
        <h1 className="text-[22px] font-medium text-gray-900">{moduloTitulo}</h1>
        <p className="text-[13px] text-gray-500 mt-1">
          Respondé las {preguntasIntento.length} preguntas. Necesitás {banco.nota_minima_aprobacion}% para aprobar.
        </p>
      </div>

      {resumenIntentos && (
        <div className="mb-8 bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 flex flex-wrap gap-x-8 gap-y-2 text-[13px]">
          <div>
            <span className="text-gray-500">Intentos previos: </span>
            <span className="font-medium text-gray-900">{resumenIntentos.cantidad}</span>
          </div>
          <div>
            <span className="text-gray-500">Mejor resultado: </span>
            <span className="font-medium text-gray-900">{resumenIntentos.mejorPuntaje}%</span>
          </div>
          <div>
            <span className="text-gray-500">Último resultado: </span>
            <span className="font-medium text-gray-900">
              {resumenIntentos.ultimoPuntaje}% ({resumenIntentos.ultimoAprobado ? 'aprobado' : 'no aprobado'})
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {preguntasIntento.map((pregunta, index) => (
          <div key={pregunta.id} className="border border-gray-200 rounded-xl p-5">
            <p className="text-[14px] font-medium text-gray-900 mb-4">
              {index + 1}. {pregunta.enunciado}
            </p>
            <div className="flex flex-col gap-2">
              {pregunta.opciones.map((opcion, opcionIndex) => (
                <label
                  key={opcionIndex}
                  className={[
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg border text-[13px] cursor-pointer transition-colors',
                    respuestas[pregunta.id] === opcionIndex
                      ? 'border-blue-500 bg-blue-50/50 text-gray-900'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name={pregunta.id}
                    checked={respuestas[pregunta.id] === opcionIndex}
                    onChange={() => handleSeleccionar(pregunta.id, opcionIndex)}
                    className="accent-blue-600"
                  />
                  {opcion}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-end gap-2 mt-8">
        {errorEnvio && <p className="text-[12px] text-red-600">{errorEnvio}</p>}
        <button
          onClick={handleEnviar}
          disabled={!todasContestadas || isPending}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-[13px] font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          {isPending ? 'Enviando…' : 'Enviar respuestas'}
        </button>
      </div>
    </div>
  )
}
