import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Privacidad | Academia Linkamp',
}

// Página pública (fuera del matcher de proxy.ts, sin login) — Bloque 4
// del cierre del MVP. Contenido estático, sin acceso a datos. Sin
// checkbox ni registro de aceptación — decisión explícita: alcanza con
// enlaces visibles para este MVP (ver LegalFooter.tsx, usado desde
// /login, /set-password, el dashboard y /certificados/[codigo]).
const FECHA_ACTUALIZACION = '22/08/2026'
const EMAIL_CONTACTO = 'info@linkampgroup.com'

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[820px] mx-auto px-6 py-12">
        <h1 className="text-[22px] font-medium text-gray-900 mb-10">
          Términos y Privacidad — Academia Linkamp
        </h1>

        <section id="terminos" className="mb-16 scroll-mt-8">
          <h2 className="text-[18px] font-medium text-gray-900 mb-1">Términos de Uso</h2>
          <p className="text-[12px] text-gray-400 mb-6">Última actualización: {FECHA_ACTUALIZACION}</p>

          <p className="text-[14px] text-gray-700 leading-relaxed mb-8">
            Academia Linkamp es una plataforma de capacitación técnica online operada por Linkamp
            Precisión SRL, destinada a clientes y técnicos de Linkamp Precisión.
          </p>

          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-[14px] font-medium text-gray-900 mb-1.5">1. Acceso a la plataforma</h3>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                El acceso es personal e intransferible y se otorga a través de un alumno dado de alta
                por el administrador de la plataforma, con una vigencia definida al momento del alta.
                Vencido ese plazo, o en caso de desactivación de la cuenta, el acceso puede
                suspenderse.
              </p>
            </div>

            <div>
              <h3 className="text-[14px] font-medium text-gray-900 mb-1.5">2. Uso del contenido</h3>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                El contenido del curso (textos, imágenes, evaluaciones y demás materiales) es
                propiedad de Linkamp Precisión SRL y se entrega para uso personal del alumno dentro
                de la plataforma. No está permitido compartir las credenciales de acceso ni
                redistribuir, copiar o publicar el contenido por fuera de Academia Linkamp.
              </p>
            </div>

            <div>
              <h3 className="text-[14px] font-medium text-gray-900 mb-1.5">3. Evaluaciones y certificado</h3>
              <p className="text-[13px] text-gray-600 leading-relaxed mb-2">
                Al completar los módulos del curso y aprobar las evaluaciones correspondientes, el
                alumno puede generar un certificado de finalización:
              </p>
              <p className="text-[13px] text-gray-600 leading-relaxed italic border-l-2 border-gray-200 pl-3">
                &quot;Certificado de capacitación privada. No constituye título oficial ni habilitación
                profesional.&quot;
              </p>
            </div>

            <div>
              <h3 className="text-[14px] font-medium text-gray-900 mb-1.5">4. Contratación y pago</h3>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                La contratación del curso y las condiciones comerciales (precio, forma de pago,
                facturación) se acuerdan directamente con Linkamp Precisión SRL, por fuera de esta
                plataforma. Academia Linkamp no procesa pagos ni gestiona cobros.
              </p>
            </div>

            <div>
              <h3 className="text-[14px] font-medium text-gray-900 mb-1.5">5. Disponibilidad del servicio</h3>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                Linkamp Precisión SRL hace sus mejores esfuerzos para mantener la plataforma
                disponible y funcionando correctamente, pero no garantiza disponibilidad
                ininterrumpida.
              </p>
            </div>

            <div>
              <h3 className="text-[14px] font-medium text-gray-900 mb-1.5">6. Contacto</h3>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                Ante cualquier consulta sobre estos términos, podés escribir a{' '}
                <a href={`mailto:${EMAIL_CONTACTO}`} className="text-blue-600 hover:underline">
                  {EMAIL_CONTACTO}
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        <section id="privacidad" className="scroll-mt-8">
          <h2 className="text-[18px] font-medium text-gray-900 mb-1">Política de Privacidad</h2>
          <p className="text-[12px] text-gray-400 mb-6">Última actualización: {FECHA_ACTUALIZACION}</p>

          <p className="text-[14px] text-gray-700 leading-relaxed mb-8">
            Linkamp Precisión SRL es responsable del tratamiento de los datos personales que se
            procesan en Academia Linkamp.
          </p>

          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-[14px] font-medium text-gray-900 mb-1.5">1. Qué datos recolectamos</h3>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                Nombre, apellido, empresa (si corresponde) y email, provistos al momento del alta de
                tu cuenta; además, tu progreso en el curso, los resultados de tus evaluaciones y los
                certificados que emitas.
              </p>
            </div>

            <div>
              <h3 className="text-[14px] font-medium text-gray-900 mb-1.5">2. Para qué los usamos</h3>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                Para darte acceso al curso, hacer seguimiento de tu progreso, emitir tu certificado de
                finalización cuando corresponda, y gestionar tu cuenta (activación, vigencia,
                comunicaciones relacionadas con el curso).
              </p>
            </div>

            <div>
              <h3 className="text-[14px] font-medium text-gray-900 mb-1.5">3. Dónde se almacenan</h3>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                En servicios de infraestructura en la nube contratados por Linkamp Precisión SRL para
                operar la plataforma.
              </p>
            </div>

            <div>
              <h3 className="text-[14px] font-medium text-gray-900 mb-1.5">
                4. Certificados y verificación pública
              </h3>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                Cuando generás tu certificado de finalización, se crea un registro identificado con un
                código único. Cualquier persona que acceda al enlace de verificación de ese
                certificado (por ejemplo, escaneando el código QR del PDF) va a poder ver tu{' '}
                <strong className="text-gray-900">
                  nombre completo, el curso realizado y las fechas de finalización y emisión
                </strong>
                . No se muestran tu email, tu empresa ni ningún otro dato. Este enlace existe para que
                un tercero (por ejemplo, un empleador) pueda confirmar que el certificado es
                auténtico.
              </p>
            </div>

            <div>
              <h3 className="text-[14px] font-medium text-gray-900 mb-1.5">
                5. Con quién compartimos tus datos
              </h3>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                No vendemos tus datos personales. Para operar Academia Linkamp utilizamos
                proveedores de infraestructura tecnológica que pueden procesar los datos necesarios
                para prestar el servicio. Fuera de esos casos, de la verificación pública de
                certificados descripta anteriormente y de obligaciones legales aplicables, no
                compartimos tus datos personales con terceros.
              </p>
            </div>

            <div>
              <h3 className="text-[14px] font-medium text-gray-900 mb-1.5">6. Tus derechos</h3>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                Podés solicitar acceder, corregir o pedir la eliminación de tus datos personales
                escribiendo a{' '}
                <a href={`mailto:${EMAIL_CONTACTO}`} className="text-blue-600 hover:underline">
                  {EMAIL_CONTACTO}
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
