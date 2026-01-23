"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type { Locale } from "@/lib/i18n";

export default function Header() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-black/70 border-b border-white/10">
      <nav className="container flex items-center justify-between h-16">
        <a href="/" className="font-semibold tracking-wide text-lg">
          <span className="text-gold">AI Oracle</span> Labs
        </a>
        
        <div className="hidden md:flex items-center gap-8 text-sm">
          <a href="/" className="hover:text-gold transition">{t.nav.home}</a>
          <a href="/solutions" className="hover:text-gold transition">{t.nav.solutions}</a>
          <a href="/cases" className="hover:text-gold transition">{t.nav.cases}</a>
          <a href="/pricing" className="hover:text-gold transition">{t.nav.pricing}</a>
          <a href="/docs" className="hover:text-gold transition">{t.nav.docs}</a>
          <a href="/about" className="hover:text-gold transition">{t.nav.about}</a>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={() => setLocale("zh-CN")}
              className={`${locale === "zh-CN" ? "text-gold font-semibold" : "text-white/60 hover:text-gold"} transition`}
            >
              中文
            </button>
            <span className="text-white/40">|</span>
            <button
              onClick={() => setLocale("en")}
              className={`${locale === "en" ? "text-gold font-semibold" : "text-white/60 hover:text-gold"} transition`}
            >
              EN
            </button>
          </div>
          <a href="/contact" className="btn-primary shadow-gold-glow">{t.nav.apply}</a>
        </div>
      </nav>
    </header>
  );
}
