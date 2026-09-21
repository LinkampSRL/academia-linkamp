'use client'

import { useFormStatus } from 'react-dom'

// Se deshabilita al enviar: un doble clic dispararía dos verifyOtp, y como
// el token es de un solo uso, el segundo fallaría y pisaría al primero con
// la pantalla de enlace inválido.
export default function ContinuarButton({ etiqueta = 'Continuar' }: { etiqueta?: string }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-[13px] font-medium px-4 py-2.5 rounded-lg transition-colors"
    >
      {pending ? 'Verificando...' : etiqueta}
    </button>
  )
}
