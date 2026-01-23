"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Docs() {
  const { t } = useLanguage();
  
  return (
    <div className="section">
      <div className="container prose prose-invert max-w-none">
        <h1>{t.docs.title}</h1>
        <p>{t.docs.welcome}</p>
        <h2>{t.docs.quickStart}</h2>
        <ol>
          {t.docs.steps.map((step: string, idx: number) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
        <h2>{t.docs.apiExample}</h2>
        <pre><code>{`curl -X POST https://api.example.com/v1/anchor \\
  -H "Authorization: Bearer <API_KEY>" \\
  -H "Content-Type: application/json" \\
  -d '{"device_id":"dev-001","payload":"...","signature":"..."}'`}</code></pre>
        <h2>{t.docs.sdk}</h2>
        <ul>
          <li><a href="#">Node.js</a></li>
          <li><a href="#">Python</a></li>
          <li><a href="#">Rust</a></li>
        </ul>
        <h2>{t.docs.changelog}</h2>
        <p>{t.docs.comingSoon}</p>
      </div>
    </div>
  );
}
