"use client";

import Hero from "@/components/Hero";
import DataChart from "@/components/DataChart";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

type TeamMember = {
  name: string;
  initials: string;
  bio: {
    "zh-CN": string;
    en: string;
  };
};

const coreTeamMembers: TeamMember[] = [
  {
    name: "Vincent Lee",
    initials: "VL",
    bio: {
      "zh-CN":
        "香港RWA全球产业联盟共同发起人、技术专家委委员，香港财富通控股集团董事长。拥有20余年AI、区块链及物联网研发经验，曾任大连海事大学国家重点专项技术负责人。持有及申请中专利近20项，著有《RWA重构金融商业模式》。",
      en:
        "Co-founder of Hong Kong RWA Global Industry Alliance and Chairman of Fortune Link Holdings. With over 20 years of experience in AI, Blockchain, and IoT, he previously led national-level research projects at Dalian Maritime University. He holds nearly 20 patents and is the author of RWA: Restructuring Financial Business Models.",
    },
  },
  {
    name: "Aliks Dou",
    initials: "AD",
    bio: {
      "zh-CN":
        "中国通信工业协会区块链专委会执行秘书长，香港RWA全球产业联盟发起人。数字藏品标准制定领军人物，主导编撰《数字藏品通用标准》，致力于产业数字化转型与数字经济研究。",
      en:
        "Executive Secretary-General of the Blockchain Committee of China Communications Industry Association and Founder of the Hong Kong RWA Global Industry Alliance. A leading expert in digital economy and industrial transformation, he spearheaded the compilation of the General Standards for Digital Collections.",
    },
  },
  {
    name: "Kevin",
    initials: "KV",
    bio: {
      "zh-CN":
        "中国通信工业协会区块链专委会常务副主任，工信部及多地政府区块链与元宇宙智库专家。深耕文化科技融合与“链改”行动，是国内首批区块链人才评价认证专家及讲师。",
      en:
        'Deputy Director of the Blockchain Committee of China Communications Industry Association and a key advisor for MIIT and various municipal governments on Metaverse and Blockchain. He is a pioneer of the "Chain Reform" initiative and an expert in the integration of culture and technology.',
    },
  },
  {
    name: "Dachao Tian",
    initials: "DT",
    bio: {
      "zh-CN":
        "链杉资本创始人，WBO新闻媒体署副署长，著有《一本书读懂区块链》。",
      en:
        "Founder of Lianshan Capital and VP of the Shanghai Blockchain Association.",
    },
  },
  {
    name: "Aditya Kumar",
    initials: "AK",
    bio: {
      "zh-CN":
        "开发者关系（DevRel）负责人，Web3与AI生态战略及市场进入（GTM）专家，前以太坊核心专家。",
      en:
        "Lead Developer Relations Engineer specializing in Web3 x AI Ecosystem Strategy.",
    },
  },
  {
    name: "Ishant Singh",
    initials: "IS",
    bio: {
      "zh-CN":
        "前OpenAI及亚马逊AI产品负责人，初创企业导师，资深创业者。",
      en:
        "AI Product Leader (Ex-OpenAI, Amazon) and Startup Advisor.",
    },
  },
];

const teamSectionDescriptions = {
  "zh-CN": "RWA、区块链、AI 与产业数字化领域的核心顾问与专家团队",
  en: "Core advisors and experts across RWA, blockchain, AI, and industrial digital transformation.",
} as const;

