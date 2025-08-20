export const metadata = { title: "案例详情 / Case Detail" };

export default function CaseDetail() {
  return (
    <div className="section">
      <div className="container prose prose-invert max-w-none">
        <h1>华东制造集团 · 产线数据可信化</h1>
        <p className="text-text-secondary">本案例演示如何将工位/设备数据接入 iOT 预言机，形成可回放的链上证据链。</p>

        <h2>挑战</h2>
        <ul>
          <li>生产数据真实性缺乏保障</li>
          <li>审计追责难度高</li>
        </ul>

        <h2>解决方案</h2>
        <ul>
          <li>设备侧硬件签名与时间戳</li>
          <li>链上锚定与审计回放</li>
        </ul>

        <h2>成果</h2>
        <ul>
          <li>异常提前发现率 +32%</li>
          <li>合规审计效率提升 45%</li>
        </ul>

        <div className="mt-6 flex gap-3">
          <a href="/contact" className="btn-primary">联系获取方案</a>
          <a href="/cases" className="btn-ghost">返回案例列表</a>
        </div>
      </div>
    </div>
  );
}
