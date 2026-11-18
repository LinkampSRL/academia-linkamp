'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export interface CambiarContrasenaState {
  error: string | null
  ok: boolean
}

const MINIMO = 8

// Cambio obligatorio de la contraseña temporal. Nunca recibe un id ni un
// email del navegador: todo sale de la sesión server-side. El orden es
// deliberado — primero se cambia la contraseña y RECIÉN DESPUÉS se baja la
// marca must_change_password; al revés, un fallo del cambio dejaría al
// alumno sin obligación. La contraseña nueva nunca se loguea.
//
// Se cambia con updateUser() sobre la sesión del propio alumno (no con la
// Admin API) justamente porque GoTrue rechaza una contraseña igual a la
// actual (same_password): es lo que impide "cambiar" la temporal por sí
// misma. La temporal queda invalidada porque la contraseña se REEMPLAZA.
export async function cambiarContrasenaInicial(
  _prev: CambiarContrasenaState,
  formData: FormData
): Promise<CambiarContrasenaState> {
  const password = String(formData.get('password') ?? '')
  const confirmacion = String(formData.get('confirmacion') ?? '')

  if (password.length < MINIMO) {
    return { error: `La contraseña debe tener al menos ${MINIMO} caracteres.`, ok: false }
  }
  if (password !== confirmacion) {
    return { error: 'Las contraseñas no coinciden.', ok: false }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Tu sesión expiró. Volvé a ingresar con tu contraseña temporal.', ok: false }
  }

  // Sin marca no hay nada que cambiar (p. ej. ya la definió en otra pestaña).
  if (user.app_metadata?.must_change_password !== true) {
    return { error: null, ok: true }
  }

  const { error: updateError } = await supabase.auth.updateUser({ password })

  if (updateError) {
    if (updateError.code === 'same_password') {
      return { error: 'La nueva contraseña tiene que ser distinta de la actual.', ok: false }
    }
    if (updateError.code === 'weak_password') {
      return { error: 'Esa contraseña es demasiado débil. Probá con una más larga o más variada.', ok: false }
    }
    console.error('[cambiarContrasenaInicial] updateUser falló:', updateError.code ?? updateError.status)
    return { error: 'No se pudo guardar la contraseña. Intentá de nuevo.', ok: false }
  }

  // Marca abajo con service_role (el alumno no puede escribir app_metadata).
  // Un reintento ante un fallo transitorio; si igual falla, la marca sigue
  // en true y el proxy lo seguirá mandando acá — nunca se afloja la
  // obligación por un error.
  const admin = createAdminClient()
  let marcaBajada = false
  for (let intento = 0; intento < 2 && !marcaBajada; intento++) {
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { ...user.app_metadata, must_change_password: false },
    })
    marcaBajada = !error
  }

  if (!marcaBajada) {
    console.error('[cambiarContrasenaInicial] no se pudo bajar la marca de cambio obligatorio')
    return {
      error:
        'Tu contraseña se guardó, pero no pudimos terminar la activación. Probá de nuevo con otra contraseña distinta.',
      ok: false,
    }
  }

  // Cierra cualquier otra sesión abierta con la temporal (por ejemplo, de
  // alguien que hubiera visto el mensaje antes que el alumno). La sesión
  // actual sigue. Mejor esfuerzo: si falla no se afloja nada.
  try {
    await supabase.auth.signOut({ scope: 'others' })
  } catch {
    // sin efecto sobre la obligación ya cumplida
  }

  return { error: null, ok: true }
}
