'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { altaAlumno, type AltaAlumnoState } from '@/app/admin/actions'

const initialState: AltaAlumnoState = { error: null, link: null }

const inputClass =
  'w-full px-3 py-2 text-[14px] text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500'

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function en30DiasISO(): string {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 10)
}

export default function AltaAlumnoForm() {
  const [state, formAction, pending] = useActionState(altaAlumno, initialState)
  const [copiado, setCopiado] = useState(false)

  async function copiarEnlace() {
    if (!state.link) return
    await navigator.clipboard.writeText(state.link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  if (state.link) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-4 max-w-lg">
        <p className="text-[13px] text-gray-900 font-medium">Alumno creado.</p>
        <p className="text-[12px] text-gray-500">
          Copiá este enlace y mandalo vos manualmente por email (por ejemplo desde{' '}
          <strong>info@linkampgroup.com</strong>). Es de un solo uso y no se va a volver a mostrar — si se
          pierde o vence, generá uno nuevo desde el listado.
        </p>

        <div className="text-[12px] text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 break-all">
          {state.link}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={copiarEnlace}
            className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {copiado ? 'Copiado ✓' : 'Copiar enlace'}
          </button>
          <Link href="/admin" className="text-[12px] text-gray-500 hover:text-gray-700">
            Volver al listado
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form
      action={formAction}
      className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-4 max-w-lg"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nombre" className="text-[12px] font-medium text-gray-700">
            Nombre
          </label>
          <input id="nombre" name="nombre" type="text" required className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="apellido" className="text-[12px] font-medium text-gray-700">
            Apellido
          </label>
          <input id="apellido" name="apellido" type="text" required className={inputClass} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="empresa" className="text-[12px] font-medium text-gray-700">
          Empresa
        </label>
        <input id="empresa" name="empresa" type="text" className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-[12px] font-medium text-gray-700">
          Email
        </label>
        <input id="email" name="email" type="email" required className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fecha_inicio" className="text-[12px] font-medium text-gray-700">
            Fecha de inicio
          </label>
          <input
            id="fecha_inicio"
            name="fecha_inicio"
            type="date"
            required
            defaultValue={hoyISO()}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fecha_vencimiento" className="text-[12px] font-medium text-gray-700">
            Fecha de vencimiento
          </label>
          <input
            id="fecha_vencimiento"
            name="fecha_vencimiento"
            type="date"
            required
            defaultValue={en30DiasISO()}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-[13px] text-gray-700">
        <input type="checkbox" name="activo" defaultChecked className="rounded border-gray-300" />
        Activo
      </label>

      {state.error && <p className="text-[12px] text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-[13px] font-medium px-4 py-2.5 rounded-lg transition-colors"
      >
        {pending ? 'Creando...' : 'Crear alumno'}
      </button>
    </form>
  )
}
