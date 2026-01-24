"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function NotFound() {
  const { t } = useLanguage();
  
  return (
    <div className="section">
      <div className="container text-center">
        <h1 className="text-3xl font-bold text-gold">{t.notFound.title}</h1>
        <p className="mt-4 text-text-secondary">
          {t.notFound.message}
        </p>
        <a href="/" className="btn-primary mt-6 inline-block">{t.notFound.backHome}</a>
      </div>
    </div>
  );
}
