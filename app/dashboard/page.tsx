import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/profile'

// Placeholder del Sprint 5.3 — solo valida que la protección de proxy.ts
// funciona. Sin funcionalidad real todavía (progreso, certificados, etc.).
export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const profile = user ? await getProfile(supabase, user.id) : null

  return (
    <div className="max-w-[820px] mx-auto px-6 py-12">
      <h1 className="text-[22px] font-medium text-gray-900 mb-2">Dashboard</h1>
      <p className="text-[13px] text-gray-500">
        Hola{profile ? `, ${profile.nombre}` : ''}. Esta pantalla es un placeholder — todavía no tiene
        funcionalidad real.
      </p>
    </div>
  )
}
