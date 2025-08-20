export const metadata = { title: "文档中心 / Docs" };

export default function Docs() {
  return (
    <div className="section">
      <div className="container prose prose-invert max-w-none">
        <h1>文档中心</h1>
        <p>欢迎使用 iOT 预言机文档。本页为起步指引，后续可拆分为多级路由。</p>
        <h2>快速开始</h2>
        <ol>
          <li>申请密钥（控制台/邮件）</li>
          <li>注册设备（含公钥指纹）</li>
          <li>上报首个数据点</li>
          <li>获取锚定哈希并在链上回查</li>
        </ol>
        <h2>API 示例（cURL）</h2>
        <pre><code>{`curl -X POST https://api.example.com/v1/anchor \
  -H "Authorization: Bearer <API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"device_id":"dev-001","payload":"...","signature":"..."}'`}</code></pre>
        <h2>SDK</h2>
        <ul>
          <li><a href="#">Node.js</a></li>
          <li><a href="#">Python</a></li>
          <li><a href="#">Rust</a></li>
        </ul>
        <h2>变更日志</h2>
        <p>即将上线。</p>
      </div>
    </div>
  );
}
