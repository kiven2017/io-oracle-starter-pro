'use client';
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void; }) {
  return (
    <html>
      <body className="section">
        <div className="container text-center">
          <h2 className="text-2xl font-semibold text-gold">出错了</h2>
          <p className="mt-4 text-text-secondary">很抱歉，页面渲染出现问题。</p>
          <button className="btn-primary mt-6" onClick={() => reset()}>重试</button>
          <div className="mt-4 text-xs text-text-secondary">错误摘要：{error?.digest || 'N/A'}</div>
        </div>
      </body>
    </html>
  );
}
