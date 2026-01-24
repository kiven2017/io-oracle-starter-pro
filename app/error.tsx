'use client';

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void; }) {
  const { t } = useLanguage();
  
  return (
    <html>
      <body className="section">
        <div className="container text-center">
          <h2 className="text-2xl font-semibold text-gold">{t.error.title}</h2>
          <p className="mt-4 text-text-secondary">{t.error.message}</p>
          <button className="btn-primary mt-6" onClick={() => reset()}>{t.error.retry}</button>
          <div className="mt-4 text-xs text-text-secondary">{t.error.digest}：{error?.digest || 'N/A'}</div>
        </div>
      </body>
    </html>
  );
}
