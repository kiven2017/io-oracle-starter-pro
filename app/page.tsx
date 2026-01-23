"use client";

import Hero from "@/components/Hero";
import DataChart from "@/components/DataChart";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Page() {
  const { t } = useLanguage();

  return (
    <>
      <Hero />
      
      {/* About AI Oracle */}
      <section id="about" className="section bg-black/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {t.about.title}
            </h2>
            <p className="mt-4 text-text-secondary max-w-3xl mx-auto leading-relaxed">
              {t.about.desc}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="card hover:border-gold/50 transition-all">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">🎯</span>
                <div className="text-xl font-semibold text-gold">{t.about.mission.title}</div>
              </div>
              <p className="text-text-secondary leading-relaxed">
                {t.about.mission.desc}
              </p>
            </div>
            
            <div className="card hover:border-gold/50 transition-all">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">💡</span>
                <div className="text-xl font-semibold text-gold">{t.about.tech.title}</div>
              </div>
              <p className="text-text-secondary leading-relaxed">
                {t.about.tech.desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {t.coreValues.title}
            </h2>
            <p className="mt-4 text-text-secondary max-w-3xl mx-auto">
              {t.coreValues.desc}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="card hover:border-gold/50 transition-all group text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center border border-gold/30">
                <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{t.coreValues.authenticity.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{t.coreValues.authenticity.desc}</p>
            </div>

            <div className="card hover:border-gold/50 transition-all group text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center border border-gold/30">
                <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{t.coreValues.certainty.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{t.coreValues.certainty.desc}</p>
            </div>

            <div className="card hover:border-gold/50 transition-all group text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center border border-gold/30">
                <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{t.coreValues.security.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{t.coreValues.security.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Solutions */}
      <section className="section bg-black/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {t.industries.title}
            </h2>
            <p className="mt-4 text-text-secondary">
              {t.industries.desc}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="card hover:border-gold/50 transition-all group">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                <img src="/images/industry-agriculture.png" alt="Smart Agriculture" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-semibold text-gold text-center mb-3">{t.industries.agriculture.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed text-center">{t.industries.agriculture.desc}</p>
            </div>

            <div className="card hover:border-gold/50 transition-all group">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                <img src="/images/industry-coldchain.png" alt="Cold Chain" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-semibold text-gold text-center mb-3">{t.industries.coldChain.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed text-center">{t.industries.coldChain.desc}</p>
            </div>

            <div className="card hover:border-gold/50 transition-all group">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                <img src="/images/industry-manufacturing.png" alt="Manufacturing" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-semibold text-gold text-center mb-3">{t.industries.manufacturing.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed text-center">{t.industries.manufacturing.desc}</p>
            </div>

            <div className="card hover:border-gold/50 transition-all group">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                <img src="/images/industry-energy.png" alt="Smart Energy" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-semibold text-gold text-center mb-3">{t.industries.energy.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed text-center">{t.industries.energy.desc}</p>
            </div>

            <div className="card hover:border-gold/50 transition-all group">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                <img src="/images/industry-logistics.png" alt="Smart Logistics" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-semibold text-gold text-center mb-3">{t.industries.logistics.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed text-center">{t.industries.logistics.desc}</p>
            </div>

            <div className="card hover:border-gold/50 transition-all group">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                <img src="/images/industry-construction.png" alt="Construction" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-semibold text-gold text-center mb-3">{t.industries.construction.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed text-center">{t.industries.construction.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {t.partners.title}
            </h2>
            <p className="mt-4 text-text-secondary">
              {t.partners.desc}
            </p>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
            {[
              { name: "partner-1.png", alt: "Chainlink" },
              { name: "partner-2.png", alt: "Solana" },
              { name: "partner-3.png", alt: "H3 Labs" },
              { name: "partner-4.png", alt: "Dune" },
              { name: "partner-5.png", alt: "AWS" },
              { name: "partner-6.png", alt: "Chainbase" }
            ].map((partner, idx) => (
              <div key={idx} className="card text-center hover:border-gold/50 transition-all bg-white/5 backdrop-blur">
                <div className="h-16 flex items-center justify-center">
                  <img 
                    src={`/images/${partner.name}`} 
                    alt={partner.alt} 
                    className="max-h-12 max-w-full object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section bg-black/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {t.team.title}
            </h2>
            <p className="mt-4 text-text-secondary">
              {t.team.desc}
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: "Alice Chen", role: "CEO", icon: "👩‍💼" },
              { name: "Jack Xu", role: "CTO", icon: "👨‍💻" },
              { name: "Carol Wang", role: "CPO", icon: "👩‍🎨" },
              { name: "David Liu", role: "Head of BD", icon: "👨‍💼" },
              { name: "Emma Li", role: "Lead Engineer", icon: "👩‍💻" },
              { name: "Frank Wu", role: "Blockchain Architect", icon: "👨‍🔬" },
              { name: "Grace Zhao", role: "Data Scientist", icon: "👩‍🔬" }
            ].map((member, idx) => (
              <div key={idx} className="card hover:border-gold/50 transition-all text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center text-4xl border border-gold/30">
                  {member.icon}
                </div>
                <div className="text-lg font-semibold text-white">{member.name}</div>
                <div className="text-sm text-gold mt-1">{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {t.news.title}
            </h2>
            <p className="mt-4 text-text-secondary">
              {t.news.desc}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card hover:border-gold/50 transition-all group">
              <div className="aspect-video rounded-lg mb-4 overflow-hidden">
                <img src="/images/news-1.png" alt="News 1" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 text-xs font-semibold bg-gold/20 text-gold rounded-full">
                  {t.news.news1.tag}
                </span>
                <span className="text-sm text-text-secondary">{t.news.news1.date}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t.news.news1.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{t.news.news1.desc}</p>
            </div>

            <div className="card hover:border-gold/50 transition-all group">
              <div className="aspect-video rounded-lg mb-4 overflow-hidden">
                <img src="/images/news-2.png" alt="News 2" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 text-xs font-semibold bg-gold/20 text-gold rounded-full">
                  {t.news.news2.tag}
                </span>
                <span className="text-sm text-text-secondary">{t.news.news2.date}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t.news.news2.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{t.news.news2.desc}</p>
            </div>

            <div className="card hover:border-gold/50 transition-all group">
              <div className="aspect-video rounded-lg mb-4 overflow-hidden">
                <img src="/images/news-3.png" alt="News 3" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 text-xs font-semibold bg-gold/20 text-gold rounded-full">
                  {t.news.news3.tag}
                </span>
                <span className="text-sm text-text-secondary">{t.news.news3.date}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t.news.news3.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{t.news.news3.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Real-time Data Monitor */}
      <section id="demo" className="section bg-black/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {t.monitor.title}
            </h2>
            <p className="mt-4 text-text-secondary max-w-3xl mx-auto">
              {t.monitor.desc}
            </p>
          </div>
          
          <div className="card">
            <DataChart />
            
            <div className="mt-6 flex gap-3 justify-center">
              <a href="#" className="btn-primary">{t.monitor.viewTx}</a>
              <a href="/docs" className="btn-ghost">{t.monitor.viewDocs}</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
