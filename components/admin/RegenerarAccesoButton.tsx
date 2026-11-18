'use client'

import { useState } from 'react'
import type { RegenerarAccesoState } from '@/app/admin/actions'
import type { CredencialesTemporales } from '@/lib/admin/usuarios'
import CredencialesPanel from '@/components/admin/CredencialesPanel'

// "Regenerar acceso": reemplaza la contraseña del alumno por una temporal
// nueva y le vuelve a exigir el cambio. Como invalida la contraseña actual
// de alguien que puede estar usando el curso, pide una confirmación
// explícita antes de ejecutar.
export default function RegenerarAccesoButton({
  userId,
  nombre,
  accion,
}: {
  userId: string
  nombre: string
  accion: (userId: string) => Promise<RegenerarAccesoState>
}) {
  const [confirmando, setConfirmando] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [credenciales, setCredenciales] = useState<CredencialesTemporales | null>(null)

  async function regenerar() {
    setPending(true)
    setError(null)
    const resultado = await accion(userId)
    setPending(false)
    setConfirmando(false)

    if (resultado.error || !resultado.credenciales) {
      setError(resultado.error ?? 'No se pudo regenerar el acceso.')
      return
    }
    setCredenciales(resultado.credenciales)
  }

  if (credenciales) {
    return (
      <CredencialesPanel titulo="Acceso regenerado." nombre={nombre} credenciales={credenciales}>
        <button
          type="button"
          onClick={() => setCredenciales(null)}
          className="text-[12px] text-gray-400 hover:text-gray-600"
        >
          Cerrar
        </button>
      </CredencialesPanel>
    )
  }

  if (confirmando) {
    return (
      <div className="flex flex-col gap-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-[12px] text-gray-700">
          Esto <strong>reemplaza la contraseña actual</strong> de {nombre} por una temporal y le va a
          pedir definir una nueva la próxima vez que ingrese. Si tiene el curso abierto, también se lo va
          a pedir. ¿Continuar?
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={regenerar}
            disabled={pending}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {pending ? 'Regenerando...' : 'Sí, regenerar acceso'}
          </button>
          <button
            type="button"
            onClick={() => setConfirmando(false)}
            disabled={pending}
            className="text-[12px] text-gray-500 hover:text-gray-700"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="self-start text-[13px] text-blue-600 hover:underline"
      >
        Regenerar acceso (contraseña temporal)
      </button>
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </div>
  )
}
