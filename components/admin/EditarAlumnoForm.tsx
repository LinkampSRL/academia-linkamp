'use client'

import { useActionState } from 'react'
import { actualizarAlumnoAction, type EditarAlumnoState } from '@/app/admin/actions'
import type { Usuario } from '@/lib/admin/usuarios'

const initialState: EditarAlumnoState = { error: null }

const inputClass =
  'w-full px-3 py-2 text-[14px] text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500'

function comoFechaISO(fecha: string | null): string {
  return fecha ? fecha.slice(0, 10) : ''
}

export default function EditarAlumnoForm({ alumno }: { alumno: Usuario }) {
  const actualizarConId = actualizarAlumnoAction.bind(null, alumno.id)
  const [state, formAction, pending] = useActionState(actualizarConId, initialState)

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
          <input
            id="nombre"
            name="nombre"
            type="text"
            required
            defaultValue={alumno.nombre}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="apellido" className="text-[12px] font-medium text-gray-700">
            Apellido
          </label>
          <input
            id="apellido"
            name="apellido"
            type="text"
            required
            defaultValue={alumno.apellido}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="empresa" className="text-[12px] font-medium text-gray-700">
          Empresa
        </label>
        <input id="empresa" name="empresa" type="text" defaultValue={alumno.empresa} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] font-medium text-gray-700">Email</span>
        <p className="text-[13px] text-gray-500 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
          {alumno.email ?? '—'} <span className="text-gray-400">(no editable acá)</span>
        </p>
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
            defaultValue={comoFechaISO(alumno.fecha_inicio)}
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
            defaultValue={comoFechaISO(alumno.fecha_vencimiento)}
            className={inputClass}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-[13px] text-gray-700">
        <input type="checkbox" name="activo" defaultChecked={alumno.activo} className="rounded border-gray-300" />
        Activo
      </label>

      {state.error && <p className="text-[12px] text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-[13px] font-medium px-4 py-2.5 rounded-lg transition-colors"
      >
        {pending ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
