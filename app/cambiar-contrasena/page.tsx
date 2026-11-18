'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LegalFooter from '@/components/LegalFooter'
import { cambiarContrasenaInicial, type CambiarContrasenaState } from './actions'

const initialState: CambiarContrasenaState = { error: null, ok: false }

const inputClass =
  'w-full px-3 py-2 text-[14px] text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500'

// Esta pantalla es solo la interfaz: lo que obliga a pasar por acá es el
// proxy (cualquier ruta protegida redirige mientras la marca esté en true) y
// lo que valida todo es la Server Action. Es una página cliente (igual que
// /set-password) para que la confirmación final no se pierda por un
// re-render del servidor al cambiar las cookies de sesión.
export default function CambiarContrasenaPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [listo, setListo] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const [state, formAction, pending] = useActionState(cambiarContrasenaInicial, initialState)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        router.replace('/login')
        return
      }
      // Sin marca no corresponde estar acá (ya definió su contraseña).
      if (user.app_metadata?.must_change_password !== true) {
        router.replace('/')
        return
      }
      setEmail(user.email ?? null)
      setListo(true)
    })
  }, [supabase, router])

  function ingresarAlCurso() {
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/Logo Linkamp 003 - PNG.png" alt="Linkamp" className="h-12 w-auto mb-3" />
          <h1 className="text-[15px] font-medium text-gray-900">
            {state.ok ? 'Acceso activado' : 'Definí tu contraseña'}
          </h1>
        </div>

        {!listo && !state.ok && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-center text-[13px] text-gray-400">
            Verificando tu acceso...
          </div>
        )}

        {listo && !state.ok && (
          <form
            action={formAction}
            className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-4"
          >
            <p className="text-[13px] text-gray-600">
              Ingresaste con una contraseña temporal. Para continuar, definí tu propia contraseña
              {email ? (
                <>
                  {' '}
                  para <strong className="text-gray-900">{email}</strong>
                </>
              ) : null}
              .
            </p>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[12px] font-medium text-gray-700">
                Nueva contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className={inputClass}
              />
              <p className="text-[11px] text-gray-400">Mínimo 8 caracteres y distinta de la temporal.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmacion" className="text-[12px] font-medium text-gray-700">
                Confirmar contraseña
              </label>
              <input
                id="confirmacion"
                name="confirmacion"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className={inputClass}
              />
            </div>

            {state.error && <p className="text-[12px] text-red-600">{state.error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-[13px] font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              {pending ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>
        )}

        {state.ok && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col items-center gap-4 text-center">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-[15px] font-medium text-gray-900">¡Contraseña guardada!</h2>
            <p className="text-[13px] text-gray-600">
              Tu contraseña temporal ya no sirve. La próxima vez ingresá con tu email y la contraseña que
              acabás de definir.
            </p>
            <button
              type="button"
              onClick={ingresarAlCurso}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              Ingresar al curso
            </button>
          </div>
        )}

        {!state.ok && (
          <form action="/auth/logout" method="post" className="mt-4 text-center">
            <button type="submit" className="text-[12px] text-gray-400 hover:text-gray-600">
              Cerrar sesión
            </button>
          </form>
        )}

        <LegalFooter />
      </div>
    </div>
  )
}
