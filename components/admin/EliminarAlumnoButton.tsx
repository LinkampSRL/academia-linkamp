'use client'

import { useState } from 'react'
import { eliminarAlumnoAction } from '@/app/admin/actions'

export default function EliminarAlumnoButton({
  id,
  nombreCompleto,
}: {
  id: string
  nombreCompleto: string
}) {
  const [confirmando, setConfirmando] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function confirmar() {
    setPending(true)
    setError(null)
    const result = await eliminarAlumnoAction(id)
    // Si eliminarAlumnoAction tuvo éxito, ya redirigió server-side y este
    // componente se desmonta — solo llegamos acá si hubo error.
    setPending(false)
    if (result?.error) {
      setError(result.error)
    }
  }

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="text-[12px] text-red-600 hover:underline"
      >
        Eliminar alumno
      </button>
    )
  }

  return (
    <div className="border border-red-200 bg-red-50 rounded-lg p-4 flex flex-col gap-3 max-w-lg">
      <p className="text-[13px] text-red-700">
        ¿Eliminar a <strong>{nombreCompleto}</strong>? Esta acción no se puede deshacer — se borra su cuenta
        y su acceso por completo.
      </p>

      {error && <p className="text-[12px] text-red-600">{error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={confirmar}
          disabled={pending}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {pending ? 'Eliminando...' : 'Sí, eliminar'}
        </button>
        <button
          type="button"
          onClick={() => {
            setConfirmando(false)
            setError(null)
          }}
          disabled={pending}
          className="text-[13px] text-gray-500 hover:text-gray-700"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
