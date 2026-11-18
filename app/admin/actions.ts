'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile, type Profile } from '@/lib/profile'
import {
  crearAlumno,
  crearAlumnoConPasswordTemporal,
  regenerarAccesoTemporal,
  regenerarEnlaceInvitacion,
  generarEnlaceRecuperacion,
  actualizarAlumno,
  eliminarAlumno,
  type CredencialesTemporales,
} from '@/lib/admin/usuarios'

export interface AltaAlumnoState {
  error: string | null
  link: string | null
  credenciales: CredencialesTemporales | null
}

export interface RegenerarAccesoState {
  error: string | null
  credenciales: CredencialesTemporales | null
}

export interface RegenerarEnlaceState {
  error: string | null
  link: string | null
}

export interface EditarAlumnoState {
  error: string | null
}

export interface EliminarAlumnoState {
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

// MVP sin envío automático de email: no redirige — devuelve las credenciales
// temporales (método principal) o el enlace de activación (respaldo) para
// que el admin los copie y los mande manualmente. Nada de esto se loguea.
export async function altaAlumno(
  _prevState: AltaAlumnoState,
  formData: FormData
): Promise<AltaAlumnoState> {
  const admin = await requerirAdmin()
  if (!admin) {
    return { error: 'No autorizado.', link: null, credenciales: null }
  }

  const nombre = String(formData.get('nombre') ?? '').trim()
  const apellido = String(formData.get('apellido') ?? '').trim()
  const empresa = String(formData.get('empresa') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const fechaInicio = String(formData.get('fecha_inicio') ?? '')
  const fechaVencimiento = String(formData.get('fecha_vencimiento') ?? '')
  const activo = formData.get('activo') === 'on'
  // Método de acceso: 'password' (contraseña temporal, por defecto) o
  // 'enlace' (enlace de activación, respaldo). Cualquier otro valor cae en
  // el método principal.
  const metodo = formData.get('metodo') === 'enlace' ? 'enlace' : 'password'

  if (!nombre || !apellido || !email) {
    return { error: 'Nombre, apellido y email son obligatorios.', link: null, credenciales: null }
  }
  if (!esEmailValido(email)) {
    return { error: 'El email no tiene un formato válido.', link: null, credenciales: null }
  }
  if (!fechaInicio || !fechaVencimiento) {
    return { error: 'Fecha de inicio y fecha de vencimiento son obligatorias.', link: null, credenciales: null }
  }
  if (new Date(fechaInicio).getTime() > new Date(fechaVencimiento).getTime()) {
    return {
      error: 'La fecha de inicio no puede ser posterior a la fecha de vencimiento.',
      link: null,
      credenciales: null,
    }
  }

  const input = {
    nombre,
    apellido,
    empresa,
    email,
    fecha_inicio: fechaInicio,
    fecha_vencimiento: fechaVencimiento,
    activo,
  }

  try {
    if (metodo === 'enlace') {
      const { link } = await crearAlumno(input)
      return { error: null, link, credenciales: null }
    }
    const { credenciales } = await crearAlumnoConPasswordTemporal(input)
    return { error: null, link: null, credenciales }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[altaAlumno] error creando alumno:', message)
    if (message.toLowerCase().includes('already been registered') || message.toLowerCase().includes('already registered')) {
      return { error: 'Ya existe un usuario con ese email.', link: null, credenciales: null }
    }
    return { error: 'No se pudo crear el alumno. Intentá de nuevo.', link: null, credenciales: null }
  }
}

// "Regenerar acceso" — contraseña temporal nueva para un alumno existente.
// Solo admin, re-chequeado acá aunque /admin ya esté protegido por
// proxy.ts. regenerarAccesoTemporal() relee rol='alumno' server-side y
// vuelve a exigir el cambio de contraseña en el próximo ingreso.
export async function regenerarAcceso(userId: string): Promise<RegenerarAccesoState> {
  const admin = await requerirAdmin()
  if (!admin) {
    return { error: 'No autorizado.', credenciales: null }
  }

  try {
    const { credenciales } = await regenerarAccesoTemporal(userId)
    return { error: null, credenciales }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[regenerarAcceso] error:', message)
    if (message.includes('Solo se puede regenerar')) {
      return { error: message, credenciales: null }
    }
    return { error: 'No se pudo regenerar el acceso. Intentá de nuevo.', credenciales: null }
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

// "Generar enlace de recuperación" para un alumno ya activado que
// perdió su contraseña. Mutuamente excluyente con regenerarEnlace: esa
// es para invitaciones pendientes, esta para cuentas ya confirmadas.
// generarEnlaceRecuperacion() ya re-verifica rol='alumno' server-side;
// acá solo se re-chequea que quien pide esto sea admin.
export async function generarEnlaceRecuperacionAction(userId: string): Promise<RegenerarEnlaceState> {
  const admin = await requerirAdmin()
  if (!admin) {
    return { error: 'No autorizado.', link: null }
  }

  try {
    const { link } = await generarEnlaceRecuperacion(userId)
    return { error: null, link }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[generarEnlaceRecuperacionAction] error:', message)
    if (message.includes('Solo se puede generar') || message.includes('todavía no activó')) {
      return { error: message, link: null }
    }
    return { error: 'No se pudo generar el enlace de recuperación. Intentá de nuevo.', link: null }
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

// Eliminación segura de alumno — nunca disponible para admins. Re-chequea
// admin y, dentro de eliminarAlumno(), vuelve a verificar rol='alumno'
// server-side antes de borrar (no confía en que la UI ya lo haya
// filtrado). El `id` llega del panel; no es un dato sensible en sí mismo.
export async function eliminarAlumnoAction(id: string): Promise<EliminarAlumnoState> {
  const admin = await requerirAdmin()
  if (!admin) {
    return { error: 'No autorizado.' }
  }

  try {
    await eliminarAlumno(id)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[eliminarAlumnoAction] error:', message)
    return { error: 'No se pudo eliminar el alumno. Intentá de nuevo.' }
  }

  redirect('/admin')
}
