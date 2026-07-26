'use client'

import { useActionState } from 'react'
import { login, type LoginState } from './actions'

const initialState: LoginState = { error: null }

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/Logo Linkamp 003 - PNG.png"
            alt="Linkamp"
            className="h-12 w-auto mb-3"
          />
          <h1 className="text-[15px] font-medium text-gray-900">Academia Linkamp</h1>
        </div>

        <form
          action={formAction}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[12px] font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-3 py-2 text-[14px] text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[12px] font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 text-[14px] text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>

          {state.error && <p className="text-[12px] text-red-600">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-[13px] font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            {pending ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
