export const metadata = { title: "Manufacturing & Supply Chain · Solution" };
export default function Page() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">Manufacturing & Supply Chain</h1>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card">
            <div className="text-white font-semibold">Challenges</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              <li>Inconsistent data schemas across stations</li><li>Human tampering risks</li><li>High audit cost</li>
            </ul>
          </div>
          <div className="card">
            <div className="text-white font-semibold">Our Approach</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              <li>Device-side key signing & timestamps</li><li>Gateway CBOR normalization & buffering</li><li>AI anomaly detection</li><li>Merkle batch anchoring</li>
            </ul>
          </div>
          <div className="card">
            <div className="text-white font-semibold">KPIs (sample)</div>
            <ul className="mt-3 list-disc list-inside text-text-secondary">
              <li>+32% earlier anomaly detection</li><li>-45% audit time</li><li>-18% rework rate</li>
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
