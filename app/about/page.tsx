export default function AboutPage() {
  return (
    <>
      {/* 关于我们 */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white">关于 <span className="text-gold">AI Oracle</span></h1>
            <p className="mt-6 text-lg text-text-secondary max-w-3xl mx-auto">
              AI Oracle 致力于打造下一代可信数据基础设施，通过 AI 增强的 IoT 预言机技术，
              为 Web3 生态提供真实世界数据的可信上链解决方案。
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="card">
              <div className="text-2xl font-semibold text-gold mb-4">🎯 我们的使命</div>
              <p className="text-text-secondary leading-relaxed text-lg">
                构建真实世界与区块链之间的可信桥梁，让物理世界的数据以可验证、
                不可篡改的方式进入 Web3 生态，推动 RWA、供应链金融、合规审计等场景落地。
              </p>
            </div>
            
            <div className="card">
              <div className="text-2xl font-semibold text-gold mb-4">💡 技术优势</div>
              <p className="text-text-secondary leading-relaxed text-lg">
                结合硬件安全模块（HSM）、AI 异常检测、零知识证明等前沿技术，
                确保数据从采集、传输到上链的全流程可信，为企业级应用提供坚实保障。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 核心价值 */}
      <section className="section bg-black/30">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">核心价值</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🔐",
                title: "数据真实性",
                desc: "设备端硬件签名 + AI 异常检测，从源头保障数据真实可信，防止篡改和伪造。"
              },
              {
                icon: "⛓️",
                title: "上链确定性",
                desc: "可验证时间戳与 Merkle 树锚定，确保数据上链的不可篡改性，便于审计和回溯。"
              },
              {
                icon: "🚀",
                title: "易于集成",
                desc: "提供标准化 API/SDK，5 分钟完成接入，支持多种区块链和物联网协议。"
              }
            ].map((item, idx) => (
              <div key={idx} className="card text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 合作伙伴 */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">合作伙伴</h2>
            <p className="mt-4 text-text-secondary">与行业领先企业共同推动可信数据生态建设</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {name: "华为云", category: "云服务"},
              {name: "阿里云", category: "云服务"},
              {name: "腾讯云", category: "云服务"},
              {name: "AWS", category: "云服务"},
              {name: "Chainlink", category: "区块链"},
              {name: "Polygon", category: "区块链"},
              {name: "物联网协会", category: "行业组织"},
              {name: "工信部认证", category: "资质认证"},
            ].map((partner, idx) => (
              <div key={idx} className="card text-center hover:border-gold/50 transition-colors">
                <div className="text-lg font-semibold text-white">{partner.name}</div>
                <div className="mt-2 text-sm text-text-secondary">{partner.category}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 公司动态 */}
      <section className="section bg-black/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">最新动态</h2>
            <p className="mt-4 text-text-secondary">了解 AI Oracle 的最新进展</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                date: "2024-11",
                title: "AI Oracle 完成 A 轮融资",
                desc: "获得多家知名投资机构青睐，总融资额达 1000 万美元，将用于技术研发和市场拓展。",
                tag: "融资"
              },
              {
                date: "2024-10",
                title: "成功落地东南亚冷链项目",
                desc: "为东南亚最大的冷链物流企业提供全程温控数据上链服务，覆盖 200+ 冷藏车辆。",
                tag: "案例"
              },
              {
                date: "2024-09",
                title: "获得工信部认证资质",
                desc: "通过国家工信部数据安全与隐私保护认证，成为首批获得资质的 Web3 数据服务商。",
                tag: "资质"
              },
            ].map((news, idx) => (
              <div key={idx} className="card hover:border-gold/50 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 text-xs font-semibold bg-gold/20 text-gold rounded-full">
                    {news.tag}
                  </span>
                  <span className="text-sm text-text-secondary">{news.date}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{news.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{news.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 联系我们 */}
      <section className="section">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">联系我们</h2>
          <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
            想了解更多关于 AI Oracle 的信息？欢迎与我们联系，我们的团队随时为您服务。
          </p>
          <div className="flex justify-center gap-4">
            <a href="/contact" className="btn-primary">申请试点</a>
            <a href="mailto:info@AIOracle.link" className="btn-ghost">发送邮件</a>
          </div>
        </div>
      </section>
    </>
  );
}
