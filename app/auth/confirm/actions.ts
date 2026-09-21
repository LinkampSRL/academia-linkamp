'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DESTINO_INVALIDO, DESTINO_SET_PASSWORD, esTipoEnlace } from '@/lib/auth/enlace-confirmacion'

// Único lugar donde se consume el token. Es una Server Action (POST),
// disparada solo por el botón "Continuar" de la página intermedia: un
// GET/HEAD, una vista previa de WhatsApp/email o un escáner de enlaces
// nunca llegan hasta acá. verifyOtp valida el token exclusivamente contra
// el usuario para el que fue emitido, sin depender de la sesión previa del
// navegador; si falla, se redirige siempre a la pantalla de enlace inválido.
export async function confirmarEnlace(formData: FormData): Promise<void> {
  const tokenHash = String(formData.get('token_hash') ?? '')
  const type = String(formData.get('type') ?? '')

  if (!tokenHash || !esTipoEnlace(type)) {
    redirect(DESTINO_INVALIDO)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })

  if (error) {
    redirect(DESTINO_INVALIDO)
  }

  redirect(DESTINO_SET_PASSWORD)
}
