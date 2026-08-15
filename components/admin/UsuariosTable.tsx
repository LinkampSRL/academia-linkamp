import Link from 'next/link'
import { calcularVigencia, type Usuario } from '@/lib/admin/usuarios'
import { regenerarEnlace } from '@/app/admin/actions'
import RegenerarEnlaceButton from '@/components/admin/RegenerarEnlaceButton'

function formatFecha(fecha: string | null): string {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-AR')
}

function formatFechaHora(fecha: string | null): string {
  if (!fecha) return '—'
  const d = new Date(fecha)
  const fechaStr = d.toLocaleDateString('es-AR')
  const horaStr = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${fechaStr} ${horaStr}`
}

function VigenciaBadge({ usuario }: { usuario: Usuario }) {
  if (usuario.rol === 'admin') {
    return <span className="text-gray-300">—</span>
  }

  const vigencia = calcularVigencia(usuario.fecha_vencimiento)
  if (vigencia === 'vencido') return <span title="Vencido">🔴</span>
  if (vigencia === 'proximo_a_vencer') return <span title="Próximo a vencer (menos de 15 días)">🟡</span>
  return <span title="Vigente">🟢</span>
}

export default function UsuariosTable({ usuarios }: { usuarios: Usuario[] }) {
  if (usuarios.length === 0) {
    return (
      <div className="text-center py-16 text-[13px] text-gray-400 border border-gray-200 rounded-xl">
        No se encontraron usuarios con esos filtros.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-xl">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-left text-[11px] text-gray-500 uppercase tracking-wider">
            <th className="px-4 py-3 font-medium">Nombre</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Empresa</th>
            <th className="px-4 py-3 font-medium">Rol</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Vigencia</th>
            <th className="px-4 py-3 font-medium">Inicio</th>
            <th className="px-4 py-3 font-medium">Vencimiento</th>
            <th className="px-4 py-3 font-medium">Último acceso</th>
            <th className="px-4 py-3 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr
              key={usuario.id}
              className={`relative border-b border-gray-100 last:border-0 ${
                usuario.rol === 'alumno' ? 'hover:bg-gray-50' : ''
              }`}
            >
              <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                {usuario.rol === 'alumno' && (
                  <Link
                    href={`/admin/${usuario.id}`}
                    className="absolute inset-0"
                    aria-label={`Editar a ${usuario.nombre} ${usuario.apellido}`}
                  />
                )}
                {usuario.nombre} {usuario.apellido}
              </td>
              <td className="px-4 py-3 text-gray-500">{usuario.email ?? '—'}</td>
              <td className="px-4 py-3 text-gray-500">{usuario.empresa || '—'}</td>
              <td className="px-4 py-3 text-gray-500 capitalize">{usuario.rol}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1.5 ${usuario.activo ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${usuario.activo ? 'bg-green-500' : 'bg-gray-300'}`} />
                  {usuario.activo ? 'Activo' : 'Desactivado'}
                </span>
              </td>
              <td className="px-4 py-3">
                <VigenciaBadge usuario={usuario} />
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatFecha(usuario.fecha_inicio)}</td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {usuario.rol === 'admin' ? '—' : formatFecha(usuario.fecha_vencimiento)}
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {usuario.ultimo_acceso ? formatFechaHora(usuario.ultimo_acceso) : 'Nunca'}
              </td>
              <td className="relative z-10 px-4 py-3">
                {usuario.rol === 'alumno' && !usuario.email_confirmado ? (
                  <RegenerarEnlaceButton
                    userId={usuario.id}
                    accion={regenerarEnlace}
                    etiqueta="Generar nuevo enlace"
                  />
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
