import Link from 'next/link'

interface TopbarProps {
  onMenuToggle?: () => void
  showDashboardLink?: boolean
}

export default function Topbar({ onMenuToggle, showDashboardLink }: TopbarProps) {
  return (
    <header className="flex items-center h-14 flex-shrink-0 bg-[#0F172A] border-b border-white/5">
      {/* Botón hamburguesa — solo visible en mobile */}
      {onMenuToggle && (
        <button
          onClick={onMenuToggle}
          className="md:hidden flex items-center justify-center w-14 h-14 flex-shrink-0 text-white/60 hover:text-white transition-colors"
          aria-label="Abrir menú"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      <div className="flex items-center px-5 border-r border-white/8 w-[300px] flex-shrink-0 gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/Logo Linkamp 003 - PNG.png"
          alt="Linkamp"
          className="h-9 w-auto flex-shrink-0"
        />
        <span className="text-white text-[13px] font-medium tracking-wide">
          Academia Linkamp
        </span>
      </div>

      <div className="flex-1 flex items-center justify-end px-5 gap-5">
        {showDashboardLink && (
          <Link
            href="/dashboard"
            className="text-white/60 hover:text-white text-[12px] font-medium transition-colors"
          >
            ← Dashboard
          </Link>
        )}
        <form action="/auth/logout" method="post">
          <button
            type="submit"
            className="text-white/60 hover:text-white text-[12px] font-medium transition-colors"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </header>
  )
}
