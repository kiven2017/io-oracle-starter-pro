export const metadata = { title: "农业与产地确权 · 解决方案" };

export default function Page() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">农业与产地确权</h1>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card">
            <div className="text-white font-semibold">场景挑战</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              <li>产地数据分散难核验</li><li>高价值农产品防伪溯源难</li><li>RWA 发行需要可信底层数据</li>
            </ul>
          </div>
          <div className="card">
            <div className="text-white font-semibold">我们的方案</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              <li>传感器+地块 DID 标识</li><li>收割/加工关键事件锚定</li><li>与链上凭证/NFT 绑定确权</li>
            </ul>
          </div>
          <div className="card">
            <div className="text-white font-semibold">关键指标（示例）</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              <li>溯源查询转化率 +25%</li><li>伪劣投诉 -35%</li><li>RWA 抵押接受度提升</li>
            </ul>
          </div>
        </div>

        <div className="card mt-8">
          <div className="text-white font-semibold">集成方式</div>
          <p className="mt-3 text-text-secondary">
            网关脚本 + Webhook 回调 + 链上锚定。提供 Postman 集合与 SDK（Node / Python / Rust）。
          </p>
          <div className="mt-4 flex gap-3">
            <a href="/contact" className="btn-primary">申请 POC 指南</a>
            <a href="/docs" className="btn-ghost">查看文档</a>
          </div>
        </div>
      </div>
    </div>
  );
}
