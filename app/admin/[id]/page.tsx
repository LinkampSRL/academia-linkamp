import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/profile'
import { obtenerAlumno } from '@/lib/admin/usuarios'
import EditarAlumnoForm from '@/components/admin/EditarAlumnoForm'
import EliminarAlumnoButton from '@/components/admin/EliminarAlumnoButton'

// Etapa 3 del Sprint 5.4: edición de alumno. Aplica solo a rol='alumno'
// — un admin nunca es un resultado válido de obtenerAlumno(), así que
// intentar editar un id de admin (o inexistente) cae directo al listado.
export default async function EditarAlumnoPage({
  params,
}: {
  params: Promise<{ id: string }>
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

  const { id } = await params
  const alumno = await obtenerAlumno(id)

  if (!alumno) {
    redirect('/admin')
  }

  return (
    <div className="max-w-[820px] mx-auto px-6 py-12">
      <Link href="/admin" className="text-[12px] text-gray-400 hover:text-gray-600 mb-4 inline-block">
        ← Volver al listado
      </Link>
      <h1 className="text-[22px] font-medium text-gray-900 mb-1">
        Editar alumno
      </h1>
      <p className="text-[13px] text-gray-500 mb-6">
        {alumno.nombre} {alumno.apellido}
      </p>
      <EditarAlumnoForm alumno={alumno} />

      <div className="mt-10 pt-6 border-t border-gray-100 max-w-lg">
        <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-2">Zona de peligro</p>
        <EliminarAlumnoButton id={alumno.id} nombreCompleto={`${alumno.nombre} ${alumno.apellido}`} />
      </div>
    </div>
  )
}
