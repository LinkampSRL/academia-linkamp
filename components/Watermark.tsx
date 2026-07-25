interface WatermarkProps {
  text?: string
}

// Marca de agua diagonal como background-image (SVG en data URI), tileado
// sobre el alto real del contenido. Reemplazar el prop `text` (hoy fijo en
// "LINKAMP") por el nombre del usuario autenticado no requiere tocar esta
// implementación, solo el valor que se le pasa desde CourseShell.
export default function Watermark({ text = 'LINKAMP' }: WatermarkProps) {
  const tile = 320

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${tile}" height="${tile}">
      <text
        x="${tile / 2}"
        y="${tile / 2}"
        font-family="Arial, sans-serif"
        font-size="34"
        font-weight="600"
        letter-spacing="4"
        fill="#94a3b8"
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(-45 ${tile / 2} ${tile / 2})"
      >${text}</text>
    </svg>
  `.trim()

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 select-none opacity-[0.045]"
      style={{
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: `${tile}px ${tile}px`,
      }}
    />
  )
}
