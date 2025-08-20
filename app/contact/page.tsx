export const metadata = { title: "申请试点 / Contact" };

export default function Contact() {
  return (
    <div className="section">
      <div className="container max-w-2xl">
        <h1 className="text-3xl font-semibold">申请试点</h1>
        <p className="mt-3 text-text-secondary">请填写以下信息，我们将与您联系并提供 POC 指南与示例。</p>
        <form className="mt-8 grid gap-4" method="post" action="/api/lead">
          {["公司名称","联系人","邮箱","电话","行业","使用场景","数据量级"].map((label, idx) => (
            <div key={idx}>
              <label className="block text-sm text-text-secondary mb-2">{label}</label>
              <input required className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-gold outline-none" name={`f${idx}`} />
            </div>
          ))}
          <button className="btn-primary w-full" type="submit">提交申请</button>
        </form>
      </div>
    </div>
  );
}
