import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import LegalFooter from '@/components/LegalFooter'
import ContinuarButton from '@/components/auth/ContinuarButton'
import { DESTINO_INVALIDO, esTipoEnlace, type TipoEnlace } from '@/lib/auth/enlace-confirmacion'
import { confirmarEnlace } from './actions'

// El token viaja en la URL: sin referrer hacia terceros y sin indexar.
export const metadata: Metadata = {
  title: 'Academia Linkamp',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

const TEXTOS: Record<TipoEnlace, { titulo: string; mensaje: string }> = {
  invite: {
    titulo: 'Activá tu acceso',
    mensaje: 'Tu acceso a Academia Linkamp está listo. Tocá “Continuar” para definir tu contraseña.',
  },
  recovery: {
    titulo: 'Recuperá tu acceso',
    mensaje: 'Tocá “Continuar” para definir una nueva contraseña para tu cuenta de Academia Linkamp.',
  },
}

// Esta página NO consume el token: solo lo lee de la URL y lo reenvía en el
// formulario. Un GET o HEAD (incluidos los de vistas previas, antivirus y
// escáneres de enlaces) renderiza esta pantalla y nada más — el token se
// consume únicamente cuando una persona toca el botón (Server Action).
export default async function ConfirmarEnlacePage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>
}) {
  const { token_hash: tokenHash, type } = await searchParams

  if (!tokenHash || !esTipoEnlace(type)) {
    redirect(DESTINO_INVALIDO)
  }

  const { titulo, mensaje } = TEXTOS[type]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/Logo Linkamp 003 - PNG.png" alt="Linkamp" className="h-12 w-auto mb-3" />
          <h1 className="text-[15px] font-medium text-gray-900">{titulo}</h1>
        </div>

        <form
          action={confirmarEnlace}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-4"
        >
          <p className="text-[13px] text-gray-600">{mensaje}</p>
          <input type="hidden" name="token_hash" value={tokenHash} />
          <input type="hidden" name="type" value={type} />
          <ContinuarButton />
        </form>

        <LegalFooter />
      </div>
    </div>
  )
}
