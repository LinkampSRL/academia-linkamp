'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile, type Profile } from '@/lib/profile'
import { crearAlumno, regenerarEnlaceInvitacion, actualizarAlumno } from '@/lib/admin/usuarios'

export interface AltaAlumnoState {
  error: string | null
  link: string | null
}

export interface RegenerarEnlaceState {
  error: string | null
  link: string | null
}

export interface EditarAlumnoState {
  error: string | null
}

async function requerirAdmin(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const profile = await getProfile(supabase, user.id)
  if (!profile || profile.rol !== 'admin') return null

  return profile
}

function esEmailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// MVP sin envío automático de email: no redirige — devuelve el enlace
// de activación para que el admin lo copie y lo mande manualmente.
export async function altaAlumno(
  _prevState: AltaAlumnoState,
  formData: FormData
): Promise<AltaAlumnoState> {
  const admin = await requerirAdmin()
  if (!admin) {
    return { error: 'No autorizado.', link: null }
  }

  const nombre = String(formData.get('nombre') ?? '').trim()
  const apellido = String(formData.get('apellido') ?? '').trim()
  const empresa = String(formData.get('empresa') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const fechaInicio = String(formData.get('fecha_inicio') ?? '')
  const fechaVencimiento = String(formData.get('fecha_vencimiento') ?? '')
  const activo = formData.get('activo') === 'on'

  if (!nombre || !apellido || !email) {
    return { error: 'Nombre, apellido y email son obligatorios.', link: null }
  }
  if (!esEmailValido(email)) {
    return { error: 'El email no tiene un formato válido.', link: null }
  }
  if (!fechaInicio || !fechaVencimiento) {
    return { error: 'Fecha de inicio y fecha de vencimiento son obligatorias.', link: null }
  }
  if (new Date(fechaInicio).getTime() > new Date(fechaVencimiento).getTime()) {
    return { error: 'La fecha de inicio no puede ser posterior a la fecha de vencimiento.', link: null }
  }

  try {
    const { link } = await crearAlumno({
      nombre,
      apellido,
      empresa,
      email,
      fecha_inicio: fechaInicio,
      fecha_vencimiento: fechaVencimiento,
      activo,
    })
    return { error: null, link }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[altaAlumno] error creando alumno:', message)
    if (message.toLowerCase().includes('already been registered') || message.toLowerCase().includes('already registered')) {
      return { error: 'Ya existe un usuario con ese email.', link: null }
    }
    return { error: 'No se pudo crear el alumno. Intentá de nuevo.', link: null }
  }
}

// "Generar nuevo enlace" para un alumno ya existente que perdió o dejó
// vencer su link de activación. Solo admin, re-chequeado acá aunque
// /admin ya esté protegido por proxy.ts.
export async function regenerarEnlace(userId: string): Promise<RegenerarEnlaceState> {
  const admin = await requerirAdmin()
  if (!admin) {
    return { error: 'No autorizado.', link: null }
  }

  try {
    const { link } = await regenerarEnlaceInvitacion(userId)
    return { error: null, link }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[regenerarEnlace] error:', message)
    if (message.includes('ya activó su cuenta')) {
      return { error: message, link: null }
    }
    return { error: 'No se pudo generar un nuevo enlace. Intentá de nuevo.', link: null }
  }
}

// Edición de alumno. `id` llega pre-vinculado con .bind() desde el
// Client Component (mismo patrón documentado de Next.js para pasar
// argumentos extra a una Server Action usada con useActionState) — el
// formulario nunca envía rol ni email, ni siquiera como campos ocultos.
export async function actualizarAlumnoAction(
  id: string,
  _prevState: EditarAlumnoState,
  formData: FormData
): Promise<EditarAlumnoState> {
  const admin = await requerirAdmin()
  if (!admin) {
    return { error: 'No autorizado.' }
  }

  const nombre = String(formData.get('nombre') ?? '').trim()
  const apellido = String(formData.get('apellido') ?? '').trim()
  const empresa = String(formData.get('empresa') ?? '').trim()
  const fechaInicio = String(formData.get('fecha_inicio') ?? '')
  const fechaVencimiento = String(formData.get('fecha_vencimiento') ?? '')
  const activo = formData.get('activo') === 'on'

  if (!nombre || !apellido) {
    return { error: 'Nombre y apellido son obligatorios.' }
  }
  if (!fechaInicio || !fechaVencimiento) {
    return { error: 'Fecha de inicio y fecha de vencimiento son obligatorias.' }
  }
  if (new Date(fechaInicio).getTime() > new Date(fechaVencimiento).getTime()) {
    return { error: 'La fecha de inicio no puede ser posterior a la fecha de vencimiento.' }
  }

  try {
    await actualizarAlumno(id, {
      nombre,
      apellido,
      empresa,
      activo,
      fecha_inicio: fechaInicio,
      fecha_vencimiento: fechaVencimiento,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[actualizarAlumnoAction] error:', message)
    return { error: 'No se pudo actualizar el alumno. Intentá de nuevo.' }
  }

  redirect('/admin')
}
