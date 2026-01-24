"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function CaseDetail() {
  const { t } = useLanguage();
  const detail = t.caseDetail.manufacturingLine;
  
  return (
    <div className="section">
      <div className="container">
        <a href="/cases" className="text-sm text-text-secondary">{t.caseDetail.backToCases}</a>
        <h1 className="text-3xl font-semibold mt-3">{detail.title}</h1>
        <p className="mt-3 text-text-secondary">{t.caseDetail.industry}：{detail.industry} · {t.caseDetail.region}：{detail.region}</p>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card md:col-span-2">
            <div className="text-white font-semibold">{t.caseDetail.overview}</div>
            <p className="mt-3 text-text-secondary">{detail.overview}</p>

            <div className="mt-8">
              <div className="text-white font-semibold">{t.caseDetail.challenges}</div>
              <ul className="mt-3 list-disc list-inside text-text-secondary">
                {detail.challenges.map((c: string) => <li key={c}>{c}</li>)}
              </ul>
            </div>

            <div className="mt-8">
              <div className="text-white font-semibold">{t.caseDetail.solution}</div>
              <ol className="mt-3 list-decimal list-inside text-text-secondary">
                {detail.solutions.map((s: string) => <li key={s}>{s}</li>)}
              </ol>
            </div>

            <div className="mt-8">
              <div className="text-white font-semibold">{t.caseDetail.implementation}</div>
              <p className="mt-3 text-text-secondary">{detail.implementation}</p>
            </div>

            <div className="mt-8">
              <div className="text-white font-semibold">{t.caseDetail.results}</div>
              <ul className="mt-3 list-disc list-inside text-text-secondary">
                {detail.results.map((r: string) => <li key={r}>{r}</li>)}
              </ul>
            </div>

            <div className="mt-8">
              <div className="text-white font-semibold">{t.caseDetail.proof}</div>
              <ul className="mt-3 list-disc list-inside text-text-secondary">
                <li>Solana Tx: <a href="#">111...abc</a></li>
                <li>BSN {t.caseDetail.proof}: <a href="#">proof://example</a></li>
              </ul>
            </div>
          </div>

          <aside className="card">
            <div className="text-white font-semibold">{t.caseDetail.params}</div>
            <ul className="mt-3 text-text-secondary space-y-2">
              <li>{t.caseDetail.deviceCount}：{detail.deviceCount}</li>
              <li>{t.caseDetail.dataVolume}：{detail.dataVolume}</li>
              <li>{t.caseDetail.blockchain}：{detail.blockchain}</li>
              <li>{t.caseDetail.duration}：{detail.duration}</li>
            </ul>
            <a href="/contact" className="btn-primary mt-6 inline-block w-full text-center">{t.caseDetail.applyButton}</a>
          </aside>
        </div>
      </div>
    </div>
  );
}
