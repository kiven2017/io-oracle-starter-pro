import {
  Box,
  BookOpenText,
  CheckCircle2,
  ChevronDown,
  FileText,
  Flame,
  Globe,
  Layers,
  ShieldAlert,
  Users,
  Zap,
} from 'lucide-react'
import AvatarImage from '../AvatarImage'
import Reveal from '../Reveal'
import { useLocale } from '../../context/LocaleContext'

function FooterLinkIcon({ icon }) {
  if (icon === 'telegram') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
        <path d="M21.4 4.6 18.1 20c-.2 1-.8 1.3-1.6.8l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.3L5.7 13 1 11.5c-1-.3-1-1 .2-1.5l18.4-7.1c.9-.3 1.6.2 1.3 1.7Z" />
      </svg>
    )
  }

  if (icon === 'x') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
        <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-5-6.6L6 22H2.8l7.3-8.4L1 2h6.4l4.5 6 7-8Z" />
      </svg>
    )
  }

  if (icon === 'book') {
    return <BookOpenText className="h-4 w-4" />
  }

  if (icon === 'file') {
    return <FileText className="h-4 w-4" />
  }

  if (icon === 'shield') {
    return <ShieldAlert className="h-4 w-4" />
  }

  return <Globe className="h-4 w-4" />
}

