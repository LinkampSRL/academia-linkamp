const MOTIVOS: Record<string, { titulo: string; mensaje: string }> = {
  desactivado: {
    titulo: 'Cuenta desactivada',
    mensaje: 'Tu cuenta fue desactivada. Contactá a Linkamp Precisión para más información.',
  },
  vencido: {
    titulo: 'Acceso vencido',
    mensaje: 'Tu acceso al curso venció. Contactá a Linkamp Precisión para renovarlo.',
  },
  no_iniciado: {
    titulo: 'Acceso aún no habilitado',
    mensaje: 'Tu acceso al curso todavía no comenzó. Contactá a Linkamp Precisión para más información.',
  },
  sin_perfil: {
    titulo: 'Perfil no encontrado',
    mensaje: 'No encontramos un perfil asociado a tu cuenta. Contactá a Linkamp Precisión.',
  },
  no_autorizado: {
    titulo: 'Acceso no autorizado',
    mensaje: 'No tenés permisos para acceder a esta sección.',
  },
  invitacion_invalida: {
    titulo: 'Invitación inválida',
    mensaje: 'Tu link de invitación no es válido o ya expiró. Pedile al administrador que te reenvíe el acceso.',
  },
}

const DEFAULT = {
  titulo: 'Acceso restringido',
  mensaje: 'No tenés acceso a esta sección.',
}

export default async function AccesoRestringidoPage({
  searchParams,
}: {
  searchParams: Promise<{ motivo?: string }>
}) {
  const { motivo } = await searchParams
  const { titulo, mensaje } = (motivo && MOTIVOS[motivo]) || DEFAULT

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col items-center gap-4 text-center">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
            </svg>
          </div>

          <h1 className="text-[15px] font-medium text-gray-900">{titulo}</h1>
          <p className="text-[13px] text-gray-500">{mensaje}</p>

          <form action="/auth/logout" method="post" className="w-full pt-2">
            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white text-[13px] font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
