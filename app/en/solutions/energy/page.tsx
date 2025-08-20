export const metadata = { title: "Energy / Carbon Assets · Solution" };
export default function Page() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">Energy / Carbon Assets</h1>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card">
            <div className="text-white font-semibold">Challenges</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              <li>Non-standard metering</li><li>Manual audits</li><li>Low trust in reductions</li>
            </ul>
          </div>
          <div className="card">
            <div className="text-white font-semibold">Our Approach</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              <li>Standardized metering APIs</li><li>AI anomaly detection + forensics</li><li>Auto-generated audit artifacts</li>
            </ul>
          </div>
          <div className="card">
            <div className="text-white font-semibold">KPIs (sample)</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              <li>-50% audit hours</li><li>-20% issuance cycle</li><li>-40% missed anomalies</li>
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
