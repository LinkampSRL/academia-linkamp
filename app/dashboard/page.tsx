import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/profile'
import { getCourse } from '@/lib/course'
import Topbar from '@/components/Topbar'

function formatFecha(fecha: string | null): string {
  if (!fecha) return 'Sin fecha de vencimiento'
  return `Vence el ${new Date(fecha).toLocaleDateString('es-AR')}`
}

// Etapa C del bloque "Dashboard del alumno": grid de módulos + CTA de
// inicio. Deliberadamente sin porcentajes ni estado de progreso — no
// existe persistencia real todavía, y mostrar un dato inventado sería
// engañoso. "Comenzar curso" siempre apunta al módulo 1 por ahora; el
// día que exista progreso real, se reemplaza por "Continuar curso"
// apuntando al último punto real del alumno.
export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const profile = user ? await getProfile(supabase, user.id) : null

  if (!profile) {
    redirect('/login')
  }

  const course = getCourse()

  return (
    <div>
      <Topbar />
      <main className="max-w-[820px] mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-[22px] font-medium text-gray-900 mb-1">Hola, {profile.nombre} 👋</h1>
          {profile.empresa && <p className="text-[13px] text-gray-500">{profile.empresa}</p>}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col gap-2 max-w-sm">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${profile.activo ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-[13px] font-medium text-gray-900">
              {profile.activo ? 'Acceso activo' : 'Cuenta desactivada'}
            </span>
          </div>
          <p className="text-[12px] text-gray-500">{formatFecha(profile.fecha_vencimiento)}</p>
        </div>

        <Link
          href="/curso/01-introduccion"
          className="inline-flex items-center gap-2 mt-6 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Comenzar curso
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <h2 className="text-[13px] font-medium text-gray-900 mt-12 mb-4">Módulos del curso</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {course.modulos.map((modulo) => (
            <Link
              key={modulo.slug}
              href={`/curso/${modulo.slug}`}
              className="group flex flex-col gap-2 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all bg-white"
            >
              <div className="w-7 h-7 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center text-[11px] font-medium">
                {modulo.orden}
              </div>
              <p className="text-[13px] font-medium text-gray-900 leading-snug flex-1">{modulo.titulo}</p>
              <span className="text-[11px] text-blue-600 group-hover:underline">Ver módulo →</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
