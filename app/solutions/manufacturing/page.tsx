export const metadata = { title: "制造业与供应链 · 解决方案" };

export default function Page() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">制造业与供应链</h1>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card">
            <div className="text-white font-semibold">场景挑战</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              <li>生产设备与工位数据真实性难以保障</li><li>跨工厂/跨系统数据口径不一致</li><li>合规审计与责任追踪成本高</li>
            </ul>
          </div>
          <div className="card">
            <div className="text-white font-semibold">我们的方案</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              <li>设备侧硬件签名与时间戳</li><li>网关聚合与异常检测</li><li>链上锚定形成可回放证据链</li>
            </ul>
          </div>
          <div className="card">
            <div className="text-white font-semibold">关键指标（示例）</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              <li>停线异常提前发现率 +30%</li><li>质量问题定位时长 -40%</li><li>合规审计时间 -50%</li>
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
