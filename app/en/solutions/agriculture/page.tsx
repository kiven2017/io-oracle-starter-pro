export const metadata = { title: "Agriculture & Origin · Solution" };
export default function Page() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">Agriculture & Origin</h1>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card">
            <div className="text-white font-semibold">Challenges</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              <li>Dispersed provenance data</li><li>Anti-counterfeiting challenges</li><li>RWA needs trusted base data</li>
            </ul>
          </div>
          <div className="card">
            <div className="text-white font-semibold">Our Approach</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              <li>Sensors + land DID</li><li>Harvest/processing events anchored</li><li>Bind with on-chain credentials/NFTs</li>
            </ul>
          </div>
          <div className="card">
            <div className="text-white font-semibold">KPIs (sample)</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              <li>+25% provenance conversions</li><li>-35% counterfeit complaints</li><li>Higher RWA collateral acceptance</li>
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
