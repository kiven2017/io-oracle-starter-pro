"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

const links = [
  '/cases/manufacturing-line',
  '/cases/seasia-cold-chain',
  '/cases/green-energy-park'
];

export default function Cases() {
  const { t } = useLanguage();
  
  const data = [t.cases.case1, t.cases.case2, t.cases.case3];
  
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">{t.cases.title}</h1>
        <p className="mt-3 text-text-secondary">{t.cases.subtitle}</p>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {data.map((c, idx) => (
            <div key={c.name} className="card">
              <div className="text-xl font-semibold text-white">{c.name}</div>
              <p className="mt-2 text-text-secondary">{c.desc}</p>
              <ul className="mt-3 space-y-1 text-text-secondary">
                {c.kpi.map((k: string) => <li key={k}>• {k}</li>)}
              </ul>
              <div className="mt-4 flex gap-3">
                <a href={links[idx]} className="btn-primary">{t.cases.viewDetails}</a>
                <a href="/contact" className="btn-ghost">{t.cases.contactUs}</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
