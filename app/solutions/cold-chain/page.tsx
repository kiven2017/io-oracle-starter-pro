export const metadata = { title: "冷链物流与风控 · 解决方案" };

export default function Page() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">冷链物流与风控</h1>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card">
            <div className="text-white font-semibold">场景挑战</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              <li>温湿度波动与开箱事件易争议</li><li>运输多方协同难</li><li>索赔证据缺失/难取信</li>
            </ul>
          </div>
          <div className="card">
            <div className="text-white font-semibold">我们的方案</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              <li>实时监测 + 异常告警</li><li>开箱/撞击事件上链</li><li>一键导出取证报表</li>
            </ul>
          </div>
          <div className="card">
            <div className="text-white font-semibold">关键指标（示例）</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              <li>温控偏差 -30%</li><li>争议工单 -40%</li><li>赔付效率 +35%</li>
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
