'use client'

import { useState, useTransition } from 'react'
import { emitirCertificado } from '@/app/dashboard/certificado/actions'
import type { Certificado } from '@/lib/certificado'

interface CertificadoEstadoProps {
  finalizado: boolean
  fechaFinalizacion: string | null
  certificadoInicial: Certificado | null
}

// Único bloque para todo lo relacionado a "terminé el curso, ¿y ahora
// qué?" — antes el cartel de felicitaciones vivía en app/dashboard/page.tsx
// y el botón de generar certificado acá, como dos bloques separados sin
// relación visual entre sí (el alumno veía "¡Felicitaciones!" sin ningún
// indicio de que más abajo había una acción pendiente). Mismas reglas de
// datos que antes, sin tocarlas: si ya existe un certificado se muestra
// siempre, incluso si `finalizado` volvió a false después (el alumno
// desmarcó un módulo) — es un registro histórico. Si no existe y el curso
// está finalizado, se ofrece generarlo dentro del mismo cartel de
// felicitaciones. Si no existe y no está finalizado, no se muestra nada.
export default function CertificadoEstado({
  finalizado,
  fechaFinalizacion,
  certificadoInicial,
}: CertificadoEstadoProps) {
  const [certificado, setCertificado] = useState(certificadoInicial)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleGenerar() {
    setError(null)
    startTransition(async () => {
      const resultado = await emitirCertificado()
      if (!resultado.ok) {
        setError(resultado.error)
        return
      }
      setCertificado(resultado.certificado)
    })
  }

  if (certificado) {
    return (
      <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[14px] font-medium text-green-800">✓ Certificado emitido</p>
          <p className="text-[12px] text-green-700">
            Emitido el {new Date(certificado.fecha_emision).toLocaleDateString('es-AR')}
          </p>
        </div>
        <a
          href="/dashboard/certificado/descargar"
          className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Descargar certificado
        </a>
      </div>
    )
  }

  if (!finalizado || !fechaFinalizacion) {
    return null
  }

  return (
    <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="text-[14px] font-medium text-green-800">🎉 ¡Felicitaciones! Completaste el curso.</p>
        <p className="text-[12px] text-green-700">Completaste todos los módulos y evaluaciones.</p>
        <p className="text-[12px] text-green-700">Tu certificado está listo para generar.</p>
        <p className="text-[11px] text-green-600/80">
          Finalizado el {new Date(fechaFinalizacion).toLocaleDateString('es-AR')}
        </p>
      </div>

      {error && <p className="text-[12px] text-red-600">{error}</p>}

      <button
        onClick={handleGenerar}
        disabled={isPending}
        className="self-start bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-[13px] font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        {isPending ? 'Generando…' : 'Generar certificado'}
      </button>
    </div>
  )
}
