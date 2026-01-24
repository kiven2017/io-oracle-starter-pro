"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Page() {
  const { t } = useLanguage();
  const detail = t.solutionDetail.energy;
  
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">{detail.title}</h1>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card">
            <div className="text-white font-semibold">{t.solutionDetail.challenge}</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              {detail.challenges.map((c: string) => <li key={c}>{c}</li>)}
            </ul>
          </div>
          <div className="card">
            <div className="text-white font-semibold">{t.solutionDetail.solution}</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              {detail.solutions.map((s: string) => <li key={s}>{s}</li>)}
            </ul>
          </div>
          <div className="card">
            <div className="text-white font-semibold">{t.solutionDetail.metrics}</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              {detail.metrics.map((m: string) => <li key={m}>{m}</li>)}
            </ul>
          </div>
        </div>

        <div className="card mt-8">
          <div className="text-white font-semibold">{t.solutionDetail.integration}</div>
          <p className="mt-3 text-text-secondary">
            {t.solutionDetail.integrationDesc}
          </p>
          <div className="mt-4 flex gap-3">
            <a href="/contact" className="btn-primary">{t.solutionDetail.applyPoc}</a>
            <a href="/docs" className="btn-ghost">{t.solutionDetail.viewDocs}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
