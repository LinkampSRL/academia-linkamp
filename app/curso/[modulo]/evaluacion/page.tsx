import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCourse } from '@/lib/course'
import { getPreguntas, tienePreguntas } from '@/lib/preguntas'
import { calcularResumenIntentos, ocultarRespuestas, seleccionarAleatorias } from '@/lib/evaluacion'
import { createClient } from '@/lib/supabase/server'
import EvaluacionRunner from '@/components/EvaluacionRunner'

export async function generateStaticParams() {
  const course = getCourse()
  return course.modulos
    .filter((m) => tienePreguntas(m.slug))
    .map((m) => ({ modulo: m.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ modulo: string }>
}): Promise<Metadata> {
  const { modulo: slug } = await params
  const course = getCourse()
  const moduloData = course.modulos.find((m) => m.slug === slug)
  if (!moduloData) return { title: 'Academia Linkamp' }
  return {
    title: `Evaluación — Módulo ${String(moduloData.orden).padStart(2, '0')} | Academia Linkamp`,
  }
}

export default async function EvaluacionPage({
  params,
}: {
  params: Promise<{ modulo: string }>
}) {
  const { modulo: slug } = await params

  if (!tienePreguntas(slug)) {
    notFound()
  }

  const course = getCourse()
  const moduloData = course.modulos.find((m) => m.slug === slug)

  if (!moduloData) {
    notFound()
  }

  const banco = getPreguntas(slug)
  // Selección server-side: el Client Component nunca recibe el banco
  // completo ni `respuesta_correcta` — solo esta vista pública ya recortada
  // y con el orden de opciones barajado para este intento.
  const preguntasIniciales = ocultarRespuestas(
    seleccionarAleatorias(banco.preguntas, banco.preguntas_por_intento)
  )

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let resumenIntentos = null
  if (user) {
    const { data: intentos } = await supabase
      .from('intentos_evaluacion')
      .select('puntaje, aprobado, created_at')
      .eq('alumno_id', user.id)
      .eq('modulo_slug', slug)

    resumenIntentos = calcularResumenIntentos(intentos ?? [])
  }

  return (
    <div className="max-w-[820px] mx-auto px-6 py-12">
      <EvaluacionRunner
        preguntasIniciales={preguntasIniciales}
        notaMinima={banco.nota_minima_aprobacion}
        moduloSlug={slug}
        moduloOrden={moduloData.orden}
        moduloTitulo={moduloData.titulo}
        modulos={course.modulos}
        resumenIntentos={resumenIntentos}
      />
    </div>
  )
}
