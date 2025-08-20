export const metadata = { title: "Pricing" };

export default function Pricing() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">Pricing</h1>
        <p className="mt-3 text-text-secondary">Flexible tiers for developers and enterprises.</p>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card">
            <div className="text-xl font-semibold text-white">Free Developer</div>
            <div className="mt-2 text-3xl text-gold">$0</div>
            <ul className="mt-4 space-y-2 text-text-secondary">
              <li>100k datapoints / month</li>
              <li>Basic anchoring & query</li>
              <li>Community support</li>
            </ul>
          </div>
          <div className="card ring-1 ring-gold">
            <div className="text-xl font-semibold text-white">Pro</div>
            <div className="mt-2 text-3xl text-gold">$299 / mo</div>
            <ul className="mt-4 space-y-2 text-text-secondary">
              <li>Usage-based scaling</li>
              <li>Webhook callbacks</li>
              <li>99.9% SLA, email support</li>
            </ul>
          </div>
          <div className="card">
            <div className="text-xl font-semibold text-white">Enterprise</div>
            <div className="mt-2 text-3xl text-gold">Custom</div>
            <ul className="mt-4 space-y-2 text-text-secondary">
              <li>Private deployment</li>
              <li>Industry compliance modules</li>
              <li>Dedicated support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
