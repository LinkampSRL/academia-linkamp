import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/profile'
import { getCourse } from '@/lib/course'
import {
  calcularEstadoModulo,
  calcularProgresoGeneral,
  obtenerUltimoModuloVisitado,
  type EstadoModulo,
  type ProgresoModulo,
} from '@/lib/progreso'
import {
  calcularFinalizacion,
  type ProgresoModuloFinalizacion,
  type IntentoFinalizacion,
} from '@/lib/finalizacion'
import { CERTIFICADO_COLUMNAS, type Certificado } from '@/lib/certificado'
import Topbar from '@/components/Topbar'
import CertificadoEstado from '@/components/CertificadoEstado'

function formatFecha(fecha: string | null): string {
  if (!fecha) return 'Sin fecha de vencimiento'
  return `Vence el ${new Date(fecha).toLocaleDateString('es-AR')}`
}

const ESTADO_BADGE: Record<EstadoModulo, { label: string; className: string }> = {
  por_empezar: { label: 'Por empezar', className: 'bg-gray-100 text-gray-500' },
  en_curso: { label: 'En curso', className: 'bg-blue-50 text-blue-600' },
  completado: { label: '✓ Completado', className: 'bg-green-50 text-green-600' },
}

// Bloque "Dashboard del alumno" — Etapa D: progreso real a partir de
// progreso_modulos. Estados, contador y CTA salen de lib/progreso.ts
// (lógica pura), acotados siempre a los slugs reales de curso.json.
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

  const { data: progresoRows } = await supabase
    .from('progreso_modulos')
    .select('modulo_slug, visitado_at, completado, completado_at')
    .eq('alumno_id', profile.id)

  const { data: intentosRows } = await supabase
    .from('intentos_evaluacion')
    .select('modulo_slug, aprobado, created_at')
    .eq('alumno_id', profile.id)

  const progreso: ProgresoModulo[] = progresoRows ?? []
  const progresoFinalizacion: ProgresoModuloFinalizacion[] = progresoRows ?? []
  const intentos: IntentoFinalizacion[] = intentosRows ?? []

  const { completados, total, porcentaje } = calcularProgresoGeneral(course.modulos, progreso)
  const ultimoModuloSlug = obtenerUltimoModuloVisitado(course.modulos, progreso)
  const cta = ultimoModuloSlug
    ? { label: 'Continuar curso', href: `/curso/${ultimoModuloSlug}` }
    : { label: 'Comenzar curso', href: '/curso/01-introduccion' }

  const estadoFinalizacion = calcularFinalizacion(course.modulos, progresoFinalizacion, intentos)

  // Corre siempre, sin condicionarla a `finalizado`: un certificado ya
  // emitido se sigue mostrando aunque el alumno deje de cumplir los
  // requisitos actuales (ver app/dashboard/certificado/actions.ts).
  const { data: certificadoRow } = await supabase
    .from('certificados_emitidos')
    .select(CERTIFICADO_COLUMNAS)
    .eq('alumno_id', profile.id)
    .eq('curso_slug', course.slug)
    .maybeSingle()

  const certificado = certificadoRow as unknown as Certificado | null

  return (
    <div>
      <Topbar />
      <main className="max-w-[820px] mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-[22px] font-medium text-gray-900 mb-1">Hola, {profile.nombre} 👋</h1>
          {profile.empresa && <p className="text-[13px] text-gray-500">{profile.empresa}</p>}
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col gap-2 max-w-sm flex-1 min-w-[220px]">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${profile.activo ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-[13px] font-medium text-gray-900">
                {profile.activo ? 'Acceso activo' : 'Cuenta desactivada'}
              </span>
            </div>
            <p className="text-[12px] text-gray-500">{formatFecha(profile.fecha_vencimiento)}</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col gap-2 max-w-sm flex-1 min-w-[220px]">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-gray-900">Progreso general</span>
              <span className="text-[12px] text-gray-500">
                {completados} de {total} módulos
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${porcentaje}%` }} />
            </div>
            <p className="text-[12px] text-gray-500">{porcentaje}% completado</p>
            <p className="text-[12px] text-gray-500">
              {estadoFinalizacion.evaluaciones.aprobadas} de {estadoFinalizacion.evaluaciones.total} evaluaciones
              aprobadas
            </p>
          </div>
        </div>

        {estadoFinalizacion.finalizado && estadoFinalizacion.fechaFinalizacion ? (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-5 flex flex-col gap-1">
            <p className="text-[14px] font-medium text-green-800">🎉 ¡Felicitaciones! Completaste el curso.</p>
            <p className="text-[12px] text-green-700">
              Finalizado el {new Date(estadoFinalizacion.fechaFinalizacion).toLocaleDateString('es-AR')}
            </p>
          </div>
        ) : (
          <Link
            href={cta.href}
            className="inline-flex items-center gap-2 mt-6 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            {cta.label}
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}

        <CertificadoEstado finalizado={estadoFinalizacion.finalizado} certificadoInicial={certificado} />

        <h2 className="text-[13px] font-medium text-gray-900 mt-12 mb-4">Módulos del curso</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {course.modulos.map((modulo) => {
            const estado = calcularEstadoModulo(modulo, progreso)
            const badge = ESTADO_BADGE[estado]
            return (
              <Link
                key={modulo.slug}
                href={`/curso/${modulo.slug}`}
                className="group flex flex-col gap-2 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all bg-white"
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-md bg-gray-100 text-gray-500 flex items-center justify-center text-[11px] font-medium">
                    {modulo.orden}
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-[13px] font-medium text-gray-900 leading-snug flex-1">{modulo.titulo}</p>
                <span className="text-[11px] text-blue-600 group-hover:underline">Ver módulo →</span>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
