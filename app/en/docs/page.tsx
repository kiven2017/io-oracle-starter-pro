export const metadata = { title: "Docs" };
export default function DocsEN() {
  return (
    <div className="section">
      <div className="container prose prose-invert max-w-none">
        <h1>Documentation</h1>
        <p>Welcome to the iOT Oracle docs. This is a starter page you can split into deeper sections.</p>
        <h2>Quickstart</h2>
        <ol>
          <li>Request API key</li>
          <li>Register device (with public key fingerprint)</li>
          <li>Post first datapoint</li>
          <li>Get anchor hash and verify on-chain</li>
        </ol>
      </div>
    </div>
  );
}
