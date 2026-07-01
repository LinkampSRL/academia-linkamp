interface CalloutProps {
  children: React.ReactNode
}

export function CalloutNota({ children }: CalloutProps) {
  return (
    <div className="flex gap-3 p-4 my-5 rounded-lg bg-blue-50 border border-blue-200">
      <div className="flex-shrink-0 mt-0.5">
        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-blue-700 uppercase tracking-wider mb-1">Nota técnica</p>
        <div className="text-[13px] leading-relaxed text-blue-800">{children}</div>
      </div>
    </div>
  )
}

export function CalloutAtencion({ children }: CalloutProps) {
  return (
    <div className="flex gap-3 p-4 my-5 rounded-lg bg-amber-50 border border-amber-200">
      <div className="flex-shrink-0 mt-0.5">
        <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-amber-700 uppercase tracking-wider mb-1">Atención</p>
        <div className="text-[13px] leading-relaxed text-amber-900">{children}</div>
      </div>
    </div>
  )
}

export function CalloutConsejo({ children }: CalloutProps) {
  return (
    <div className="flex gap-3 p-4 my-5 rounded-lg bg-emerald-50 border border-emerald-200">
      <div className="flex-shrink-0 mt-0.5">
        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider mb-1">Consejo práctico</p>
        <div className="text-[13px] leading-relaxed text-emerald-900">{children}</div>
      </div>
    </div>
  )
}

export function CalloutResumen({ children }: CalloutProps) {
  return (
    <div className="flex gap-3 p-4 my-5 rounded-lg bg-violet-50 border border-violet-200">
      <div className="flex-shrink-0 mt-0.5">
        <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-violet-700 uppercase tracking-wider mb-1">Resumen</p>
        <div className="text-[13px] leading-relaxed text-violet-900">{children}</div>
      </div>
    </div>
  )
}
