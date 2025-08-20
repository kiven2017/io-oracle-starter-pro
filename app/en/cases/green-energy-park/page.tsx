export const metadata = { title: "Green Energy Park · Carbon Asset Metering · Case Detail" };

export default function CaseDetailEN() {
  return (
    <div className="section">
      <div className="container">
        <a href="/en/cases" className="text-sm text-text-secondary">← Back to cases</a>
        <h1 className="text-3xl font-semibold mt-3">Green Energy Park · Carbon Asset Metering</h1>
        <p className="mt-3 text-text-secondary">Industry: Energy / Carbon · Region: South China</p>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card md:col-span-2">
            <div className="text-white font-semibold">Overview</div>
            <p className="mt-3 text-text-secondary">Standardize metering and anchor data on-chain to generate auditable artifacts supporting carbon credit issuance.</p>

            <div className="mt-8">
              <div className="text-white font-semibold">Challenges</div>
              <ul className="mt-3 list-disc list-inside text-text-secondary">
                <li>Non-unified metering for multiple energy types</li>
<li>High manual audit cost</li>
<li>Low trust in reduction data</li>
              </ul>
            </div>

            <div className="mt-8">
              <div className="text-white font-semibold">Solution</div>
              <ol className="mt-3 list-decimal list-inside text-text-secondary">
                <li>Standardized metering APIs</li>
<li>AI anomaly detection & forensics</li>
<li>Auto-generated audit materials</li>
              </ol>
            </div>

            <div className="mt-8">
              <div className="text-white font-semibold">Implementation</div>
              <p className="mt-3 text-text-secondary">Connect to metering devices and data middleware; use SDK and callbacks to build evidence chain.</p>
            </div>

            <div className="mt-8">
              <div className="text-white font-semibold">Results & KPIs</div>
              <ul className="mt-3 list-disc list-inside text-text-secondary">
                <li>-50% audit hours</li>
<li>-20% issuance cycle</li>
<li>-40% missed anomalies</li>
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
              <li>Devices: 800+</li>
              <li>Data volume: 1.2M pts/day</li>
              <li>Chains: BSN consortium</li>
              <li>Timeline: 10 weeks (2 phases)</li>
            </ul>
            <a href="/contact" className="btn-primary mt-6 inline-block w-full text-center">Request similar solution</a>
          </aside>
        </div>
      </div>
    </div>
  );
}
