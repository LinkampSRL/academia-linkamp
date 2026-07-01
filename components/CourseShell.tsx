'use client'

import { useState } from 'react'
import Topbar from './Topbar'
import Sidebar from './Sidebar'
import type { Curso } from '@/lib/course'

interface CourseShellProps {
  course: Curso
  sectionsMap: Record<string, string[]>
  children: React.ReactNode
}

export default function CourseShell({ course, sectionsMap, children }: CourseShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <Topbar
        onMenuToggle={() => setMobileOpen((o) => !o)}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          modulos={course.modulos}
          sectionsMap={sectionsMap}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        {/* Overlay: solo visible en mobile cuando el sidebar está abierto */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    </>
  )
}
