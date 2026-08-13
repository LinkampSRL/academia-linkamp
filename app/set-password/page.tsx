'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const inputClass =
  'w-full px-3 py-2 text-[14px] text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500'

type Estado = 'verificando' | 'valido' | 'invalido'

const MENSAJE_INVALIDO =
  'Tu link de invitación no es válido o ya expiró. Pedile al administrador que te reenvíe el acceso.'

export default function SetPasswordPage() {
  const router = useRouter()
  // Una sola instancia del browser client para todo el ciclo de vida.
  const [supabase] = useState(() => createClient())
  const [estado, setEstado] = useState<Estado>('verificando')
  const [email, setEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    // La sesión ya la estableció /auth/confirm server-side (verifyOtp)
    // antes de llegar acá — no se depende de detectSessionInUrl ni de
    // tokens en el fragment de la URL. getUser() revalida contra
    // Supabase, no confía solo en lo que haya en storage local.
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error || !user) {
        setEstado('invalido')
        return
      }
      setEmail(user.email ?? null)
      setUserId(user.id)
      setEstado('valido')
    })
  }, [supabase])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirmacion) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setPending(true)

    // Re-confirmamos identidad justo antes de escribir: tiene que seguir
    // siendo el mismo usuario que se mostró en pantalla. Si cambió o
    // desapareció, se aborta sin llamar a updateUser.
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser()

    if (getUserError || !user || user.id !== userId) {
      setPending(false)
      setEstado('invalido')
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password })
    setPending(false)

    if (updateError) {
      setError('No se pudo guardar la contraseña. Intentá de nuevo.')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/Logo Linkamp 003 - PNG.png" alt="Linkamp" className="h-12 w-auto mb-3" />
          <h1 className="text-[15px] font-medium text-gray-900">Definí tu contraseña</h1>
        </div>

        {estado === 'verificando' && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-center text-[13px] text-gray-400">
            Verificando tu invitación...
          </div>
        )}

        {estado === 'invalido' && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-center text-[13px] text-red-600">
            {MENSAJE_INVALIDO}
          </div>
        )}

        {estado === 'valido' && (
          <form
            onSubmit={onSubmit}
            className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-4"
          >
            <p className="text-[13px] text-gray-600">
              Vas a definir la contraseña para: <strong className="text-gray-900">{email}</strong>
            </p>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[12px] font-medium text-gray-700">
                Nueva contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmacion" className="text-[12px] font-medium text-gray-700">
                Confirmar contraseña
              </label>
              <input
                id="confirmacion"
                type="password"
                required
                autoComplete="new-password"
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                className={inputClass}
              />
            </div>

            {error && <p className="text-[12px] text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-[13px] font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              {pending ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