export default function Page() {
  const { locale, t } = useLanguage();

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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
                  <svg
                    className="h-5 w-5 text-gold"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5l7 7-7 7M5 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <div className="text-xl font-semibold text-gold">
                  {t.about.mission.title}
                </div>
              </div>
              <p className="text-text-secondary leading-relaxed">
                {t.about.mission.desc}
              </p>
            </div>

            <div className="card hover:border-gold/50 transition-all">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
                  <svg
                    className="h-5 w-5 text-gold"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div className="text-xl font-semibold text-gold">
                  {t.about.tech.title}
                </div>
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
                <svg
                  className="w-8 h-8 text-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {t.coreValues.authenticity.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {t.coreValues.authenticity.desc}
              </p>
            </div>

            <div className="card hover:border-gold/50 transition-all group text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center border border-gold/30">
                <svg
                  className="w-8 h-8 text-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {t.coreValues.certainty.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {t.coreValues.certainty.desc}
              </p>
            </div>

            <div className="card hover:border-gold/50 transition-all group text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center border border-gold/30">
                <svg
                  className="w-8 h-8 text-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {t.coreValues.security.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {t.coreValues.security.desc}
              </p>
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
            <p className="mt-4 text-text-secondary">{t.industries.desc}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="card hover:border-gold/50 transition-all group">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                <img
                  src="/images/industry-agriculture.png"
                  alt="Smart Agriculture"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-gold text-center mb-3">
                {t.industries.agriculture.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed text-center">
                {t.industries.agriculture.desc}
              </p>
            </div>

            <div className="card hover:border-gold/50 transition-all group">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                <img
                  src="/images/industry-coldchain.png"
                  alt="Cold Chain"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-gold text-center mb-3">
                {t.industries.coldChain.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed text-center">
                {t.industries.coldChain.desc}
              </p>
            </div>

            <div className="card hover:border-gold/50 transition-all group">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                <img
                  src="/images/industry-manufacturing.png"
                  alt="Manufacturing"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-gold text-center mb-3">
                {t.industries.manufacturing.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed text-center">
                {t.industries.manufacturing.desc}
              </p>
            </div>

            <div className="card hover:border-gold/50 transition-all group">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                <img
                  src="/images/industry-energy.png"
                  alt="Smart Energy"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-gold text-center mb-3">
                {t.industries.energy.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed text-center">
                {t.industries.energy.desc}
              </p>
            </div>

            <div className="card hover:border-gold/50 transition-all group">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                <img
                  src="/images/industry-logistics.png"
                  alt="Smart Logistics"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-gold text-center mb-3">
                {t.industries.logistics.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed text-center">
                {t.industries.logistics.desc}
              </p>
            </div>

            <div className="card hover:border-gold/50 transition-all group">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                <img
                  src="/images/industry-construction.png"
                  alt="Construction"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold text-gold text-center mb-3">
                {t.industries.construction.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed text-center">
                {t.industries.construction.desc}
              </p>
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
            <p className="mt-4 text-text-secondary">{t.partners.desc}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {[
              { name: "partner-1.png", alt: "Ethereum" },
              { name: "partner-2.png", alt: "Solana" },
              { name: "partner-3.png", alt: "Conflux" },
              { name: "partner-4.png", alt: "AWS Amazon" },
              { name: "partner-5.png", alt: "Chainlink" },
              { name: "partner-6.png", alt: "Chainlink" },
              { name: "partner-7.png", alt: "Humanity Protocol" },
            ].map((partner, idx) => (
              <div key={idx} className="flex items-center justify-center">
                <img
                  src={`/images/${partner.name}`}
                  alt={partner.alt}
                  className="w-40 h-20 object-contain"
                />
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
            <p className="mt-4 max-w-3xl mx-auto text-text-secondary">
              {teamSectionDescriptions[locale]}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {coreTeamMembers.map((member) => (
              <div
                key={member.name}
                className="card h-full md:p-7 hover:border-gold/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-sm font-semibold uppercase tracking-[0.2em] text-gold">
                    {member.initials}
                  </div>
                  <div className="text-xl font-semibold text-white">
                    {member.name}
                  </div>
                </div>
                <p className="mt-5 text-sm leading-7 text-text-secondary">
                  {member.bio[locale]}
                </p>
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
            <p className="mt-4 text-text-secondary">{t.news.desc}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card hover:border-gold/50 transition-all group">
              <div className="aspect-video rounded-lg mb-4 overflow-hidden">
                <img
                  src="/images/news-1.png"
                  alt="News 1"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 text-xs font-semibold bg-gold/20 text-gold rounded-full">
                  {t.news.news1.tag}
                </span>
                <span className="text-sm text-text-secondary">
                  {t.news.news1.date}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {t.news.news1.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {t.news.news1.desc}
              </p>
            </div>

            <div className="card hover:border-gold/50 transition-all group">
              <div className="aspect-video rounded-lg mb-4 overflow-hidden">
                <img
                  src="/images/news-2.png"
                  alt="News 2"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 text-xs font-semibold bg-gold/20 text-gold rounded-full">
                  {t.news.news2.tag}
                </span>
                <span className="text-sm text-text-secondary">
                  {t.news.news2.date}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {t.news.news2.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {t.news.news2.desc}
              </p>
            </div>

            <div className="card hover:border-gold/50 transition-all group">
              <div className="aspect-video rounded-lg mb-4 overflow-hidden">
                <img
                  src="/images/news-3.png"
                  alt="News 3"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 text-xs font-semibold bg-gold/20 text-gold rounded-full">
                  {t.news.news3.tag}
                </span>
                <span className="text-sm text-text-secondary">
                  {t.news.news3.date}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {t.news.news3.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {t.news.news3.desc}
              </p>
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
              <a href="#" className="btn-primary">
                {t.monitor.viewTx}
              </a>
              <a href="/docs" className="btn-ghost">
                {t.monitor.viewDocs}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
