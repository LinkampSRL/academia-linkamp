// Allowlist explícita de tipos aceptados — invitación y recuperación de
// contraseña. Cualquier otro valor (magiclink, signup, email_change) se
// rechaza.
export const TIPOS_PERMITIDOS = ['invite', 'recovery'] as const
export type TipoEnlace = (typeof TIPOS_PERMITIDOS)[number]

export function esTipoEnlace(valor: string | null | undefined): valor is TipoEnlace {
  return TIPOS_PERMITIDOS.includes(valor as TipoEnlace)
}

export const DESTINO_INVALIDO = '/acceso-restringido?motivo=invitacion_invalida'

// Único destino tras confirmar el enlace. Nunca se toma de la URL.
export const DESTINO_SET_PASSWORD = '/set-password'
