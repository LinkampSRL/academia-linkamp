'use client'

import { useEffect } from 'react'
import { registrarVisita } from '@/app/curso/actions'

// Leaf invisible: dispara el registro de visita al montar. Vive aparte
// de ModulePage (Server Component) porque una escritura durante el
// render de un Server Component es un anti-patrón en Next.js.
export default function RegistrarVisitaModulo({ slug }: { slug: string }) {
  useEffect(() => {
    registrarVisita(slug)
  }, [slug])

  return null
}
