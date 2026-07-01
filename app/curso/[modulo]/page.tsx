import type { Metadata } from 'next'
import { getCourse } from '@/lib/course'
import { getModuleContent, getModuleSections } from '@/lib/content'
import ModuleContent from '@/components/ModuleContent'
import Link from 'next/link'

export async function generateStaticParams() {
  const course = getCourse()
  return course.modulos.map((m) => ({ modulo: m.slug }))
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
    title: `Módulo ${String(moduloData.orden).padStart(2, '0')} — ${moduloData.titulo} | Academia Linkamp`,
  }
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ modulo: string }>
}) {
  const { modulo: slug } = await params
  const course = getCourse()
  const modulos = course.modulos
  const idx = modulos.findIndex((m) => m.slug === slug)
  const moduloData = modulos[idx]
  const prev = idx > 0 ? modulos[idx - 1] : null
  const next = idx < modulos.length - 1 ? modulos[idx + 1] : null
  const sections = getModuleSections(slug)
  const { frontmatter, content } = getModuleContent(slug)
  const imageCount = (content.match(/^!\[/gm) ?? []).length

  if (!moduloData) return <div className="p-10 text-gray-400">Módulo no encontrado.</div>

  return (
    <div className="max-w-[820px] mx-auto px-6 py-12">

      {/* Badge + título */}
      <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-[11px] font-medium px-3 py-1 rounded-full border border-blue-100 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        Módulo {String(moduloData.orden).padStart(2, '0')}
      </div>

      <h1 className="text-[28px] font-medium text-gray-900 leading-tight tracking-tight mb-3">
        {moduloData.titulo}
      </h1>

      {/* Meta-strip */}
      <div className="flex items-center gap-5 text-[12px] text-gray-400 pb-8 mb-8 border-b border-gray-100">
        {sections.length > 0 && (
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            {sections.length} {sections.length === 1 ? 'sección' : 'secciones'}
          </span>
        )}
        {imageCount > 0 && (
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {imageCount} {imageCount === 1 ? 'imagen' : 'imágenes'}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {frontmatter.version || course.version}
        </span>
      </div>

      <ModuleContent content={content} />

      {/* Navegación anterior / siguiente */}
      <div className="flex items-start justify-between mt-16 pt-8 border-t border-gray-100">
        <div>
          {prev ? (
            <Link
              href={`/curso/${prev.slug}`}
              className="group flex flex-col gap-1"
            >
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Anterior</span>
              <span className="flex items-center gap-2 text-[13px] font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                {prev.titulo}
              </span>
            </Link>
          ) : (
            <div>
              <span className="text-[10px] text-gray-300 uppercase tracking-wider">Anterior</span>
              <p className="text-[13px] text-gray-300 mt-1">Inicio del curso</p>
            </div>
          )}
        </div>

        <div className="text-right">
          {next ? (
            <Link
              href={`/curso/${next.slug}`}
              className="group flex flex-col gap-1 items-end"
            >
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">Siguiente</span>
              <span className="flex items-center gap-2 text-[13px] font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
                {next.titulo}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ) : (
            <div>
              <span className="text-[10px] text-gray-300 uppercase tracking-wider">Siguiente</span>
              <p className="text-[13px] text-gray-300 mt-1">Fin del curso</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
