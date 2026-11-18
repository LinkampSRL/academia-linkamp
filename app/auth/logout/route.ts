import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  // 303 (See Other): el navegador sigue el redirect con GET. Con el 307 por
  // defecto reenviaba el POST a /login, que no acepta POST y respondía 405.
  return NextResponse.redirect(new URL('/login', request.url), 303)
}
