export const metadata = { title: "华东制造集团 · 产线数据可信化 · 案例详情" };

export default function CaseDetail() {
  return (
    <div className="section">
      <div className="container">
        <a href="/cases" className="text-sm text-text-secondary">← 返回案例</a>
        <h1 className="text-3xl font-semibold mt-3">华东制造集团 · 产线数据可信化</h1>
        <p className="mt-3 text-text-secondary">行业：制造业 · 区域：华东</p>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card md:col-span-2">
            <div className="text-white font-semibold">背景概览</div>
            <p className="mt-3 text-text-secondary">将关键工位的数据通过设备侧硬件签名上报，网关聚合后进行异常检测，并进行链上锚定以支持审计回放。</p>

            <div className="mt-8">
              <div className="text-white font-semibold">挑战</div>
              <ul className="mt-3 list-disc list-inside text-text-secondary">
                <li>多工位多系统数据口径不一致</li>
<li>人为操作与日志后补风险</li>
<li>质量事故追责证据不足</li>
              </ul>
            </div>

            <div className="mt-8">
              <div className="text-white font-semibold">解决方案</div>
              <ol className="mt-3 list-decimal list-inside text-text-secondary">
                <li>设备侧私钥签名与时间戳</li>
<li>网关进行 CBOR 归一化与队列缓冲</li>
<li>AI 异常检测并生成事件</li>
<li>Merkle 树批量锚定至链</li>
              </ol>
            </div>

            <div className="mt-8">
              <div className="text-white font-semibold">实施与集成</div>
              <p className="mt-3 text-text-secondary">与现有 MES/SCADA 对接，新增网关组件与 API 回调，形成统一证据链。</p>
            </div>

            <div className="mt-8">
              <div className="text-white font-semibold">结果与 KPI</div>
              <ul className="mt-3 list-disc list-inside text-text-secondary">
                <li>异常提前发现率 +32%</li>
<li>审计时间 -45%</li>
<li>质检返工率 -18%</li>
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
              <li>设备数量：1200+</li>
              <li>数据量级：5M 点/天</li>
              <li>链路选择：Solana 主网 / BSN 联盟链（可切换）</li>
              <li>周期：8 周（两期）</li>
            </ul>
            <a href="/contact" className="btn-primary mt-6 inline-block w-full text-center">申请同类方案</a>
          </aside>
        </div>
      </div>
    </div>
  );
}
