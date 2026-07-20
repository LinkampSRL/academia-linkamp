'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import {
  CalloutNota,
  CalloutAtencion,
  CalloutConsejo,
  CalloutResumen,
} from './SpecialBlocks'

// Transforma el Markdown antes de pasarlo a react-markdown:
// 1. Convierte bloques especiales: > **[NOTA]** → > [CALLOUT:NOTA]
// 2. Agrupa imagen + caption: ![alt](src)\n*caption* → ![alt|||caption](src)
function preprocessMarkdown(content: string): string {
  return content
    .replace(/^> \*\*\[NOTA\]\*\* /gm, '> [CALLOUT:NOTA] ')
    .replace(/^> \*\*\[ATENCION\]\*\* /gm, '> [CALLOUT:ATENCION] ')
    .replace(/^> \*\*\[CONSEJO\]\*\* /gm, '> [CALLOUT:CONSEJO] ')
    .replace(/^> \*\*\[RESUMEN\]\*\* /gm, '> [CALLOUT:RESUMEN] ')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)\n\*([^*\n]+)\*/g, '![$1|||$3]($2)')
}

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (node && typeof node === 'object' && 'props' in (node as object)) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>
    return extractText(el.props.children)
  }
  return ''
}

interface LightboxState {
  src: string
  caption: string
}

interface ModuleContentProps {
  content: string
}

export default function ModuleContent({ content }: ModuleContentProps) {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null)

  useEffect(() => {
    if (!lightbox) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox])

  const processed = preprocessMarkdown(content)

  const components: Components = {
    // Imágenes: card con borde, sombra y caption en footer; clic abre lightbox
    img({ src, alt }) {
      const srcStr = typeof src === 'string' ? src : ''
      const resolvedSrc = srcStr.replace('./imagenes/', '/imagenes/')
      const [altText, caption] = (alt ?? '').split('|||')
      // Imágenes 19a/19b (Módulo 2): fotos en formato retrato que a ancho completo
      // quedan desproporcionadamente altas frente al resto de fotos del curso.
      const esFotoCompacta =
        resolvedSrc.includes('imagen_19a_celda_ccd_columna') ||
        resolvedSrc.includes('imagen_19b_celda_cab_anillo') ||
        resolvedSrc.includes('imagen_17_celda_s_tsa') ||
        resolvedSrc.includes('imagen_18_montaje_celda_s') ||
        resolvedSrc.includes('imagen_20_celda_doble_viga_dvg')
      return (
        <span
          className="block my-6 cursor-zoom-in"
          onClick={() => setLightbox({ src: resolvedSrc, caption: caption ?? '' })}
        >
          <span
            className={`block border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-shadow hover:shadow-md${esFotoCompacta ? ' max-w-[280px] mx-auto' : ''}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolvedSrc}
              alt={altText ?? ''}
              className="w-full max-w-none h-auto block"
            />
            {caption && (
              <span className="block bg-gray-50 border-t border-gray-200 px-4 py-3 text-[12px] text-gray-500 italic leading-snug">
                {caption}
              </span>
            )}
          </span>
        </span>
      )
    },

    h3({ children }) {
      return <h3 data-spy-section>{children}</h3>
    },

    p({ children }) {
      return <p>{children}</p>
    },

    // Blockquote: detecta bloques especiales por marcador interno
    blockquote({ children }) {
      const text = extractText(children)

      if (text.includes('[CALLOUT:NOTA]')) {
        const cleaned = text.replace('[CALLOUT:NOTA] ', '').replace('[CALLOUT:NOTA]', '')
        return <CalloutNota>{cleaned}</CalloutNota>
      }
      if (text.includes('[CALLOUT:ATENCION]')) {
        const cleaned = text.replace('[CALLOUT:ATENCION] ', '').replace('[CALLOUT:ATENCION]', '')
        return <CalloutAtencion>{cleaned}</CalloutAtencion>
      }
      if (text.includes('[CALLOUT:CONSEJO]')) {
        const cleaned = text.replace('[CALLOUT:CONSEJO] ', '').replace('[CALLOUT:CONSEJO]', '')
        return <CalloutConsejo>{cleaned}</CalloutConsejo>
      }
      if (text.includes('[CALLOUT:RESUMEN]')) {
        const cleaned = text.replace('[CALLOUT:RESUMEN] ', '').replace('[CALLOUT:RESUMEN]', '')
        return <CalloutResumen>{cleaned}</CalloutResumen>
      }

      return (
        <blockquote className="border-l-4 border-gray-200 pl-4 my-4 text-gray-600 italic">
          {children}
        </blockquote>
      )
    },

    // Tabla: wrapper con borde y esquinas redondeadas
    table({ children }) {
      return (
        <span className="block my-6 border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full border-collapse text-[13px]">{children}</table>
        </span>
      )
    },

    thead({ children }) {
      return <thead className="bg-gray-50">{children}</thead>
    },

    th({ children }) {
      return (
        <th className="px-4 py-2.5 text-left text-[10px] font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
          {children}
        </th>
      )
    },

    td({ children }) {
      return (
        <td className="px-4 py-2.5 text-gray-700 border-b border-gray-100 last:border-b-0">
          {children}
        </td>
      )
    },

    tr({ children }) {
      return <tr className="last:border-b-0">{children}</tr>
    },

    hr() {
      return <hr className="my-8 border-gray-100" />
    },
  }

  return (
    <>
      <div className="prose prose-gray max-w-none prose-headings:font-medium prose-headings:text-gray-900 prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-base prose-h3:mt-12 prose-h3:mb-3 prose-p:text-gray-700 prose-p:leading-relaxed prose-li:text-gray-700 prose-strong:text-gray-900 prose-strong:font-medium">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {processed}
        </ReactMarkdown>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.src}
              alt={lightbox.caption}
              className="w-full h-auto rounded-lg shadow-2xl"
            />
            {lightbox.caption && (
              <p className="text-white/70 text-sm text-center mt-3">
                {lightbox.caption}
              </p>
            )}
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center text-white text-lg leading-none transition-colors"
              aria-label="Cerrar imagen"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}
