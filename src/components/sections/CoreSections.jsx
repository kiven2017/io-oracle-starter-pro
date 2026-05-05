import {
  Cpu,
  Download,
  FileCheck,
  FileText,
  Flame,
  Microchip,
  Plug,
  Share2,
  Shield,
  ShieldCheck,
  Shuffle,
} from 'lucide-react'
import AvatarImage from '../AvatarImage'
import Reveal from '../Reveal'
import { useLocale } from '../../context/LocaleContext'

const whitepaperIcons = [Shield, Cpu, Flame, Share2]
const techIcons = [Microchip, Plug, Shuffle]

export default function CoreSections({ onJoinPresale }) {
  const { content } = useLocale()

  return (
    <>
      <section id="experts" className="apple-spacer border-t border-white/5 bg-slate-900/10 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto mb-14 space-y-4 text-center sm:mb-18 lg:mb-24">
            <div className="brand-italic mx-auto inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-400 sm:text-xs sm:tracking-[0.4em]">
              <ShieldCheck className="h-4 w-4" />
              {content.coreSection.badge}
            </div>
            <h2 className="font-heading brand-italic text-center text-4xl font-black uppercase tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              {content.coreSection.title}
            </h2>
            <p className="font-heading brand-italic mx-auto text-center text-sm font-light uppercase tracking-[0.18em] text-slate-400 sm:text-base sm:tracking-[0.3em] lg:text-lg">
              {content.coreSection.subtitle}
            </p>
          </Reveal>

          <div className="mx-auto grid max-w-6xl gap-6 sm:gap-8 md:grid-cols-2 xl:grid-cols-3 xl:gap-10">
            {content.teamMembers.map((member, index) => (
              <Reveal key={member.name} delay={index * 90} className="h-full">
                <div className="glass h-full rounded-[2rem] border border-white/10 p-6 text-center sm:rounded-[2.4rem] sm:p-8">
                  <div className="glass mx-auto mb-6 h-28 w-28 overflow-hidden rounded-full border border-white/10 ring-8 ring-cyan-500/5 sm:mb-8 sm:h-36 sm:w-36 md:h-40 md:w-40">
                    <AvatarImage
                      src={member.src}
                      name={member.name}
                      initials={member.initials}
                      colors={member.gradient}
                      alt={member.name}
                      className="expert-media h-full w-full object-cover"
                    />
                  </div>
                  <h4 className="font-heading brand-italic text-xl font-black uppercase sm:text-2xl">{member.name}</h4>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-500 underline decoration-cyan-500/30 underline-offset-4 sm:tracking-widest">
                    {member.title}
                  </p>
                  <div className="mt-6 space-y-5 border-t border-white/10 pt-6 text-left font-sans sm:mt-8">
                    <p className="text-sm font-light leading-relaxed text-slate-300">
                      {member.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="durian" className="apple-spacer relative overflow-hidden border-y border-white/5 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-14 space-y-4 text-center sm:mb-18 lg:mb-24">
            <h2 className="font-heading brand-italic text-3xl font-black uppercase tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              {content.durianSection.title}{' '}
              <span className="brand-italic text-cyan-400 underline decoration-cyan-500/20 underline-offset-8">
                {content.durianSection.highlight}
              </span>
            </h2>
            <p className="text-base font-light uppercase tracking-[0.16em] text-slate-400 sm:text-lg sm:tracking-widest md:text-xl">
              {content.durianSection.subtitle}
            </p>
          </Reveal>

          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14 xl:gap-20">
            <div className="brand-italic space-y-5 sm:space-y-6 lg:space-y-8">
              {content.proofSteps.map((step, index) => (
                <Reveal
                  key={step.title}
                  delay={index * 80}
                  className={`glass rounded-[1.8rem] border-l-4 ${step.border} p-5 sm:rounded-3xl sm:p-8`}
                >
                  <h4 className="font-heading text-lg font-black uppercase sm:text-xl">{step.title}</h4>
                  <p className="mt-2 font-sans text-sm font-light leading-relaxed text-slate-400">
                    {step.description}
                  </p>
                </Reveal>
              ))}
            </div>

            <Reveal className="surface-panel glass neon-cyan relative space-y-6 overflow-hidden rounded-[2.2rem] p-6 text-[11px] font-mono sm:rounded-[3rem] sm:p-8 lg:rounded-[4rem] lg:p-10">
              <div className="absolute right-0 top-0 p-6 opacity-5 sm:p-10">
                <FileCheck className="h-40 w-40 sm:h-52 sm:w-52 lg:h-64 lg:w-64" />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-6 sm:pb-8">
                <h4 className="font-heading brand-italic text-sm font-bold uppercase tracking-[0.2em] text-cyan-400 sm:text-base sm:tracking-widest">
                  {content.durianSection.proofCard.title}
                </h4>
                <span className="text-[10px] text-slate-500">{content.durianSection.proofCard.reference}</span>
              </div>
              <div className="space-y-5 text-slate-300">
                <div className="flex justify-between uppercase">
                  <span>{content.durianSection.proofCard.deviceDid}</span>
                  <span className="font-bold text-white">did:aio:tha_dur_881</span>
                </div>
                <div className="flex justify-between uppercase">
                  <span>{content.durianSection.proofCard.verifiedRange}</span>
                  <span className="text-green-400">{content.durianSection.proofCard.verifiedRangeValue}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="shrink-0 uppercase">{content.durianSection.proofCard.hashProof}</span>
                  <span className="truncate rounded bg-white/5 p-2 text-[9px] tracking-tighter">
                    0x4c2f88...912fbb
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onJoinPresale}
                className="brand-italic w-full rounded-3xl border border-cyan-500/30 bg-cyan-500/10 py-5 font-black uppercase tracking-widest text-cyan-400 transition-all hover:bg-cyan-500 hover:text-black"
              >
                {content.durianSection.proofCard.button}
              </button>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="whitepaper" className="apple-spacer bg-slate-900/20 px-4 font-heading sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Reveal className="brand-italic mx-auto mb-14 space-y-5 text-center sm:mb-18 sm:space-y-6 lg:mb-24">
            <div className="mx-auto inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-400 sm:text-xs sm:tracking-[0.4em]">
              <FileText className="h-4 w-4" />
              {content.whitepaperSection.badge}
            </div>
            <h2 className="text-center text-4xl font-black uppercase tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              {content.whitepaperSection.title}{' '}
              <span className="text-cyan-400 underline decoration-cyan-500/20 underline-offset-8">
                {content.whitepaperSection.highlight}
              </span>
            </h2>
            <p className="mx-auto max-w-5xl text-center text-lg font-light text-slate-400 underline decoration-white/5 underline-offset-8 sm:text-xl md:text-2xl">
              {content.whitepaperSection.quote}
            </p>
            <div className="pt-6 font-sans not-italic">
              <a
                href={content.whitepaperDownload.href}
                download={content.whitepaperDownload.download}
                className="mx-auto flex items-center gap-3 border-b-2 border-cyan-500/20 pb-2 text-sm font-black uppercase tracking-widest text-cyan-400 transition-colors hover:text-white"
              >
                {content.whitepaperSection.download}
                <Download className="h-5 w-5" />
              </a>
            </div>
          </Reveal>

          <div className="grid gap-5 text-left sm:gap-6 md:grid-cols-2 xl:grid-cols-4 xl:gap-8">
            {content.whitepaperCards.map((card, index) => {
              const Icon = whitepaperIcons[index]

              return (
                <Reveal
                  key={card.title}
                  delay={index * 80}
                  className={`group glass rounded-[2rem] border border-white/5 p-6 transition-all sm:rounded-[2.5rem] sm:p-8 xl:rounded-[3rem] xl:p-10 ${card.tone}`}
                >
                  <div className="mb-6 text-cyan-400 transition-transform group-hover:scale-110">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h4 className="brand-italic text-xl font-bold uppercase tracking-tight">{card.title}</h4>
                  <p className="mt-4 font-sans text-[11px] font-light uppercase tracking-[0.2em] text-slate-400">
                    {card.description}
                  </p>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <section id="tech" className="apple-spacer px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-14 space-y-4 text-center sm:mb-18 lg:mb-24">
            <h2 className="font-heading brand-italic text-3xl font-black uppercase tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              {content.techSection.title} <span className="text-cyan-400">{content.techSection.highlight}</span>
            </h2>
            <p className="text-base font-light uppercase tracking-[0.18em] text-slate-500 sm:text-lg sm:tracking-[0.4em]">
              {content.techSection.subtitle}
            </p>
          </Reveal>
          <div className="grid gap-8 sm:gap-10 md:grid-cols-3 md:gap-12 lg:gap-16">
            {content.techPillars.map((pillar, index) => {
              const Icon = techIcons[index]

              return (
                <Reveal key={pillar.title} delay={index * 90} className="space-y-6 font-sans">
                  <Icon className="mb-4 h-10 w-10 text-cyan-400" />
                  <h3 className="font-heading brand-italic text-2xl font-black uppercase underline decoration-cyan-500/30 underline-offset-8">
                    {pillar.title}
                  </h3>
                  <p className="text-sm font-light leading-relaxed text-slate-300">{pillar.description}</p>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
