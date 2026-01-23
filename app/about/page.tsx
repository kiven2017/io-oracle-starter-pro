"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function AboutPage() {
  const { t } = useLanguage();
  
  return (
    <>
      {/* About Us */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white">{t.about.title}</h1>
            <p className="mt-6 text-lg text-text-secondary max-w-3xl mx-auto">
              {t.about.subtitle}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="card">
              <div className="text-2xl font-semibold text-gold mb-4">🎯 {t.about.mission.title}</div>
              <p className="text-text-secondary leading-relaxed text-lg">
                {t.about.missionDesc}
              </p>
            </div>
            
            <div className="card">
              <div className="text-2xl font-semibold text-gold mb-4">💡 {t.about.tech.title}</div>
              <p className="text-text-secondary leading-relaxed text-lg">
                {t.about.techDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section bg-black/30">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">{t.about.coreValuesTitle}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="text-5xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold text-white mb-3">{t.about.authenticity}</h3>
              <p className="text-text-secondary leading-relaxed">{t.about.authenticityDesc}</p>
            </div>
            <div className="card text-center">
              <div className="text-5xl mb-4">⛓️</div>
              <h3 className="text-xl font-semibold text-white mb-3">{t.about.certainty}</h3>
              <p className="text-text-secondary leading-relaxed">{t.about.certaintyDesc}</p>
            </div>
            <div className="card text-center">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-white mb-3">{t.about.integration}</h3>
              <p className="text-text-secondary leading-relaxed">{t.about.integrationDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">{t.about.partnersTitle}</h2>
            <p className="mt-4 text-text-secondary">{t.about.partnersDesc}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {["Huawei Cloud", "Alibaba Cloud", "Tencent Cloud", "AWS", "Chainlink", "Polygon", "IoT Alliance", "MIIT Certified"].map((name, idx) => (
              <div key={idx} className="card text-center hover:border-gold/50 transition-colors">
                <div className="text-lg font-semibold text-white">{name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News */}
      <section className="section bg-black/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">{t.about.newsTitle}</h2>
            <p className="mt-4 text-text-secondary">{t.about.newsDesc}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[t.news.news1, t.news.news2, t.news.news3].map((news, idx) => (
              <div key={idx} className="card hover:border-gold/50 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 text-xs font-semibold bg-gold/20 text-gold rounded-full">
                      {news.tag}
                    </span>
                    <span className="text-sm text-text-secondary">{news.date}</span>
                  </div>
                  <span className="text-3xl group-hover:scale-110 transition-transform">
                    {idx === 0 ? "🤝" : idx === 1 ? "❄️" : "🏆"}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{news.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{news.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="section">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t.about.contactTitle}</h2>
          <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
            {t.about.contactDesc}
          </p>
          <div className="flex justify-center gap-4">
            <a href="/contact" className="btn-primary">{t.about.applyTrial}</a>
            <a href="mailto:info@AIOracle.link" className="btn-ghost">{t.about.sendEmail}</a>
          </div>
        </div>
      </section>
    </>
  );
}
