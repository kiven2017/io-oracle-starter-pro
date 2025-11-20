import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "iOT 预言机 · Black & Gold Starter",
  description: "把真实世界的数据，可信上链",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    title: "iOT 预言机",
    description: "AI 增强的 iOT 预言机，一站式解决方案",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="sticky top-0 z-50 backdrop-blur bg-black/70 border-b border-white/10">
          <nav className="container flex items-center justify-between h-16">
            <a href="/" className="font-semibold tracking-wide">
              <span className="text-gold">AI Oracle</span> / iOT 预言机
            </a>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <a href="/solutions">解决方案</a>
              <a href="/developers">开发者</a>
              <a href="/docs">文档</a>
              <a href="/pricing">定价</a>
              <a href="/about">关于我们</a>
            </div>
            <div className="flex items-center gap-4 text-sm mr-4">
              <a href="/" className="text-gold">ZH</a>
              <span className="text-white/40">|</span>
              <a href="/en" className="hover:text-gold">EN</a>
            </div>
            <a href="/contact" className="btn-primary shadow-gold-glow">申请试点</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="border-t border-white/10">
          <div className="container section grid md:grid-cols-3 gap-8 text-sm text-text-secondary">
            <div>
              <div className="font-semibold text-white">iOT 预言机</div>
              <p className="mt-3">AI 增强的预言机，把真实世界的数据安全带上链。</p>
            </div>
            <div>
              <div className="font-semibold text-white">链接</div>
              <ul className="mt-3 space-y-2">
                <li><a href="/docs">文档中心</a></li>
                <li><a href="/status">状态</a></li>
                <li><a href="/blog">博客</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-white">联系</div>
              <ul className="mt-3 space-y-2">
                <li>邮箱：<a href="mailto:info@AIOracle.link">info@AIOracle.link</a></li>
                <li>网址：<a href="https://www.AIOracle.link">www.AIOracle.link</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-xs text-text-secondary pb-8">© 2025 iOT Oracle. All rights reserved.</div>
        </footer>
      </body>
    </html>
  );
}
