import Link from 'next/link'

// Footer chico y reutilizable con los links a /legal — Bloque 4 (MVP),
// sin checkbox ni registro de aceptación (decisión explícita: alcanza con
// enlaces visibles para este MVP).
export default function LegalFooter() {
  return (
    <footer className="mt-8 text-center">
      <p className="text-[11px] text-gray-400">
        <Link href="/legal#terminos" className="hover:text-gray-600 hover:underline">
          Términos de uso
        </Link>
        {' · '}
        <Link href="/legal#privacidad" className="hover:text-gray-600 hover:underline">
          Política de privacidad
        </Link>
      </p>
    </footer>
  )
}
