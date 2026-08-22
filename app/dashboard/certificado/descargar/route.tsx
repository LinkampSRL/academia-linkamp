import fs from 'node:fs'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/profile'
import { getCourse } from '@/lib/course'
import { CERTIFICADO_COLUMNAS, type Certificado } from '@/lib/certificado'
import CertificadoPDF from '@/lib/pdf/certificado-pdf'

const LOGO_PATH = path.join(process.cwd(), 'public', 'brand', 'Logo Linkamp 003 - PNG.png')
const LOGO_BUFFER = fs.readFileSync(LOGO_PATH)

// Vive bajo /dashboard/:path*, así que hereda la protección de sesión y
// vigencia de proxy.ts sin tocar el matcher. Resuelve siempre "el
// certificado del alumno de la sesión actual" — sin id en la URL, nada que
// un usuario pueda manipular para pedir el certificado de otro. El PDF se
// genera on-demand desde la fila ya emitida, nunca se guarda en disco ni en
// Storage; no recalcula nada desde profiles/curso.json/progreso/evaluaciones.
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return new NextResponse(null, { status: 404 })
  }

  const profile = await getProfile(supabase, user.id)
  if (!profile) {
    return new NextResponse(null, { status: 404 })
  }

  const course = getCourse()

  const { data: certificadoRow } = await supabase
    .from('certificados_emitidos')
    .select(CERTIFICADO_COLUMNAS)
    .eq('alumno_id', profile.id)
    .eq('curso_slug', course.slug)
    .maybeSingle()

  if (!certificadoRow) {
    return new NextResponse(null, { status: 404 })
  }

  const certificado = certificadoRow as unknown as Certificado

  // URL pública de verificación (Etapa 6): SITE_URL es la única fuente para
  // el dominio — nunca headers de la request, mismo criterio ya usado en
  // lib/admin/usuarios.ts para los enlaces de invitación. margin:4 = zona
  // de silencio estándar del QR (necesaria para que escanee bien), width:300
  // = resolución de impresión razonable aunque en el PDF se muestre chico
  // (56pt).
  const urlPublica = `${process.env.SITE_URL!}/certificados/${certificado.id}`
  const qrBuffer = await QRCode.toBuffer(urlPublica, {
    width: 300,
    margin: 4,
    errorCorrectionLevel: 'M',
  })

  const buffer = await renderToBuffer(
    <CertificadoPDF certificado={certificado} logoSrc={LOGO_BUFFER} qrSrc={qrBuffer} />
  )

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificado-${certificado.curso_slug}.pdf"`,
    },
  })
}
