export default function NotFound() {
  return (
    <div className="section">
      <div className="container text-center">
        <h1 className="text-3xl font-bold text-gold">404 - 页面未找到</h1>
        <p className="mt-4 text-text-secondary">
          抱歉，您访问的页面不存在或已被移动。
        </p>
        <a href="/" className="btn-primary mt-6 inline-block">返回首页</a>
      </div>
    </div>
  );
}
