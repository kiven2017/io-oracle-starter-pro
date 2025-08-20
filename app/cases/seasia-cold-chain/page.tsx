export const metadata = { title: "东南亚生鲜冷链 · 温控争议解决 · 案例详情" };

export default function CaseDetail() {
  return (
    <div className="section">
      <div className="container">
        <a href="/cases" className="text-sm text-text-secondary">← 返回案例</a>
        <h1 className="text-3xl font-semibold mt-3">东南亚生鲜冷链 · 温控争议解决</h1>
        <p className="mt-3 text-text-secondary">行业：冷链物流 · 区域：东南亚</p>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card md:col-span-2">
            <div className="text-white font-semibold">背景概览</div>
            <p className="mt-3 text-text-secondary">对冷链运输过程中的温湿度与开箱/撞击事件进行实时上报与锚定，提升索赔处理效率。</p>

            <div className="mt-8">
              <div className="text-white font-semibold">挑战</div>
              <ul className="mt-3 list-disc list-inside text-text-secondary">
                <li>多承运方协同难</li>
<li>温控数据争议频发</li>
<li>取证材料零散且不可被信任</li>
              </ul>
            </div>

            <div className="mt-8">
              <div className="text-white font-semibold">解决方案</div>
              <ol className="mt-3 list-decimal list-inside text-text-secondary">
                <li>实时温湿度采集与告警</li>
<li>开箱/撞击事件上链</li>
<li>一键导出取证报表</li>
              </ol>
            </div>

            <div className="mt-8">
              <div className="text-white font-semibold">实施与集成</div>
              <p className="mt-3 text-text-secondary">与 TMS/WMS 对接，通过 Webhook 回调和查询接口完成证据链检索。</p>
            </div>

            <div className="mt-8">
              <div className="text-white font-semibold">结果与 KPI</div>
              <ul className="mt-3 list-disc list-inside text-text-secondary">
                <li>温控偏差 -28%</li>
<li>索赔效率 +37%</li>
<li>争议工单 -40%</li>
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
              <li>设备数量：3000+</li>
              <li>数据量级：2M 点/天</li>
              <li>链路选择：Solana 主网</li>
              <li>周期：6 周（一期）</li>
            </ul>
            <a href="/contact" className="btn-primary mt-6 inline-block w-full text-center">申请同类方案</a>
          </aside>
        </div>
      </div>
    </div>
  );
}
