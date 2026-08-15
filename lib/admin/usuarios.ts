import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Profile } from '@/lib/profile'

export type Usuario = Profile & {
  email: string | null
  ultimo_acceso: string | null
  email_confirmado: boolean
}

export type Vigencia = 'vigente' | 'proximo_a_vencer' | 'vencido'

const DIAS_PROXIMO_A_VENCER = 15

// El admin ignora fecha_vencimiento (regla de negocio ya aplicada en
// proxy.ts) — este cálculo solo tiene sentido visual para alumnos.
export function calcularVigencia(fechaVencimiento: string | null): Vigencia {
  if (!fechaVencimiento) return 'vigente'
  const dias = (new Date(fechaVencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  if (dias < 0) return 'vencido'
  if (dias < DIAS_PROXIMO_A_VENCER) return 'proximo_a_vencer'
  return 'vigente'
}

// `profiles` no tiene email (vive en auth.users) ni un último acceso
// confiable (`profiles.ultimo_login` no se escribe desde ningún código
// todavía). En vez de duplicar el email o cablear una escritura nueva,
// esta función mergea profiles con auth.users en memoria vía Admin API:
// el email y `last_sign_in_at` (mantenido automáticamente por Supabase
// Auth en cada login exitoso) salen de ahí.
export async function listarUsuarios(): Promise<Usuario[]> {
  const admin = createAdminClient()

  const { data: profiles, error } = await admin.from('profiles').select('*')
  if (error) throw error

  const authPorId = new Map<
    string,
    { email: string | null; last_sign_in_at: string | null; email_confirmado: boolean }
  >()
  for (let page = 1; ; page++) {
    const { data, error: usersError } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
    if (usersError) throw usersError
    for (const u of data.users) {
      authPorId.set(u.id, {
        email: u.email ?? null,
        last_sign_in_at: u.last_sign_in_at ?? null,
        email_confirmado: Boolean(u.email_confirmed_at),
      })
    }
    if (data.users.length < 1000) break
  }

  return (profiles as Profile[]).map((p) => {
    const auth = authPorId.get(p.id)
    return {
      ...p,
      email: auth?.email ?? null,
      ultimo_acceso: auth?.last_sign_in_at ?? null,
      email_confirmado: auth?.email_confirmado ?? false,
    }
  })
}

export type FiltrosUsuarios = {
  q?: string
  rol?: 'admin' | 'alumno'
  estado?: 'activo' | 'inactivo'
  vigencia?: Vigencia
  orden?: 'fecha_inicio' | 'fecha_vencimiento'
}

export function filtrarYOrdenarUsuarios(usuarios: Usuario[], filtros: FiltrosUsuarios): Usuario[] {
  let resultado = usuarios

  if (filtros.q) {
    const q = filtros.q.toLowerCase()
    resultado = resultado.filter((u) =>
      [u.nombre, u.apellido, u.empresa, u.email ?? ''].some((campo) => campo.toLowerCase().includes(q))
    )
  }

  if (filtros.rol) {
    resultado = resultado.filter((u) => u.rol === filtros.rol)
  }

  if (filtros.estado) {
    resultado = resultado.filter((u) => (filtros.estado === 'activo' ? u.activo : !u.activo))
  }

  if (filtros.vigencia) {
    resultado = resultado.filter((u) => calcularVigencia(u.fecha_vencimiento) === filtros.vigencia)
  }

  if (filtros.orden) {
    const campo = filtros.orden
    resultado = [...resultado].sort((a, b) => {
      const va = a[campo] ? new Date(a[campo] as string).getTime() : 0
      const vb = b[campo] ? new Date(b[campo] as string).getTime() : 0
      return va - vb
    })
  }

  return resultado
}

export type AltaAlumnoInput = {
  nombre: string
  apellido: string
  empresa: string
  email: string
  fecha_inicio: string
  fecha_vencimiento: string
  activo: boolean
}

// El alta siempre crea alumnos (decisión aprobada). MVP sin envío
// automático de email — generateLink() crea el usuario (mismo trigger
// handle_new_user que antes) y devuelve el token_hash sin mandar nada;
// el admin copia el enlace resultante y lo manda por su cuenta. Nunca
// define una contraseña acá. El trigger pone rol='alumno' hardcodeado
// y activo=true siempre; si el admin pide crear el alumno ya
// desactivado, se corrige con un UPDATE inmediato.
export async function crearAlumno(input: AltaAlumnoInput): Promise<{ id: string; link: string }> {
  const admin = createAdminClient()

  // redirectTo sale exclusivamente de SITE_URL (variable server-only fija
  // por entorno) — nunca de un header de la request ni de un valor
  // enviado por el cliente. Requiere que esa URL esté en Redirect URLs
  // del proyecto de Supabase. Apunta a /auth/confirm: ese Route Handler
  // resuelve el token_hash vía verifyOtp server-side antes de redirigir
  // a /set-password.
  const redirectTo = `${process.env.SITE_URL!}/auth/confirm`

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'invite',
    email: input.email,
    options: {
      data: {
        nombre: input.nombre,
        apellido: input.apellido,
        empresa: input.empresa,
        fecha_inicio: input.fecha_inicio,
        fecha_vencimiento: input.fecha_vencimiento,
      },
      redirectTo,
    },
  })

  if (error) throw error

  const id = data.user.id

  if (!input.activo) {
    const { error: updateError } = await admin.from('profiles').update({ activo: false }).eq('id', id)
    if (updateError) throw updateError
  }

  const link = construirEnlaceActivacion(data.properties.hashed_token)

  return { id, link }
}

