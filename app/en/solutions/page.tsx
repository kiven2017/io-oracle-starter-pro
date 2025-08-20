export const metadata = { title: "Solutions" };
const items = [
  { href: "/en/solutions/manufacturing", title: "Manufacturing & Supply Chain", desc: "Trusted data on-chain with tamper-evidence." },
  { href: "/en/solutions/agriculture",  title: "Agriculture & Origin", desc: "Sensors + DID for RWA and provenance." },
  { href: "/en/solutions/cold-chain",   title: "Cold Chain & Risk", desc: "Temperature, humidity & open-box events." },
  { href: "/en/solutions/energy",       title: "Energy / Carbon Assets", desc: "Standardized metering and audit automation." },
];

export default function SolutionsEN() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">Solutions</h1>
        <p className="mt-3 text-text-secondary">Templates for fast integration and auditable evidence.</p>
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {items.map((i) => (
            <a key={i.href} href={i.href} className="card block hover:bg-white/10 transition">
              <div className="text-xl font-semibold text-white">{i.title}</div>
              <p className="mt-2 text-text-secondary">{i.desc}</p>
              <div className="mt-4 text-gold">View details →</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
