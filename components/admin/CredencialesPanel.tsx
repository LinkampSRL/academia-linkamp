'use client'

import { useState, type ReactNode } from 'react'
import type { CredencialesTemporales } from '@/lib/admin/usuarios'

function mensajeParaWhatsApp(nombre: string | null, c: CredencialesTemporales): string {
  const saludo = nombre ? `Hola ${nombre}, ya` : 'Hola, ya'
  return [
    `${saludo} está listo tu acceso a Academia Linkamp.`,
    '',
    `Ingresá desde: ${c.loginUrl}`,
    `Email: ${c.email}`,
    `Contraseña temporal: ${c.password}`,
    '',
    'La primera vez que ingreses, el sistema te va a pedir que definas tu propia contraseña.',
  ].join('\n')
}

// Muestra las credenciales temporales UNA SOLA VEZ: viven únicamente en el
// estado del componente que las recibe como respuesta de la Server Action
// (no se guardan en ningún lado ni se vuelven a pedir al servidor). Al
// cerrar o salir de la pantalla no hay forma de volver a verlas — si se
// pierden, se regenera el acceso.
export default function CredencialesPanel({
  titulo,
  nombre,
  credenciales,
  children,
}: {
  titulo: string
  nombre: string | null
  credenciales: CredencialesTemporales
  children?: ReactNode
}) {
  const [copiado, setCopiado] = useState<'mensaje' | 'password' | null>(null)

  async function copiar(que: 'mensaje' | 'password') {
    const texto = que === 'mensaje' ? mensajeParaWhatsApp(nombre, credenciales) : credenciales.password
    await navigator.clipboard.writeText(texto)
    setCopiado(que)
    setTimeout(() => setCopiado(null), 2000)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-4 max-w-lg">
      <p className="text-[13px] text-gray-900 font-medium">{titulo}</p>

      <p className="text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        Esta contraseña se muestra <strong>una sola vez</strong>: no se guarda y no se puede volver a ver. Si
        se pierde, usá “Regenerar acceso”. El alumno va a tener que definir la suya al primer ingreso.
      </p>

      <dl className="flex flex-col gap-2 text-[12px]">
        <div className="flex flex-col gap-0.5">
          <dt className="text-gray-400 uppercase tracking-wider text-[10px]">Enlace de ingreso</dt>
          <dd className="text-gray-700 break-all">{credenciales.loginUrl}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-gray-400 uppercase tracking-wider text-[10px]">Email</dt>
          <dd className="text-gray-700 break-all">{credenciales.email}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-gray-400 uppercase tracking-wider text-[10px]">Contraseña temporal</dt>
          <dd className="text-[15px] font-mono font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 select-all">
            {credenciales.password}
          </dd>
        </div>
      </dl>

      <p className="text-[11px] text-gray-400">
        Recomendado: mandá la contraseña en un mensaje aparte del enlace.
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => copiar('mensaje')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {copiado === 'mensaje' ? 'Copiado ✓' : 'Copiar mensaje completo'}
        </button>
        <button
          type="button"
          onClick={() => copiar('password')}
          className="text-[13px] text-blue-600 hover:underline"
        >
          {copiado === 'password' ? 'Copiado ✓' : 'Copiar solo la contraseña'}
        </button>
        {children}
      </div>
    </div>
  )
}
