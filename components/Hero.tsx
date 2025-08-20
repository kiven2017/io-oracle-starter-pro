export default function Hero() {
  return (
    <section className="relative section">
      <div className="container text-center">
        <h1 className="text-5xl md:text-6xl font-bold">
          <span className="text-gold">让真实世界的数据，</span>可信上链
        </h1>
        <p className="mt-6 text-lg text-text-secondary max-w-2xl mx-auto">
          AI 增强的 iOT 预言机，提供“可信数据采集–签名–锚定–上链”的一站式能力，助力 RWA、供应链与合规审计。
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <a href="/contact" className="btn-primary">申请 14 天试点</a>
          <a href="#demo" className="btn-ghost">观看 90 秒演示</a>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-30"
           aria-hidden="true"
           style={{background: "radial-gradient(600px 300px at 50% 0%, rgba(212,175,55,0.25), transparent)"}} />
    </section>
  );
}
