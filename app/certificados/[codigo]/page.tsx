import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { CERTIFICADO_COLUMNAS, esUuidValido, type Certificado } from '@/lib/certificado'

export const metadata: Metadata = {
  title: 'Verificación de certificado | Academia Linkamp',
}

function formatFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Página pública (fuera del matcher de proxy.ts, sin login) — Etapa 6. Lee
// con service_role, select explícito, nunca alumno_id (CERTIFICADO_COLUMNAS
// ya lo excluye por diseño desde la Etapa 3). Formato inválido o UUID
// inexistente muestran exactamente el mismo mensaje neutro, para no dar
// ninguna señal que distinga "mal escrito" de "borrado" (nunca debería
// borrarse, pero es buena práctica no diferenciarlo).
export default async function VerificacionCertificadoPage({
  params,
}: {
  params: Promise<{ codigo: string }>
}) {
  const { codigo } = await params

  let certificado: Certificado | null = null

  if (esUuidValido(codigo)) {
    const admin = createAdminClient()
    const { data } = await admin
      .from('certificados_emitidos')
      .select(CERTIFICADO_COLUMNAS)
      .eq('id', codigo)
      .maybeSingle()
    certificado = (data as unknown as Certificado) ?? null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/Logo Linkamp 003 - PNG.png" alt="Linkamp" className="h-12 w-auto mb-3" />
          <h1 className="text-[15px] font-medium text-gray-900">Academia Linkamp</h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col items-center gap-3 text-center">
          {certificado ? (
            <>
              <p className="text-[13px] font-medium text-green-700">
                ✓ Certificado válido, emitido por Academia Linkamp.
              </p>
              <div className="flex flex-col gap-0.5 mt-1">
                <p className="text-[17px] font-medium text-gray-900">{certificado.nombre_completo}</p>
                <p className="text-[13px] text-gray-600">{certificado.curso_titulo}</p>
              </div>
              <div className="text-[12px] text-gray-500 flex flex-col gap-0.5 mt-1">
                <p>Finalizado el {formatFecha(certificado.fecha_finalizacion)}</p>
                <p>Emitido el {formatFecha(certificado.fecha_emision)}</p>
                <p>{certificado.emisor}</p>
              </div>
              <p className="text-[11px] text-gray-400 mt-3">
                Certificado de capacitación privada. No constituye título oficial ni habilitación
                profesional.
              </p>
              <p className="text-[10px] text-gray-300 mt-1">N.º {certificado.id}</p>
            </>
          ) : (
            <p className="text-[13px] text-gray-600">Certificado no encontrado o inválido.</p>
          )}
        </div>
      </div>
    </div>
  )
}
