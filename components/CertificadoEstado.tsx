'use client'

import { useState, useTransition } from 'react'
import { emitirCertificado } from '@/app/dashboard/certificado/actions'
import type { Certificado } from '@/lib/certificado'

interface CertificadoEstadoProps {
  finalizado: boolean
  certificadoInicial: Certificado | null
}

// Estado del certificado en el dashboard — independiente de la ternary
// verde/CTA que ya existe arriba. Si ya existe un certificado se muestra
// siempre, incluso si `finalizado` volvió a false después (el alumno
// desmarcó un módulo): un certificado ya emitido es un registro histórico,
// no depende del estado actual. Si no existe y el curso está finalizado,
// se ofrece generarlo. Si no existe y no está finalizado, no se muestra
// nada — el dashboard queda exactamente igual que hoy.
export default function CertificadoEstado({ finalizado, certificadoInicial }: CertificadoEstadoProps) {
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
      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col gap-1">
        <p className="text-[13px] font-medium text-gray-900">✓ Certificado emitido</p>
        <p className="text-[12px] text-gray-500">
          Emitido el {new Date(certificado.fecha_emision).toLocaleDateString('es-AR')}
        </p>
      </div>
    )
  }

  if (!finalizado) {
    return null
  }

  return (
    <div className="mt-4 flex flex-col items-start gap-2">
      {error && <p className="text-[12px] text-red-600">{error}</p>}
      <button
        onClick={handleGenerar}
        disabled={isPending}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-[13px] font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        {isPending ? 'Generando…' : 'Generar certificado'}
      </button>
    </div>
  )
}
