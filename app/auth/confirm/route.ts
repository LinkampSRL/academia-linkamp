import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Único destino permitido para este flujo. `next` nunca se usa como
// redirect abierto: si falta, es inválido, o intenta apuntar a otro
// lado, se ignora y se usa este valor fijo en su lugar.
const NEXT_PERMITIDO = '/set-password'

const DESTINO_INVALIDO = '/acceso-restringido?motivo=invitacion_invalida'

// Resuelve el token_hash de la invitación server-side vía verifyOtp,
// que valida el token exclusivamente contra el usuario para el que fue
// emitido — sin ninguna dependencia de qué sesión hubiera antes en el
// navegador. Si falla, nunca se reutiliza una sesión previa como
// sustituto: se redirige siempre a una pantalla de invitación inválida.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const nextParam = searchParams.get('next')

  const next = nextParam === NEXT_PERMITIDO ? nextParam : NEXT_PERMITIDO

  if (tokenHash && type === 'invite') {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type: 'invite', token_hash: tokenHash })

    if (!error) {
      return NextResponse.redirect(new URL(next, origin))
    }
  }

  return NextResponse.redirect(new URL(DESTINO_INVALIDO, origin))
}
