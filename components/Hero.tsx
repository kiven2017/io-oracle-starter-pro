"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden">
      {/* Background Gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-30"
           aria-hidden="true"
           style={{background: "radial-gradient(800px 400px at 50% 20%, rgba(212,175,55,0.3), transparent)"}} />
      
      {/* Globe Visual - Right Side */}
      <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-[700px] h-[700px] -z-5">
        <img 
          src="/images/hero-globe.png" 
          alt="AI Oracle Globe" 
          className="w-full h-full object-contain"
        />
      </div>

      <div className="container relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            {t.hero.title}
          </h1>
          <p className="mt-6 text-base md:text-lg text-text-secondary leading-relaxed">
            {t.hero.subtitle}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="/contact" className="btn-primary text-base px-8 py-3">{t.hero.applyTrial}</a>
            <a href="#demo" className="btn-ghost text-base px-8 py-3">{t.hero.watchDemo}</a>
          </div>
        </div>

        {/* Stats Cards Below Hero */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <div className="card hover:border-gold/50 transition-all group">
            <div className="flex items-start gap-4">
              <img src="/images/icon-stats-1.png" alt="" className="w-12 h-12" />
              <div>
                <div className="text-2xl font-bold text-gold">{t.hero.stats.devices.value}</div>
                <div className="text-lg font-semibold text-white mt-1">{t.hero.stats.devices.title}</div>
                <p className="text-sm text-text-secondary mt-2">{t.hero.stats.devices.desc}</p>
              </div>
            </div>
          </div>

          <div className="card hover:border-gold/50 transition-all group">
            <div className="flex items-start gap-4">
              <img src="/images/icon-stats-2.png" alt="" className="w-12 h-12" />
              <div>
                <div className="text-2xl font-bold text-gold">{t.hero.stats.uplink.value}</div>
                <div className="text-lg font-semibold text-white mt-1">{t.hero.stats.uplink.title}</div>
                <p className="text-sm text-text-secondary mt-2">{t.hero.stats.uplink.desc}</p>
              </div>
            </div>
          </div>

          <div className="card hover:border-gold/50 transition-all group">
            <div className="flex items-start gap-4">
              <img src="/images/icon-stats-3.png" alt="" className="w-12 h-12" />
              <div>
                <div className="text-2xl font-bold text-gold">{t.hero.stats.easy.value}</div>
                <div className="text-lg font-semibold text-white mt-1">{t.hero.stats.easy.title}</div>
                <p className="text-sm text-text-secondary mt-2">{t.hero.stats.easy.desc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
