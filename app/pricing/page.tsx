"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Pricing() {
  const { t } = useLanguage();
  
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">{t.pricing.title}</h1>
        <p className="mt-3 text-text-secondary">{t.pricing.subtitle}</p>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {[t.pricing.free, t.pricing.pro, t.pricing.enterprise].map((tier, idx) => (
            <div key={tier.name} className={"card " + (idx === 1 ? "ring-1 ring-gold" : "")}>
              <div className="text-xl font-semibold text-white">{tier.name}</div>
              <div className="mt-2 text-3xl text-gold">{tier.price}</div>
              <ul className="mt-4 space-y-2 text-text-secondary">
                {tier.features.map((f: string) => <li key={f}>• {f}</li>)}
              </ul>
              <a href="/contact" className="btn-primary mt-6 inline-block">{tier.cta}</a>
            </div>
          ))}
        </div>

        <div className="card mt-8">
          <div className="text-white font-semibold">{t.pricing.billingTitle}</div>
          <ul className="mt-3 list-disc list-inside text-text-secondary">
            {t.pricing.billingItems.map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
