import Hero from "@/components/Hero";

export default function Page() {
  return (
    <>
      <Hero />
      <section className="section">
        <div className="container grid md:grid-cols-3 gap-6">
          {[
            {title: "数据真实性", desc: "设备端硬件签名 + 异常检测，保障来源可信。"},
            {title: "上链确定性", desc: "可验证时间戳与 Merkle 锚定，便于审计回放。"},
            {title: "易集成", desc: "标准化 API/SDK，5 分钟完成接入与验证。"},
          ].map((c) => (
            <div className="card" key={c.title}>
              <div className="text-xl font-semibold text-white">{c.title}</div>
              <p className="mt-3 text-text-secondary">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="demo" className="section">
        <div className="container">
          <div className="card">
            <div className="text-2xl font-semibold text-white">实时 Demo（占位）</div>
            <p className="mt-3 text-text-secondary">将温度/湿度/振动数据以折线图展示，点击“查看交易”跳转区块链浏览器。</p>
            <div className="mt-6 flex gap-3">
              <a href="#" className="btn-primary">查看交易</a>
              <a href="/docs" className="btn-ghost">查看文档</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
