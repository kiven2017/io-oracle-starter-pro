export const metadata = { title: "绿色能源园区 · 碳资产计量 · 案例详情" };

export default function CaseDetail() {
  return (
    <div className="section">
      <div className="container">
        <a href="/cases" className="text-sm text-text-secondary">← 返回案例</a>
        <h1 className="text-3xl font-semibold mt-3">绿色能源园区 · 碳资产计量</h1>
        <p className="mt-3 text-text-secondary">行业：能源/碳资产 · 区域：华南</p>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card md:col-span-2">
            <div className="text-white font-semibold">背景概览</div>
            <p className="mt-3 text-text-secondary">统一计量口径并将数据锚定上链，生成可审计材料以支撑碳信用发行。</p>

            <div className="mt-8">
              <div className="text-white font-semibold">挑战</div>
              <ul className="mt-3 list-disc list-inside text-text-secondary">
                <li>多种能源的计量口径不统一</li>
<li>人工审计成本高</li>
<li>减排量可信度不足</li>
              </ul>
            </div>

            <div className="mt-8">
              <div className="text-white font-semibold">解决方案</div>
              <ol className="mt-3 list-decimal list-inside text-text-secondary">
                <li>标准化计量接口</li>
<li>AI 异常识别与取证</li>
<li>自动生成审计材料</li>
              </ol>
            </div>

            <div className="mt-8">
              <div className="text-white font-semibold">实施与集成</div>
              <p className="mt-3 text-text-secondary">对接能源计量表与数据中台，基于 SDK 与回调接口形成数据证据链。</p>
            </div>

            <div className="mt-8">
              <div className="text-white font-semibold">结果与 KPI</div>
              <ul className="mt-3 list-disc list-inside text-text-secondary">
                <li>审计工时 -50%</li>
<li>发行周期 -20%</li>
<li>异常漏检率 -40%</li>
              </ul>
            </div>

            <div className="mt-8">
              <div className="text-white font-semibold">链上证明（示例）</div>
              <ul className="mt-3 list-disc list-inside text-text-secondary">
                <li>Solana Tx: <a href="#">111...abc</a></li>
                <li>BSN 证明: <a href="#">proof://example</a></li>
              </ul>
            </div>
          </div>

          <aside className="card">
            <div className="text-white font-semibold">项目参数</div>
            <ul className="mt-3 text-text-secondary space-y-2">
              <li>设备数量：800+</li>
              <li>数据量级：1.2M 点/天</li>
              <li>链路选择：BSN 联盟链</li>
              <li>周期：10 周（两期）</li>
            </ul>
            <a href="/contact" className="btn-primary mt-6 inline-block w-full text-center">申请同类方案</a>
          </aside>
        </div>
      </div>
    </div>
  );
}
