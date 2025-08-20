export const metadata = { title: "Cold Chain & Risk · Solution" };
export default function Page() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">Cold Chain & Risk</h1>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card">
            <div className="text-white font-semibold">Challenges</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              <li>Temperature disputes</li><li>Multi-carrier coordination</li><li>Lack of strong evidence</li>
            </ul>
          </div>
          <div className="card">
            <div className="text-white font-semibold">Our Approach</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              <li>Realtime sensing + alerts</li><li>Open-box/impact events anchoring</li><li>One-click evidence report</li>
            </ul>
          </div>
          <div className="card">
            <div className="text-white font-semibold">KPIs (sample)</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              <li>-28% temperature deviation</li><li>+37% claim efficiency</li><li>-40% disputes</li>
            </ul>
          </div>
        </div>
        <div className="card mt-8">
          <div className="text-white font-semibold">Integration</div>
          <p className="mt-3 text-text-secondary">Gateway scripts + Webhook callbacks + on-chain anchoring. Postman collection & SDKs (Node / Python / Rust).</p>
          <div className="mt-4 flex gap-3">
            <a href="/contact" className="btn-primary">Get POC Guide</a>
            <a href="/en/docs" className="btn-ghost">Read Docs</a>
          </div>
        </div>
      </div>
    </div>
  );
}
