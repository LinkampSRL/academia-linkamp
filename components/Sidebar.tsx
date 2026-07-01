'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Modulo } from '@/lib/course'

interface SidebarProps {
  modulos: Modulo[]
  sectionsMap: Record<string, string[]>
  mobileOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ modulos, sectionsMap, mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const activeSlug = pathname.split('/').pop() ?? ''
  const [activeSection, setActiveSection] = useState<string>('')

  // Al cambiar de módulo, resetea la sección activa antes de que el efecto
  // recalcule según el scroll (patrón de ajuste de estado durante el render).
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setActiveSection('')
  }

  useEffect(() => {
    const main = document.querySelector('main')
    if (!main) return

    const handler = () => {
      const headings = Array.from(document.querySelectorAll('[data-spy-section]'))
      if (headings.length === 0) return

      // Si el usuario llegó al fondo del contenedor, marcar la última sección
      const atBottom = main.scrollHeight - main.scrollTop - main.clientHeight < 16
      if (atBottom) {
        const last = headings[headings.length - 1] as HTMLElement
        setActiveSection(last.textContent?.trim() ?? '')
        return
      }

      // Umbral: 25% del área visible del contenedor
      const threshold = main.scrollTop + main.clientHeight * 0.25

      let active = ''
      for (const h of headings) {
        const el = h as HTMLElement
        if (el.offsetTop <= threshold) {
          active = el.textContent?.trim() ?? ''
        }
      }
      setActiveSection(active)
    }

    // Lectura inicial (por si el usuario ya está a medio módulo al navegar)
    handler()
    main.addEventListener('scroll', handler, { passive: true })
    return () => main.removeEventListener('scroll', handler)
  }, [pathname])

  return (
    <nav className={[
      // Base
      'w-[300px] flex-shrink-0 bg-[#FAFAFA] border-r border-gray-200 overflow-y-auto flex flex-col py-[18px] px-3 gap-1',
      // Mobile: fixed overlay que se desliza desde la izquierda
      'fixed top-14 bottom-0 left-0 z-30 transition-transform duration-300',
      mobileOpen ? 'translate-x-0' : '-translate-x-full',
      // Desktop: vuelve al flujo normal, siempre visible
      'md:relative md:top-auto md:bottom-auto md:left-auto md:z-auto md:translate-x-0 md:transition-none',
    ].join(' ')}>
      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-[0.07em] px-1 pb-2">
        Contenido del curso
      </p>

      {modulos.map((modulo) => {
        const isActive = modulo.slug === activeSlug
        const sections = sectionsMap[modulo.slug] ?? []

        return (
          <div
            key={modulo.slug}
            className={[
              'rounded-lg border bg-white overflow-hidden',
              isActive
                ? 'border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.12)]'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm',
            ].join(' ')}
          >
            <Link
              href={`/curso/${modulo.slug}`}
              className="flex items-center gap-2.5 px-3 py-2 cursor-pointer"
              onClick={onClose}
            >
              <div
                className={[
                  'w-[26px] h-[26px] rounded-md flex items-center justify-center text-[11px] font-medium flex-shrink-0',
                  isActive ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500',
                ].join(' ')}
              >
                {modulo.orden}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={[
                    'text-[10px] leading-none mb-[3px]',
                    isActive ? 'text-blue-500' : 'text-gray-400',
                  ].join(' ')}
                >
                  Módulo {String(modulo.orden).padStart(2, '0')}
                </p>
                <p
                  className={[
                    'text-[12px] leading-snug truncate',
                    isActive ? 'text-gray-900 font-medium' : 'text-gray-500',
                  ].join(' ')}
                >
                  {modulo.titulo}
                </p>
              </div>
              <svg
                className={[
                  'w-3.5 h-3.5 flex-shrink-0 transition-transform',
                  isActive ? 'text-blue-400 rotate-90' : 'text-gray-300',
                ].join(' ')}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {isActive && sections.length > 0 && (
              <div className="border-t border-blue-50 py-2">
                {sections.map((section, i) => {
                  const isSectionActive = section === activeSection
                  return (
                    <div
                      key={i}
                      className={[
                        'flex items-center gap-1.5 px-3 py-[5px] pl-[46px] text-[11px] border-l-2 cursor-pointer transition-colors',
                        isSectionActive
                          ? 'border-blue-400 text-blue-600 bg-blue-50/50'
                          : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50',
                      ].join(' ')}
                    >
                      <span className="w-1 h-1 rounded-full bg-current flex-shrink-0" />
                      {section}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