export default function EcosystemSections({
  openFaqIndex,
  onFaqToggle,
  onJoinPresale,
}) {
  const { content } = useLocale()

  return (
    <>
      <section
        id="tokenomics"
        className="apple-spacer overflow-hidden border-y border-white/5 bg-red-950/10 px-4 font-heading brand-italic sm:px-6"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <Reveal className="space-y-10 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/10 bg-red-500/5 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-red-400 sm:text-xs sm:tracking-widest">
              <Flame className="h-4 w-4" />
              {content.tokenomicsSection.badge}
            </div>
            <h2 className="text-4xl font-black uppercase leading-[1.08] tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="text-red-500 underline decoration-red-500/20">{content.tokenomicsSection.title}</span> <br />
              {content.tokenomicsSection.highlight}
            </h2>
            <div className="space-y-6 font-sans not-italic">
              <p className="text-base font-bold uppercase tracking-tight text-slate-400 sm:text-lg">
                {content.tokenomicsSection.lead}
              </p>
              <p className="border-l-4 border-red-500/20 pl-6 text-sm font-medium uppercase tracking-widest text-slate-500">
                {content.tokenomicsSection.note}
              </p>
            </div>
            <ul className="space-y-6 font-sans text-[13px] font-bold uppercase tracking-widest">
              {content.tokenomicsSection.points.map((point) => (
                <li key={point} className="flex items-center gap-5 text-slate-400">
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-red-500" />
                  {point}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="rounded-[2.2rem] border-2 border-dashed border-red-500/30 bg-red-500/5 p-6 text-center backdrop-blur-md sm:rounded-[3rem] sm:p-10 lg:rounded-[4rem] lg:p-16">
            <p className="brand-italic mb-6 font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 sm:mb-8 sm:tracking-[0.4em]">
              {content.tokenomicsSection.simulation}
            </p>
            <div className="font-heading brand-italic mb-5 text-6xl font-black tracking-tighter text-white sm:mb-6 sm:text-7xl md:text-8xl lg:text-9xl">
              {content.tokenomicsSection.buybackValue}
            </div>
            <p className="brand-italic mb-8 text-lg font-black uppercase tracking-[0.18em] text-red-500 sm:mb-12 sm:text-xl sm:tracking-widest">
              {content.tokenomicsSection.buybackLabel}
            </p>
            <div className="flex flex-wrap items-center justify-around gap-8 border-t border-white/10 pt-8 font-sans not-italic sm:gap-12 sm:pt-12">
              <div className="text-left">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">{content.tokenomicsSection.nodeGrowth}</p>
                <p className="text-3xl font-black text-white">{content.tokenomicsSection.nodeGrowthValue}</p>
              </div>
              <div className="text-right">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">{content.tokenomicsSection.burnRate}</p>
                <p className="text-3xl font-black uppercase text-red-500">{content.tokenomicsSection.burnRateValue}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="advisors" className="apple-spacer border-y border-white/5 bg-slate-900/20 px-4 font-heading sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Reveal className="brand-italic mx-auto mb-14 space-y-4 text-center sm:mb-18 lg:mb-24">
            <div className="mx-auto inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-400 sm:text-xs sm:tracking-[0.3em]">
              <Users className="h-4 w-4" />
              {content.advisorsSection.badge}
            </div>
            <h2 className="text-center text-4xl font-black uppercase tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              {content.advisorsSection.title}
            </h2>
            <p className="brand-italic mx-auto text-center text-sm font-light uppercase tracking-[0.18em] text-slate-400 sm:text-base sm:tracking-[0.3em] md:text-xl">
              {content.advisorsSection.subtitle}
            </p>
          </Reveal>

          <div className="grid gap-6 text-center sm:gap-8 md:grid-cols-2 xl:grid-cols-3 xl:gap-12">
            {content.advisors.map((advisor, index) => (
              <Reveal
                key={advisor.name}
                delay={index * 90}
                className="glass relative overflow-hidden rounded-[2rem] p-6 sm:rounded-[2.6rem] sm:p-8 xl:rounded-[3.5rem] xl:p-12"
              >
                <div className="mx-auto mb-8 h-32 w-32 overflow-hidden rounded-3xl border border-white/10 sm:mb-10 sm:h-36 sm:w-36">
                  <AvatarImage
                    src={advisor.src}
                    name={advisor.name}
                    initials={advisor.initials}
                    colors={advisor.gradient}
                    alt={advisor.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h4 className="brand-italic text-xl font-black uppercase sm:text-2xl">{advisor.name}</h4>
                <p className="mt-3 text-xs font-bold uppercase tracking-widest text-cyan-400">
                  {advisor.handle}
                </p>
                <div className="brand-italic mt-8 space-y-2 font-sans text-sm font-black uppercase tracking-widest text-slate-400">
                  {advisor.lines.map((line, lineIndex) => (
                    <p key={line} className={lineIndex === 0 ? 'text-slate-200' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="node" className="apple-spacer border-t border-white/5 px-4 font-heading sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Reveal className="brand-italic mx-auto mb-14 space-y-4 text-center sm:mb-18 lg:mb-24">
            <div className="mx-auto inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-400 sm:text-xs sm:tracking-[0.4em]">
              <Zap className="h-4 w-4" />
              {content.affiliateSection.badge}
            </div>
            <h2 className="text-center text-4xl font-black uppercase tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              {content.affiliateSection.title}
            </h2>
            <p className="brand-italic mx-auto max-w-2xl text-sm font-light uppercase tracking-[0.18em] text-slate-400 sm:text-base sm:tracking-widest lg:text-lg">
              {content.affiliateSection.subtitle}
            </p>
          </Reveal>

          <div className="grid gap-6 font-sans sm:gap-8 md:grid-cols-2 md:gap-10 lg:gap-12">
            {content.affiliateTiers.map((tier, index) => (
              <Reveal
                key={tier.title}
                delay={index * 80}
                className={`glass relative overflow-hidden rounded-[2rem] border-2 p-6 sm:rounded-[2.8rem] sm:p-10 xl:rounded-[3.5rem] xl:p-12 ${tier.emphasis}`}
              >
                <h3 className="brand-italic text-3xl font-black uppercase tracking-tighter sm:text-4xl">{tier.title}</h3>
                <p className="brand-italic mt-4 text-sm font-black uppercase tracking-widest text-cyan-400 underline decoration-cyan-500/20 underline-offset-8">
                  {tier.slot}
                </p>
                <div className="my-8 space-y-6 font-bold text-slate-300 sm:my-12">
                  <div className="flex justify-between border-b border-white/10 pb-5 text-sm uppercase tracking-widest">
                    <span>{content.affiliateSection.directReward}</span>
                    <span className="brand-italic text-4xl font-black text-cyan-400">{tier.direct}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-5 text-sm uppercase tracking-widest">
                    <span>{content.affiliateSection.indirectReward}</span>
                    <span className="brand-italic text-4xl font-black text-cyan-400">{tier.indirect}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onJoinPresale}
                  className={`w-full rounded-3xl py-5 font-heading text-sm font-black uppercase tracking-widest transition-all ${tier.buttonClass}`}
                >
                  {tier.cta}
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        id="press"
        className="apple-spacer border-t border-white/5 bg-[#020617] px-4 text-center font-heading text-[11px] uppercase tracking-widest sm:px-6"
      >
        <div className="mx-auto max-w-7xl">
          <Reveal className="brand-italic">
            <p className="mb-14 text-[14px] font-black tracking-[0.32em] text-slate-400 sm:mb-20 sm:text-[15px] sm:tracking-[0.6em] md:text-[17px]">
              {content.pressSection.authority}
            </p>
            <div className="mb-16 grid grid-cols-1 items-center gap-8 opacity-70 sm:mb-24 sm:grid-cols-2 sm:gap-16 lg:gap-20">
              <div className="space-y-4">
                <p className="text-[13px] font-light tracking-[0.18em] text-slate-400 sm:tracking-[0.3em] md:text-sm">{content.pressSection.publishedBy}</p>
                <div className="text-3xl font-black tracking-tighter sm:text-4xl">{content.pressSection.pressA}</div>
              </div>
              <div className="space-y-4">
                <p className="text-[13px] font-light tracking-[0.18em] text-slate-400 sm:tracking-[0.3em] md:text-sm">{content.pressSection.publishedBy}</p>
                <div className="text-2xl font-black tracking-tighter sm:text-3xl">{content.pressSection.pressB}</div>
              </div>
            </div>
            <div className="space-y-10 opacity-80 sm:space-y-12">
              <p className="text-[15px] font-light tracking-[0.18em] text-slate-300 sm:tracking-[0.3em] md:text-base">{content.pressSection.awards}</p>
              <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
                <div className="text-lg font-black uppercase tracking-[0.28em] text-slate-200">
                  {content.pressSection.awardA}
                </div>
                <div className="text-lg font-black uppercase tracking-[0.28em] text-slate-200">
                  {content.pressSection.awardB}
                </div>
              </div>
              <div className="space-y-8 pt-10">
                <p className="text-[15px] font-light tracking-[0.18em] text-slate-300 sm:tracking-[0.3em] md:text-base">{content.pressSection.partners}</p>
                <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
                  {content.strategicPartners.map((partner) => (
                    <div key={partner} className="text-lg font-black uppercase tracking-[0.28em] text-slate-200">
                      {partner}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="ecosystem" className="apple-spacer border-t border-white/5 bg-slate-900/40 px-4 font-heading sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            {content.gatewayCards.map((card, index) => {
              const Icon = index === 0 ? Layers : Box
              const buttonClass =
                index === 0
                  ? 'bg-white text-black hover:bg-cyan-400'
                  : 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-2xl'

              return (
                <Reveal
                  key={card.title}
                  delay={index * 90}
                  className={`group flex flex-col justify-between rounded-[2.2rem] border border-white/5 bg-gradient-to-br ${card.accent} to-transparent p-6 text-left sm:rounded-[3rem] sm:p-10 xl:rounded-[4rem] xl:p-14`}
                >
                  <div className="space-y-8">
                    <Icon className={`mb-4 h-12 w-12 opacity-50 ${card.iconTone}`} />
                    <h3 className="brand-italic text-3xl font-black uppercase sm:text-4xl">{card.title}</h3>
                    <p className="brand-italic font-sans text-base font-light leading-relaxed text-slate-400 sm:text-lg">
                      {card.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onJoinPresale}
                    className={`mt-10 rounded-[2rem] px-8 py-4 text-xs font-black uppercase tracking-widest transition-all sm:mt-16 sm:px-12 sm:py-5 ${buttonClass}`}
                  >
                    {card.button}
                  </button>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <footer className="apple-spacer border-t border-white/5 bg-[#010413] px-4 text-left font-heading sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 text-left lg:grid-cols-[0.88fr_1.12fr]">
            <Reveal className="brand-italic space-y-10">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 font-black text-black">
                  A
                </div>
                <span className="text-3xl font-black uppercase tracking-tighter">AIOracle.link</span>
              </div>
              <p className="max-w-sm whitespace-pre-line text-xs font-medium uppercase leading-relaxed tracking-[0.2em] text-slate-600">
                {content.footer.copyright}
              </p>
            </Reveal>

            <Reveal className="grid grid-cols-2 gap-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 md:grid-cols-3">
              {content.footerGroups.map((group) => (
                <div key={group.title} className="brand-italic space-y-6">
                  <p className="text-xs tracking-[0.5em] text-white">{group.title}</p>
                  {group.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      download={link.download}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-2 text-[10px] transition-all ${
                        group.id === 'safety'
                          ? 'border-red-500/10 bg-red-500/5 hover:border-red-400/30 hover:text-red-300'
                          : 'border-white/5 bg-white/5 hover:border-cyan-400/30 hover:text-cyan-300'
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-xl ${
                          group.id === 'safety' ? 'bg-red-500/10 text-red-400' : 'bg-cyan-500/10 text-cyan-400'
                        }`}
                      >
                        <FooterLinkIcon icon={link.icon} />
                      </span>
                      <span className="min-w-0 flex-1 break-words text-[11px] leading-snug tracking-[0.18em]">
                        {link.label}
                      </span>
                    </a>
                  ))}
                </div>
              ))}
            </Reveal>
          </div>

        </div>
      </footer>

      <section id="faq" className="border-t border-white/5 bg-[#010413] px-4 pb-20 pt-14 sm:px-6 sm:pb-28 sm:pt-16">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mx-auto mb-16 max-w-3xl space-y-4 text-center">
            <p className="brand-italic text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-400 sm:text-xs sm:tracking-[0.4em]">
              {content.faqSection.badge}
            </p>
            <h2 className="font-heading brand-italic text-4xl font-black uppercase tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              {content.faqSection.title}
            </h2>
            <p className="text-base font-light leading-relaxed text-slate-400 sm:text-lg">
              {content.faqSection.description}
            </p>
          </Reveal>

          <div className="space-y-4">
            {content.faqItems.map((item, index) => {
              const isOpen = openFaqIndex === index

              return (
                <Reveal key={item.question} delay={index * 60}>
                  <div
                    className="faq-item glass rounded-[2rem] border border-white/5 p-2"
                    data-open={isOpen}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-6 rounded-[1.5rem] px-6 py-5 text-left"
                      onClick={() => onFaqToggle(index)}
                    >
                      <span className="font-heading text-lg font-bold leading-snug tracking-[0.01em] text-white md:text-xl">
                        {item.question}
                      </span>
                      <ChevronDown className="faq-chevron h-5 w-5 shrink-0 text-cyan-400" />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 pt-1 text-sm leading-7 text-slate-400 md:text-[15px]">
                        {item.answer}
                      </div>
                    )}
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
