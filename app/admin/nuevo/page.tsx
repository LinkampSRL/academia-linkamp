import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/profile'
import AltaAlumnoForm from '@/components/admin/AltaAlumnoForm'

export default async function NuevoAlumnoPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const profile = user ? await getProfile(supabase, user.id) : null

  // Re-chequeo de rol, además de la protección ya existente en proxy.ts.
  if (!profile || profile.rol !== 'admin') {
    redirect('/acceso-restringido?motivo=no_autorizado')
  }

  return (
    <div className="max-w-[820px] mx-auto px-6 py-12">
      <Link href="/admin" className="text-[12px] text-gray-400 hover:text-gray-600 mb-4 inline-block">
        ← Volver al listado
      </Link>
      <h1 className="text-[22px] font-medium text-gray-900 mb-1">Nuevo alumno</h1>
      <p className="text-[13px] text-gray-500 mb-6">
        Se le va a enviar un email para que defina su propia contraseña — vos no la definís acá.
      </p>
      <AltaAlumnoForm />
    </div>
  )
}
