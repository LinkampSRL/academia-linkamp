'use client'

import { useState } from 'react'

type ResultadoEnlace = { error: string | null; link: string | null }

// Genérico: sirve tanto para "Generar nuevo enlace" (invitación
// pendiente) como para "Generar enlace de recuperación" (alumno ya
// activado) — misma UI de generar → mostrar una sola vez → copiar,
// solo cambia qué Server Action se llama y el texto del botón.
export default function RegenerarEnlaceButton({
  userId,
  accion,
  etiqueta,
  etiquetaGenerando = 'Generando...',
}: {
  userId: string
  accion: (userId: string) => Promise<ResultadoEnlace>
  etiqueta: string
  etiquetaGenerando?: string
}) {
  const [pending, setPending] = useState(false)
  const [link, setLink] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  async function generar() {
    setPending(true)
    setError(null)
    const result = await accion(userId)
    setPending(false)

    if (result.error) {
      setError(result.error)
      return
    }
    setLink(result.link)
  }

  async function copiar() {
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  if (link) {
    return (
      <div className="flex flex-col gap-1 max-w-[220px]">
        <div className="text-[10px] text-gray-500 break-all bg-gray-50 border border-gray-200 rounded px-1.5 py-1">
          {link}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={copiar} className="text-[11px] text-blue-600 hover:underline">
            {copiado ? 'Copiado ✓' : 'Copiar'}
          </button>
          <button
            type="button"
            onClick={() => setLink(null)}
            className="text-[11px] text-gray-400 hover:text-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={generar}
        disabled={pending}
        className="text-[11px] text-blue-600 hover:underline disabled:opacity-50 text-left"
      >
        {pending ? etiquetaGenerando : etiqueta}
      </button>
      {error && <span className="text-[10px] text-red-600">{error}</span>}
    </div>
  )
}
