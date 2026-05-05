export default function GlobalLoader({ active, label, message }) {
  return (
    <div
      className={`global-loader fixed inset-0 z-[200] flex items-center justify-center px-6 transition-all duration-500 ${
        active ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-hidden={!active}
    >
      <div className="global-loader__backdrop absolute inset-0 bg-[#020617]/72 backdrop-blur-md" />
      <div className="global-loader__halo absolute h-[16rem] w-[16rem] rounded-full bg-cyan-500/8 blur-3xl" />
      <div className="global-loader__panel relative flex flex-col items-center gap-5 text-center">
        <div className="global-loader__shell-wrap relative h-36 w-36">
          <svg
            viewBox="0 0 144 144"
            aria-hidden="true"
            className="global-loader__track-shell pointer-events-none absolute inset-0"
          >
            <defs>
              <filter id="loader-track-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="2.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="loader-track-gradient" x1="18" y1="18" x2="126" y2="126" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="rgba(103,232,249,0.55)" />
                <stop offset="55%" stopColor="rgba(255,255,255,0.98)" />
                <stop offset="100%" stopColor="rgba(59,130,246,0.58)" />
              </linearGradient>
            </defs>
            <rect
              x="16"
              y="16"
              width="112"
              height="112"
              rx="34"
              pathLength="100"
              className="global-loader__track-base"
            />
            <rect
              x="16"
              y="16"
              width="112"
              height="112"
              rx="34"
              pathLength="100"
              className="global-loader__track-glow"
              filter="url(#loader-track-glow)"
              stroke="url(#loader-track-gradient)"
            />
            <rect
              x="16"
              y="16"
              width="112"
              height="112"
              rx="34"
              pathLength="100"
              className="global-loader__track-trace"
              stroke="url(#loader-track-gradient)"
            />
          </svg>
          <div className="global-loader__logo-shell absolute inset-[1.15rem] z-10 flex items-center justify-center rounded-[2rem] border border-white/10 bg-[#071122]/94 shadow-[0_0_60px_rgba(34,211,238,0.08)]">
            <img src="/logo.png" alt={label} className="relative z-10 h-16 w-16 object-contain" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="font-heading text-xl font-black uppercase tracking-[0.22em] text-white">{label}</p>
          <p className="max-w-xs text-sm leading-6 text-slate-300">{message}</p>
        </div>
      </div>
    </div>
  )
}
