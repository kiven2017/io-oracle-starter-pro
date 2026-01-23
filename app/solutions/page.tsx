"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Solutions() {
  const { t } = useLanguage();
  
  const items = [
    { href: "/solutions/manufacturing", ...t.solutions.manufacturing },
    { href: "/solutions/agriculture", ...t.solutions.agriculture },
    { href: "/solutions/cold-chain", ...t.solutions.coldChain },
    { href: "/solutions/energy", ...t.solutions.energy },
  ];
  
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">{t.solutions.title}</h1>
        <p className="mt-3 text-text-secondary">{t.solutions.subtitle}</p>
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {items.map((i) => (
            <a key={i.href} href={i.href} className="card block hover:bg-white/10 transition">
              <div className="text-xl font-semibold text-white">{i.title}</div>
              <p className="mt-2 text-text-secondary">{i.desc}</p>
              <div className="mt-4 text-gold">{t.solutions.viewDetails} →</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
