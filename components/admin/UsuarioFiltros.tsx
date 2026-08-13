'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, type FormEvent } from 'react'

const selectClass =
  'px-3 py-2 text-[13px] border border-gray-200 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500'

export default function UsuarioFiltros() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [q, setQ] = useState(searchParams.get('q') ?? '')

  function actualizar(clave: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (valor) params.set(clave, valor)
    else params.delete(clave)
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  function onSubmitBusqueda(e: FormEvent) {
    e.preventDefault()
    actualizar('q', q)
  }

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <form onSubmit={onSubmitBusqueda} className="flex-1 min-w-[220px]">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, apellido, email o empresa..."
          className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
        />
      </form>

      <select
        defaultValue={searchParams.get('rol') ?? ''}
        onChange={(e) => actualizar('rol', e.target.value)}
        className={selectClass}
      >
        <option value="">Todos los roles</option>
        <option value="admin">Admin</option>
        <option value="alumno">Alumno</option>
      </select>

      <select
        defaultValue={searchParams.get('estado') ?? ''}
        onChange={(e) => actualizar('estado', e.target.value)}
        className={selectClass}
      >
        <option value="">Todos los estados</option>
        <option value="activo">Activo</option>
        <option value="inactivo">Desactivado</option>
      </select>

      <select
        defaultValue={searchParams.get('vigencia') ?? ''}
        onChange={(e) => actualizar('vigencia', e.target.value)}
        className={selectClass}
      >
        <option value="">Toda vigencia</option>
        <option value="vigente">🟢 Vigente</option>
        <option value="proximo_a_vencer">🟡 Próximo a vencer</option>
        <option value="vencido">🔴 Vencido</option>
      </select>

      <select
        defaultValue={searchParams.get('orden') ?? ''}
        onChange={(e) => actualizar('orden', e.target.value)}
        className={selectClass}
      >
        <option value="">Sin ordenar</option>
        <option value="fecha_inicio">Ordenar por fecha de alta</option>
        <option value="fecha_vencimiento">Ordenar por vencimiento</option>
      </select>
    </div>
  )
}
