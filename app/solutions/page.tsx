export const metadata = { title: "解决方案 / Solutions" };

const items = [
  { href: "/solutions/manufacturing", title: "制造业与供应链", desc: "设备数据可信上链，防篡改与可追溯。" },
  { href: "/solutions/agriculture",  title: "农业与产地确权", desc: "传感器 + DID，实现RWA与产地审计。" },
  { href: "/solutions/cold-chain",   title: "冷链物流与风控", desc: "温湿度/开箱事件锚定，索赔争议降低。" },
  { href: "/solutions/energy",       title: "能源/碳资产",   desc: "计量与审计自动化，支撑碳信用发行。" },
];

export default function Solutions() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">解决方案</h1>
        <p className="mt-3 text-text-secondary">为不同行业提供模板化集成与可审计的链上证据。</p>
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {items.map((i) => (
            <a key={i.href} href={i.href} className="card block hover:bg-white/10 transition">
              <div className="text-xl font-semibold text-white">{i.title}</div>
              <p className="mt-2 text-text-secondary">{i.desc}</p>
              <div className="mt-4 text-gold">查看详情 →</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
