export const metadata = { title: "定价 / Pricing" };

const tiers = [
  {
    name: "免费开发者",
    price: "¥0",
    features: ["10万 数据点/月", "基础锚定与查询", "社区支持"],
    cta: { label: "开始试用", href: "/contact" }
  },
  {
    name: "专业版",
    price: "¥1,999 / 月起",
    features: ["按量计费弹性扩容", "Webhook/回调与重试", "SLA 99.9% 与邮件支持"],
    highlight: true,
    cta: { label: "联系销售", href: "/contact" }
  },
  {
    name: "企业方案",
    price: "定制",
    features: ["私有化部署 / 专有实例", "行业模组与合规咨询", "专属技术对接与培训"],
    cta: { label: "获取报价", href: "/contact" }
  }
];

export default function Pricing() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">定价</h1>
        <p className="mt-3 text-text-secondary">按量与企业并行，满足从研发到规模化的阶段需求。</p>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {tiers.map((t) => (
            <div key={t.name} className={"card " + (t.highlight ? "ring-1 ring-gold" : "")}>
              <div className="text-xl font-semibold text-white">{t.name}</div>
              <div className="mt-2 text-3xl text-gold">{t.price}</div>
              <ul className="mt-4 space-y-2 text-text-secondary">
                {t.features.map((f) => <li key={f}>• {f}</li>)}
              </ul>
              <a href={t.cta.href} className="btn-primary mt-6 inline-block">{t.cta.label}</a>
            </div>
          ))}
        </div>

        <div className="card mt-8">
          <div className="text-white font-semibold">计费口径（草案）</div>
          <ul className="mt-3 list-disc list-inside text-text-secondary">
            <li>数据点：成功写入的数据记录（含锚定）。</li>
            <li>查询：成功返回的锚定/证明查询计费。</li>
            <li>超额：超出配额部分按量计费，月度出账。</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
