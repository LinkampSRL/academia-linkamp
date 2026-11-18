import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getProfile } from '@/lib/profile'

// Sprint 5.3 (+ Sprint 5.4 Etapa 4A): además de "¿hay sesión?", resuelve
// autorización según `profiles`: admin siempre pasa; alumno requiere
// estar activo, con fecha_inicio ya alcanzada y fecha_vencimiento no
// vencida; /admin es exclusivo de admin; sin fila de profile, acceso
// denegado. /acceso-restringido, /login y /auth/* quedan fuera del
// `matcher` a propósito — el proxy nunca corre ahí, así que ningún
// destino de redirect puede generar un loop.
function accesoRestringido(request: NextRequest, motivo: string) {
  const url = new URL('/acceso-restringido', request.url)
  url.searchParams.set('motivo', motivo)
  return NextResponse.redirect(url)
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Contraseña temporal sin cambiar: nada del sitio protegido está
  // disponible hasta definir la contraseña propia. getUser() revalida contra
  // Supabase Auth en cada request, así que la marca es siempre la actual:
  // una regeneración de acceso obliga también a una sesión ya abierta. La
  // marca vive en app_metadata, que el alumno no puede modificar. Va antes
  // de cualquier otro chequeo (rol, vigencia) y /cambiar-contrasena está
  // fuera del `matcher`, así que no puede haber un loop.
  if (user.app_metadata?.must_change_password === true) {
    return NextResponse.redirect(new URL('/cambiar-contrasena', request.url))
  }

  const profile = await getProfile(supabase, user.id)

  if (!profile) {
    return accesoRestringido(request, 'sin_perfil')
  }

  if (profile.rol === 'admin') {
    return response
  }

  // A partir de acá, rol === 'alumno'.
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return accesoRestringido(request, 'no_autorizado')
  }

  if (!profile.activo) {
    return accesoRestringido(request, 'desactivado')
  }

  if (profile.fecha_inicio && new Date(profile.fecha_inicio).getTime() > Date.now()) {
    return accesoRestringido(request, 'no_iniciado')
  }

  if (profile.fecha_vencimiento && new Date(profile.fecha_vencimiento).getTime() < Date.now()) {
    return accesoRestringido(request, 'vencido')
  }

  return response
}

export const config = {
  matcher: ['/', '/curso/:path*', '/dashboard/:path*', '/admin/:path*'],
}
