import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/profile'

// proxy.ts ya garantizó, antes de llegar acá, que hay sesión y que el
// profile existe y está en un estado válido (admin, o alumno activo y
// vigente) — acá solo decidimos a dónde va cada rol.
export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const profile = user ? await getProfile(supabase, user.id) : null

  if (profile?.rol === 'admin') {
    redirect('/admin')
  }

  redirect('/dashboard')
}
