export const metadata = { title: "案例 / Case Studies" };

const data = [
  {
    name: "华东制造集团 · 产线数据可信化",
    kpi: ["异常提前发现率 +32%", "审计时间 -45%"],
    desc: "将工位数据接入 iOT 预言机，形成可回放证据链。",
  },
  {
    name: "东南亚生鲜冷链 · 温控争议解决",
    kpi: ["温控偏差 -28%", "索赔效率 +37%"],
    desc: "对温湿度和开箱事件进行链上锚定，快速取证。",
  },
  {
    name: "绿色能源园区 · 碳资产计量",
    kpi: ["审计工时 -50%", "发行周期 -20%"],
    desc: "统一计量口径，自动生成审计材料与证明。",
  }
];

const links = [
  '/cases/manufacturing-line',
  '/cases/seasia-cold-chain',
  '/cases/green-energy-park'
];

export default function Cases() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">客户案例</h1>
        <p className="mt-3 text-text-secondary">故事 + 数据截图，持续补充中。</p>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {data.map((c, idx) => (
            <div key={c.name} className="card">
              <div className="text-xl font-semibold text-white">{c.name}</div>
              <p className="mt-2 text-text-secondary">{c.desc}</p>
              <ul className="mt-3 space-y-1 text-text-secondary">
                {c.kpi.map((k) => <li key={k}>• {k}</li>)}
              </ul>
              <div className="mt-4 flex gap-3">
                <a href={links[idx]} className="btn-primary">查看详情</a>
                <a href="/contact" className="btn-ghost">联系对接</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
