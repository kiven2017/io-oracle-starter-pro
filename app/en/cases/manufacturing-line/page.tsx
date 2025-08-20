export const metadata = { title: "East China Manufacturer · Trusted Line Data · Case Detail" };

export default function CaseDetailEN() {
  return (
    <div className="section">
      <div className="container">
        <a href="/en/cases" className="text-sm text-text-secondary">← Back to cases</a>
        <h1 className="text-3xl font-semibold mt-3">East China Manufacturer · Trusted Line Data</h1>
        <p className="mt-3 text-text-secondary">Industry: Manufacturing · Region: East China</p>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card md:col-span-2">
            <div className="text-white font-semibold">Overview</div>
            <p className="mt-3 text-text-secondary">Key stations sign data on device, gateway aggregates and runs anomaly detection, then anchor to chain for audit replay.</p>

            <div className="mt-8">
              <div className="text-white font-semibold">Challenges</div>
              <ul className="mt-3 list-disc list-inside text-text-secondary">
                <li>Inconsistent schemas across stations</li>
<li>Human tampering risk</li>
<li>Insufficient evidence for accountability</li>
              </ul>
            </div>

            <div className="mt-8">
              <div className="text-white font-semibold">Solution</div>
              <ol className="mt-3 list-decimal list-inside text-text-secondary">
                <li>Device-side signing & timestamps</li>
<li>Gateway CBOR normalization and buffering</li>
<li>AI anomaly detection and events</li>
<li>Merkle batch anchoring</li>
              </ol>
            </div>

            <div className="mt-8">
              <div className="text-white font-semibold">Implementation</div>
              <p className="mt-3 text-text-secondary">Integrate with MES/SCADA, add gateway and API callbacks to form a single chain of custody.</p>
            </div>

            <div className="mt-8">
              <div className="text-white font-semibold">Results & KPIs</div>
              <ul className="mt-3 list-disc list-inside text-text-secondary">
                <li>+32% early anomaly detection</li>
<li>-45% audit time</li>
<li>-18% rework rate</li>
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
              <li>Devices: 1200+</li>
              <li>Data volume: 5M pts/day</li>
              <li>Chains: Solana mainnet / BSN consortium</li>
              <li>Timeline: 8 weeks (2 phases)</li>
            </ul>
            <a href="/contact" className="btn-primary mt-6 inline-block w-full text-center">Request similar solution</a>
          </aside>
        </div>
      </div>
    </div>
  );
}
