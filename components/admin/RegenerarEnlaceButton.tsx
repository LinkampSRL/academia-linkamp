'use client'

import { useState } from 'react'
import { regenerarEnlace } from '@/app/admin/actions'

export default function RegenerarEnlaceButton({ userId }: { userId: string }) {
  const [pending, setPending] = useState(false)
  const [link, setLink] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  async function generar() {
    setPending(true)
    setError(null)
    const result = await regenerarEnlace(userId)
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
        {pending ? 'Generando...' : 'Generar nuevo enlace'}
      </button>
      {error && <span className="text-[10px] text-red-600">{error}</span>}
    </div>
  )
}
