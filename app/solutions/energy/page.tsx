export const metadata = { title: "能源/碳资产 · 解决方案" };

export default function Page() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">能源/碳资产</h1>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card">
            <div className="text-white font-semibold">场景挑战</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              <li>计量口径不统一</li><li>人工审计成本高</li><li>碳减排量难以被信任</li>
            </ul>
          </div>
          <div className="card">
            <div className="text-white font-semibold">我们的方案</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              <li>标准化计量接口</li><li>AI 异常识别 + 取证</li><li>生成碳信用支撑材料</li>
            </ul>
          </div>
          <div className="card">
            <div className="text-white font-semibold">关键指标（示例）</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              <li>审计工时 -50%</li><li>异常漏检率 -40%</li><li>碳信用发行周期 -20%</li>
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
