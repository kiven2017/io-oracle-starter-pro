import { ArrowRight, FileText } from 'lucide-react';
import { WalletButtons } from '@/components/wallet-buttons';

export function Hero() {
  return (
    <section className="relative z-10 px-6 pb-20 pt-48">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <div className="space-y-10">
          <div className="inline-flex items-center gap-3 rounded-full border border-cyan-500/10 bg-cyan-500/5 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-400">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" /> Infrastructure 2.0
          </div>
          <h1 className="font-heading text-6xl font-black leading-[0.98] tracking-[-0.05em] md:text-8xl">
            Defining <br />
            <span className="gradient-text">Physical Truth</span>
          </h1>
          <div className="max-w-2xl space-y-4">
            <p className="text-xl font-light leading-relaxed text-slate-300 md:text-2xl">
              The Oracle Infrastructure for Real-World Assets.
            </p>
            <p className="text-lg font-light leading-relaxed text-slate-400 md:text-xl">
              Build trust from hardware Root of Trust, device identity, and on-chain proof.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <button className="rounded-2xl bg-cyan-400 px-10 py-5 text-lg font-black uppercase tracking-tight text-black shadow-cyan transition hover:bg-cyan-300">
              <span className="inline-flex items-center gap-3">
                Join Presale <ArrowRight className="h-5 w-5" />
              </span>
            </button>
            <button className="rounded-2xl border border-white/10 bg-white/5 px-10 py-5 text-lg font-bold uppercase tracking-tight text-white transition hover:bg-white/10">
              <span className="inline-flex items-center gap-3">
                Read Whitepaper <FileText className="h-5 w-5 opacity-60" />
              </span>
            </button>
          </div>
          <WalletButtons />
        </div>
      </div>
    </section>
  );
}
