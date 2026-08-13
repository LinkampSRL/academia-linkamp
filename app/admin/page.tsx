import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/profile'
import {
  listarUsuarios,
  filtrarYOrdenarUsuarios,
  paginarUsuarios,
  type FiltrosUsuarios,
} from '@/lib/admin/usuarios'
import UsuarioFiltros from '@/components/admin/UsuarioFiltros'
import UsuariosTable from '@/components/admin/UsuariosTable'

type SearchParams = {
  q?: string
  rol?: string
  estado?: string
  vigencia?: string
  orden?: string
  page?: string
}

function construirHref(params: SearchParams, page: number): string {
  const usp = new URLSearchParams()
  if (params.q) usp.set('q', params.q)
  if (params.rol) usp.set('rol', params.rol)
  if (params.estado) usp.set('estado', params.estado)
  if (params.vigencia) usp.set('vigencia', params.vigencia)
  if (params.orden) usp.set('orden', params.orden)
  usp.set('page', String(page))
  return `/admin?${usp.toString()}`
}

// Etapa 1 del Sprint 5.4: listado de usuarios (solo lectura). Acciones
// (alta, edición, activar/desactivar, extender, reenviar acceso, eliminar)
// llegan en etapas siguientes.
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const profile = user ? await getProfile(supabase, user.id) : null

  // Re-chequeo de rol, además de la protección ya existente en proxy.ts.
  if (!profile || profile.rol !== 'admin') {
    redirect('/acceso-restringido?motivo=no_autorizado')
  }

  const params = await searchParams
  const filtros: FiltrosUsuarios = {
    q: params.q,
    rol: params.rol === 'admin' || params.rol === 'alumno' ? params.rol : undefined,
    estado: params.estado === 'activo' || params.estado === 'inactivo' ? params.estado : undefined,
    vigencia:
      params.vigencia === 'vigente' ||
      params.vigencia === 'proximo_a_vencer' ||
      params.vigencia === 'vencido'
        ? params.vigencia
        : undefined,
    orden: params.orden === 'fecha_inicio' || params.orden === 'fecha_vencimiento' ? params.orden : undefined,
  }

  const usuarios = await listarUsuarios()
  const filtrados = filtrarYOrdenarUsuarios(usuarios, filtros)
  const { items, total, totalPaginas, pagina } = paginarUsuarios(filtrados, Number(params.page) || 1)

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-12">
      <div className="flex items-start justify-between gap-4 mb-1">
        <h1 className="text-[22px] font-medium text-gray-900">Administración de usuarios</h1>
        <Link
          href="/admin/nuevo"
          className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo alumno
        </Link>
      </div>
      <p className="text-[13px] text-gray-500 mb-1">Gestioná los usuarios y sus accesos a la plataforma.</p>
      <p className="text-[13px] text-gray-500 mb-6">
        Mostrando {total} {total === 1 ? 'usuario' : 'usuarios'}.
      </p>

      <UsuarioFiltros />
      <UsuariosTable usuarios={items} />

      {totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-4 text-[12px] text-gray-500">
          <span>
            Página {pagina} de {totalPaginas}
          </span>
          <div className="flex gap-4">
            {pagina > 1 && (
              <Link href={construirHref(params, pagina - 1)} className="text-blue-600 hover:underline">
                Anterior
              </Link>
            )}
            {pagina < totalPaginas && (
              <Link href={construirHref(params, pagina + 1)} className="text-blue-600 hover:underline">
                Siguiente
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
