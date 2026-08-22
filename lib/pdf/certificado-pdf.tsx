import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import type { Certificado } from '@/lib/certificado'

interface CertificadoPDFProps {
  certificado: Certificado
  // Buffer del logo ya leído del filesystem — @react-pdf/renderer resuelve
  // un `src` string vía fetch() (red), lo que falla en silencio para una
  // ruta local de archivo. Con { data, format } no depende de red.
  logoSrc: Buffer
}

// Genera el PDF exclusivamente a partir de la fila ya emitida de
// certificados_emitidos — nunca recalcula nombre, curso, carga horaria ni
// fechas desde profiles/curso.json/progreso/evaluaciones. Cada campo que
// aparece acá es un valor congelado que ya vive en `certificado`.
function formatFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const AZUL = '#1D4ED8'
const OSCURO = '#0F172A'
const GRIS = '#6B7280'
const GRIS_CLARO = '#9CA3AF'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  // Elemento visual/institucional, no de seguridad — se coloca antes que
  // `marco` en el JSX para quedar detrás de todo el contenido (en
  // @react-pdf/renderer el orden de declaración define el z-order). Usa la
  // prop `fixed` (ver más abajo en el JSX): un texto grande y rotado dentro
  // de un View absoluto igual puede contarse en el cálculo de paginación de
  // @react-pdf/renderer y generar una página en blanco de más — `fixed` lo
  // saca por completo del flujo del documento, que es el mecanismo pensado
  // específicamente para este caso (headers/footers/watermarks).
  marcaAguaWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  marcaAguaTexto: {
    fontSize: 110,
    fontFamily: 'Helvetica-Bold',
    color: OSCURO,
    letterSpacing: 4,
    opacity: 0.06,
    transform: 'rotate(-45deg)',
  },
  marco: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: AZUL,
    paddingVertical: 36,
    paddingHorizontal: 56,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logo: {
    height: 56,
    marginBottom: 18,
    objectFit: 'contain',
  },
  titulo: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: OSCURO,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  divisor: {
    width: 90,
    height: 2,
    backgroundColor: AZUL,
    marginTop: 14,
    marginBottom: 26,
  },
  leadIn: {
    fontSize: 12,
    color: GRIS,
    textAlign: 'center',
    marginBottom: 10,
  },
  nombre: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: OSCURO,
    textAlign: 'center',
    marginBottom: 14,
  },
  parrafo: {
    fontSize: 13,
    color: OSCURO,
    textAlign: 'center',
    lineHeight: 1.5,
    maxWidth: 460,
    marginBottom: 26,
  },
  detalles: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 28,
  },
  detalleItem: {
    fontSize: 10,
    color: GRIS,
  },
  detalleSeparador: {
    fontSize: 10,
    color: GRIS_CLARO,
  },
  emisorBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 'auto',
  },
  emisorNombre: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: OSCURO,
  },
  emisorSub: {
    fontSize: 10,
    color: GRIS,
    marginTop: 2,
  },
  footer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 20,
  },
  leyendaBox: {
    borderTopWidth: 0.75,
    borderTopColor: GRIS_CLARO,
    paddingTop: 12,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  leyenda: {
    fontSize: 10,
    color: GRIS,
    textAlign: 'center',
  },
  uuid: {
    fontSize: 7,
    color: GRIS_CLARO,
    marginTop: 10,
  },
})

export default function CertificadoPDF({ certificado, logoSrc }: CertificadoPDFProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.marcaAguaWrap} fixed>
          <Text style={styles.marcaAguaTexto}>LINKAMP</Text>
        </View>

        <View style={styles.marco}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- Image acá es el componente de @react-pdf/renderer (renderiza a PDF), no un <img> HTML; no tiene prop alt. */}
          <Image src={{ data: logoSrc, format: 'png' }} style={styles.logo} />

          <Text style={styles.titulo}>CERTIFICADO DE FINALIZACIÓN Y APROBACIÓN</Text>
          <View style={styles.divisor} />

          <Text style={styles.leadIn}>
            Linkamp Precisión SRL, a través de Academia Linkamp, certifica que
          </Text>
          <Text style={styles.nombre}>{certificado.nombre_completo}</Text>
          {/* hyphenationCallback: @react-pdf/renderer parte palabras largas con
              guion por defecto (ej. "Manten-imiento"). Devolver la palabra
              entera como única "sílaba" desactiva ese corte — el salto de
              línea solo puede caer entre palabras, nunca dentro de una. */}
          <Text style={styles.parrafo} hyphenationCallback={(word) => [word]}>
            ha completado y aprobado satisfactoriamente el curso {certificado.curso_titulo}, cumpliendo
            con los requisitos de formación y evaluación establecidos para esta capacitación.
          </Text>

          <View style={styles.detalles}>
            <Text style={styles.detalleItem}>Carga horaria: {certificado.carga_horaria_horas} horas</Text>
            <Text style={styles.detalleSeparador}>·</Text>
            <Text style={styles.detalleItem}>
              Finalizado el {formatFecha(certificado.fecha_finalizacion)}
            </Text>
            <Text style={styles.detalleSeparador}>·</Text>
            <Text style={styles.detalleItem}>Emitido el {formatFecha(certificado.fecha_emision)}</Text>
          </View>

          <View style={styles.emisorBlock}>
            <Text style={styles.emisorNombre}>{certificado.emisor}</Text>
            <Text style={styles.emisorSub}>Academia Linkamp</Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.leyendaBox}>
              <Text style={styles.leyenda}>
                Certificado de capacitación privada. No constituye título oficial ni habilitación
                profesional.
              </Text>
            </View>
            <Text style={styles.uuid}>Certificado N.º {certificado.id}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