function construirEnlaceActivacion(hashedToken: string): string {
  return `${process.env.SITE_URL!}/auth/confirm?token_hash=${hashedToken}&type=invite&next=/set-password`
}

// "Generar nuevo enlace" — para un alumno ya creado cuyo link anterior
// se perdió o venció. No crea un usuario nuevo: generateLink() sobre un
// email que ya existe y sigue sin confirmar reutiliza esa misma fila
// (el trigger handle_new_user es AFTER INSERT, no vuelve a correr acá),
// así que rol/activo/fechas quedan exactamente como estaban. El token
// anterior queda inutilizado por el comportamiento estándar de
// Supabase al emitir uno nuevo — no hace falta invalidarlo a mano.
// El id llega del panel (no es un dato sensible en sí mismo); el email
// y el estado de confirmación siempre se releen server-side, nunca se
// confía en nada que venga del navegador.
export async function regenerarEnlaceInvitacion(userId: string): Promise<{ link: string }> {
  const admin = createAdminClient()

  const { data: userData, error: userError } = await admin.auth.admin.getUserById(userId)
  if (userError || !userData.user) {
    throw userError ?? new Error('Usuario no encontrado.')
  }

  const { user } = userData
  if (!user.email) {
    throw new Error('El usuario no tiene un email asociado.')
  }
  if (user.email_confirmed_at) {
    throw new Error('Este alumno ya activó su cuenta — no corresponde generar un enlace de invitación nuevo.')
  }

  const redirectTo = `${process.env.SITE_URL!}/auth/confirm`

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'invite',
    email: user.email,
    options: { redirectTo },
  })

  if (error) throw error

  return { link: construirEnlaceActivacion(data.properties.hashed_token) }
}

// Trae un único alumno para la pantalla de edición. Si el id no existe
// o pertenece a un admin, devuelve null — "obtenerAlumno" es
// explícitamente solo-alumnos, un admin nunca es un resultado válido acá.
export async function obtenerAlumno(id: string): Promise<Usuario | null> {
  const admin = createAdminClient()

  const { data: profile, error } = await admin.from('profiles').select('*').eq('id', id).maybeSingle()
  if (error || !profile || (profile as Profile).rol !== 'alumno') return null

  const { data: userData, error: userError } = await admin.auth.admin.getUserById(id)
  if (userError || !userData.user) return null

  return {
    ...(profile as Profile),
    email: userData.user.email ?? null,
    ultimo_acceso: userData.user.last_sign_in_at ?? null,
    email_confirmado: Boolean(userData.user.email_confirmed_at),
  }
}

export type EditarAlumnoInput = {
  nombre: string
  apellido: string
  empresa: string
  activo: boolean
  fecha_inicio: string
  fecha_vencimiento: string
}

// rol/email nunca se tocan acá (ni siquiera se reciben). El
// `.eq('rol', 'alumno')` es una salvaguarda adicional en la propia query:
// aunque algo más arriba fallara al validar, esta escritura físicamente
// no puede alcanzar una fila de admin. `.select('id')` sobre el update
// permite detectar "no se actualizó ninguna fila" (id inexistente o no
// era alumno) en vez de fallar en silencio.
export async function actualizarAlumno(id: string, input: EditarAlumnoInput): Promise<void> {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('profiles')
    .update({
      nombre: input.nombre,
      apellido: input.apellido,
      empresa: input.empresa,
      activo: input.activo,
      fecha_inicio: input.fecha_inicio,
      fecha_vencimiento: input.fecha_vencimiento,
    })
    .eq('id', id)
    .eq('rol', 'alumno')
    .select('id')

  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('No se encontró un alumno con ese id para actualizar.')
  }
}

// Eliminación segura: relee el rol server-side (nunca confía en que el
// llamador ya lo haya verificado) y rechaza explícitamente si no es
// 'alumno' — un admin nunca puede ser borrado por este camino, ni
// siquiera por error. `profiles` se borra solo por el `on delete
// cascade` ya existente en la FK hacia auth.users.
export async function eliminarAlumno(id: string): Promise<void> {
  const admin = createAdminClient()

  const { data: profile, error } = await admin.from('profiles').select('rol').eq('id', id).maybeSingle()
  if (error || !profile || (profile as Pick<Profile, 'rol'>).rol !== 'alumno') {
    throw new Error('No se encontró un alumno con ese id para eliminar.')
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(id)
  if (deleteError) throw deleteError
}

export const USUARIOS_POR_PAGINA = 20

export function paginarUsuarios(usuarios: Usuario[], pagina: number) {
  const total = usuarios.length
  const totalPaginas = Math.max(1, Math.ceil(total / USUARIOS_POR_PAGINA))
  const paginaSegura = Math.min(Math.max(1, pagina), totalPaginas)
  const inicio = (paginaSegura - 1) * USUARIOS_POR_PAGINA
  return {
    items: usuarios.slice(inicio, inicio + USUARIOS_POR_PAGINA),
    total,
    totalPaginas,
    pagina: paginaSegura,
  }
}
