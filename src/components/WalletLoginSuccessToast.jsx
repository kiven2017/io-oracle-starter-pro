import { CheckCircle2 } from 'lucide-react'

export default function WalletLoginSuccessToast({ open, title, message }) {
  if (!open) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-5 z-[210] flex justify-center px-4 sm:top-6">
      <div className="relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-emerald-400/30 bg-[#071122]/94 px-5 py-4 shadow-[0_24px_80px_rgba(6,182,212,0.18)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_58%)]" />
        <div className="relative flex items-start gap-3">
          <div className="mt-0.5 rounded-2xl border border-emerald-300/25 bg-emerald-400/12 p-2 text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-heading text-[0.7rem] font-black uppercase tracking-[0.28em] text-emerald-300/90">{title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-100 sm:text-[0.95rem]">{message}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
