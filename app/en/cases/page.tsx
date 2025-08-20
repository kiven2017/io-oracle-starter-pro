export const metadata = { title: "Case Studies" };

const data = [
  {
    slug: "manufacturing-line",
    name: "East China Manufacturer · Trusted Line Data",
    kpi: ["+32% early anomaly detection", "-45% audit time"],
    desc: "Key stations sign data at source; AI anomaly detection; on-chain anchoring."
  },
  {
    slug: "seasia-cold-chain",
    name: "SE Asia Cold Chain · Temperature Disputes Resolved",
    kpi: ["-28% temperature deviation", "+37% claim efficiency"],
    desc: "Anchoring temperature, humidity and open-box events for quick forensics."
  },
  {
    slug: "green-energy-park",
    name: "Green Energy Park · Carbon Asset Metering",
    kpi: ["-50% audit hours", "-20% issuance cycle"],
    desc: "Standardized metering and verifiable on-chain evidence."
  }
];

export default function CasesEN() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">Case Studies</h1>
        <p className="mt-3 text-text-secondary">Stories + metrics, continuously updated.</p>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {data.map((c) => (
            <div key={c.slug} className="card">
              <div className="text-xl font-semibold text-white">{c.name}</div>
              <p className="mt-2 text-text-secondary">{c.desc}</p>
              <ul className="mt-3 space-y-1 text-text-secondary">
                {c.kpi.map((k) => <li key={k}>• {k}</li>)}
              </ul>
              <div className="mt-4 flex gap-3">
                <a href={`/en/cases/${c.slug}`} className="btn-primary">View details</a>
                <a href="/contact" className="btn-ghost">Talk to us</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
