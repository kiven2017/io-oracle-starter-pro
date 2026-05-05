import { ArrowRight, FileText, ShieldCheck } from 'lucide-react'
import Reveal from '../Reveal'
import PresaleConsole from '../PresaleConsole'
import { useLocale } from '../../context/LocaleContext'

const AUDIT_LINKS = [
  {
    id: 'coinsult',
    name: 'Coinsult',
    href: 'https://app.coinsult.net/eth/0x1f999fe52fed5ded2228810b7ab781402fc34622',
  },
  {
    id: 'solidproof',
    name: 'SolidProof',
    href: 'https://app.solidproof.io/projects/deep-snitch',
  },
]

function CoinsultGlyph() {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[linear-gradient(135deg,#155e75,#14b8a6)] shadow-[0_8px_18px_rgba(20,184,166,0.22)]">
      <div className="flex h-4 w-4 items-center justify-center rounded-full border border-white/70 text-[9px] font-black text-white">C</div>
    </div>
  )
}

function SolidProofGlyph() {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/6 shadow-[0_8px_18px_rgba(148,163,184,0.12)]">
      <ShieldCheck className="h-4 w-4 text-white/90" strokeWidth={2.2} />
    </div>
  )
}

function AuditLink({ item }) {
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.035] px-3 py-2 text-sm font-semibold text-white/88 transition-all hover:border-cyan-400/25 hover:bg-white/[0.07] hover:text-white"
    >
      {item.id === 'coinsult' ? <CoinsultGlyph /> : <SolidProofGlyph />}
      <span className="tracking-tight">{item.name}</span>
    </a>
  )
}

export default function HeroSection({
  countdownText,
  onOpenPriceTable,
  scrollY,
  onJoinPresale,
  onWhitepaper,
  isWalletConnected = false,
  presaleProgressPercent = null,
  presaleRemainingAio = null,
  auditLinks = null,
}) {
  const { content, locale } = useLocale()
  const auditLead = locale.startsWith('zh') ? '安全審計報告' : 'Audited and approved by'
  const resolvedAuditLinks = Array.isArray(auditLinks) && auditLinks.length ? auditLinks : AUDIT_LINKS

  return (
    <section id="hero" className="relative z-10 overflow-hidden px-4 pb-20 pt-32 sm:px-6 sm:pb-24 sm:pt-36 lg:pb-32 lg:pt-44 xl:pb-40 xl:pt-52">
      <div className="hero-mesh" style={{ transform: `translate3d(0, ${scrollY * 0.1}px, 0)` }} />
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.04fr_0.96fr] lg:items-stretch lg:gap-16 xl:gap-20">
        <Reveal className="h-full">
          <div className="flex h-full flex-col space-y-8 sm:space-y-10 md:space-y-12 lg:justify-between">
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-500/10 bg-cyan-500/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400 sm:px-5 sm:text-[12px] md:text-[13px] md:tracking-[0.3em]">
              <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
              <span className="hero-breathing-copy">{content.hero.badge}</span>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <h1 className="font-heading brand-italic max-w-4xl overflow-visible text-[3.3rem] font-black leading-[0.98] tracking-tighter sm:text-[4.4rem] lg:text-[6.25rem] xl:text-[8rem]">
                {content.hero.titleLead} <br />
                <span className="inline-block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text pr-[0.08em] text-transparent">
                  {content.hero.titleHighlight}
                </span>
              </h1>
              <p className="max-w-xl text-base font-light leading-relaxed text-slate-400 sm:text-lg md:text-xl xl:text-2xl">
                {content.hero.description}
              </p>
            </div>

            <div
              className={
                isWalletConnected
                  ? 'flex flex-col pt-2 sm:flex-row sm:gap-5 sm:pt-4'
                  : 'flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:gap-5 sm:pt-4'
              }
            >
              {!isWalletConnected ? (
                <button
                  type="button"
                  onClick={onJoinPresale}
                  className="flex min-h-[3.6rem] w-full items-center justify-center gap-2 rounded-[1.35rem] bg-cyan-500 px-5 py-4 text-[0.96rem] font-black uppercase tracking-[0.04em] text-black shadow-2xl shadow-cyan-500/20 transition-all hover:bg-cyan-400 sm:min-h-0 sm:w-auto sm:gap-3 sm:rounded-2xl sm:px-10 sm:py-5 sm:text-lg sm:tracking-tight"
                >
                  {content.hero.heroPurchase ?? content.hero.joinPresale}
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={onWhitepaper}
                className="flex min-h-[3.6rem] w-full items-center justify-center gap-2 rounded-[1.35rem] border border-white/10 bg-white/5 px-5 py-4 text-[0.96rem] font-semibold uppercase tracking-[0.04em] text-white transition-all hover:bg-white/10 sm:min-h-0 sm:w-auto sm:gap-3 sm:rounded-2xl sm:px-10 sm:py-5 sm:text-lg sm:tracking-tight"
              >
                {content.hero.whitepaper}
                <FileText className="h-4 w-4 opacity-60 sm:h-5 sm:w-5" />
              </button>
            </div>

            <Reveal className="surface-panel relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/65 px-5 py-5 sm:rounded-[2.4rem] sm:px-7 sm:py-6">
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-white via-slate-200 to-slate-300" />
              <p className="pl-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-400 sm:text-sm sm:tracking-[0.28em] md:text-base">
                {content.hero.industriesLabel}
              </p>
              <p className="mt-4 pl-4 text-[1.45rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-[1.8rem] md:text-[2.15rem] xl:text-[2.35rem]">
                {content.heroIndustries.join(' | ')}
              </p>
            </Reveal>

            <div className="flex flex-col gap-3 pl-1 sm:flex-row sm:items-center sm:justify-start sm:gap-4 sm:pl-2">
              <p className="text-sm font-medium text-slate-500 sm:text-[1rem]">{auditLead}</p>
              <div className="flex flex-wrap items-center gap-2">
                {resolvedAuditLinks.map((item) => (
                  <AuditLink key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="relative h-full" delay={150}>
          <PresaleConsole
            countdownText={countdownText}
            onOpenPriceTable={onOpenPriceTable}
            presaleProgressPercent={presaleProgressPercent}
            presaleRemainingAio={presaleRemainingAio}
          />
        </Reveal>
      </div>
    </section>
  )
}
