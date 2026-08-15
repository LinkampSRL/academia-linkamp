'use client'

import { useState, useTransition } from 'react'
import { marcarModuloCompletado } from '@/app/curso/actions'

interface BotonCompletarModuloProps {
  slug: string
  completadoInicial: boolean
}

// Toggle explícito de completado (Etapa C). El estado local se actualiza
// recién cuando la Server Action confirma, no antes — evita mostrar
// "completado" si la escritura llegara a fallar.
export default function BotonCompletarModulo({ slug, completadoInicial }: BotonCompletarModuloProps) {
  const [completado, setCompletado] = useState(completadoInicial)
  const [isPending, startTransition] = useTransition()

  function toggle() {
    const nuevoValor = !completado
    startTransition(async () => {
      await marcarModuloCompletado(slug, nuevoValor)
      setCompletado(nuevoValor)
    })
  }

  if (completado) {
    return (
      <div className="mt-16 flex items-center justify-between gap-4 bg-green-50 border border-green-100 rounded-xl px-6 py-5">
        <div>
          <p className="text-[13px] font-medium text-gray-900">✓ Módulo completado</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Podés desmarcarlo si todavía no terminaste.</p>
        </div>
        <button
          onClick={toggle}
          disabled={isPending}
          className="flex-shrink-0 bg-white hover:bg-gray-50 text-gray-600 text-[13px] font-medium px-4 py-2 rounded-lg border border-gray-200 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Guardando…' : 'Desmarcar'}
        </button>
      </div>
    )
  }

  return (
    <div className="mt-16 flex items-center justify-between gap-4 bg-gray-50 border border-gray-200 rounded-xl px-6 py-5">
      <div>
        <p className="text-[13px] font-medium text-gray-900">¿Terminaste este módulo?</p>
        <p className="text-[12px] text-gray-500 mt-0.5">
          Marcalo como completado para que tu progreso se refleje en el dashboard.
        </p>
      </div>
      <button
        onClick={toggle}
        disabled={isPending}
        className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        {isPending ? 'Guardando…' : 'Marcar como completado'}
      </button>
    </div>
  )
}
