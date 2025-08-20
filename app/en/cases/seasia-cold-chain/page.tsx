export const metadata = { title: "SE Asia Cold Chain · Temperature Disputes Resolved · Case Detail" };

export default function CaseDetailEN() {
  return (
    <div className="section">
      <div className="container">
        <a href="/en/cases" className="text-sm text-text-secondary">← Back to cases</a>
        <h1 className="text-3xl font-semibold mt-3">SE Asia Cold Chain · Temperature Disputes Resolved</h1>
        <p className="mt-3 text-text-secondary">Industry: Cold Chain Logistics · Region: SE Asia</p>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card md:col-span-2">
            <div className="text-white font-semibold">Overview</div>
            <p className="mt-3 text-text-secondary">Realtime temperature/humidity plus open-box/impact events anchored on-chain, improving claims processing.</p>

            <div className="mt-8">
              <div className="text-white font-semibold">Challenges</div>
              <ul className="mt-3 list-disc list-inside text-text-secondary">
                <li>Multi-carrier coordination</li>
<li>Frequent temperature disputes</li>
<li>Fragmented and untrusted evidence</li>
              </ul>
            </div>

            <div className="mt-8">
              <div className="text-white font-semibold">Solution</div>
              <ol className="mt-3 list-decimal list-inside text-text-secondary">
                <li>Realtime sensing & alerts</li>
<li>Open-box/impact event anchoring</li>
<li>One-click evidence reports</li>
              </ol>
            </div>

            <div className="mt-8">
              <div className="text-white font-semibold">Implementation</div>
              <p className="mt-3 text-text-secondary">Integrate with TMS/WMS via webhooks and query APIs to retrieve complete evidence chain.</p>
            </div>

            <div className="mt-8">
              <div className="text-white font-semibold">Results & KPIs</div>
              <ul className="mt-3 list-disc list-inside text-text-secondary">
                <li>-28% temperature deviation</li>
<li>+37% claim efficiency</li>
<li>-40% disputes</li>
              </ul>
            </div>

            <div className="mt-8">
              <div className="text-white font-semibold">On-chain Proof (sample)</div>
              <ul className="mt-3 list-disc list-inside text-text-secondary">
                <li>Solana Tx: <a href="#">111...abc</a></li>
                <li>BSN Proof: <a href="#">proof://example</a></li>
              </ul>
            </div>
          </div>

          <aside className="card">
            <div className="text-white font-semibold">Project Parameters</div>
            <ul className="mt-3 text-text-secondary space-y-2">
              <li>Devices: 3000+</li>
              <li>Data volume: 2M pts/day</li>
              <li>Chains: Solana mainnet</li>
              <li>Timeline: 6 weeks (1 phase)</li>
            </ul>
            <a href="/contact" className="btn-primary mt-6 inline-block w-full text-center">Request similar solution</a>
          </aside>
        </div>
      </div>
    </div>
  );
}
