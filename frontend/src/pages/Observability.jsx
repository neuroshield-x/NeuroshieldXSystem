import React from "react";
import Layout from "../components/Layout";

export default function Observability() {
  return (
    <Layout>
      <h1 className="h-title mb-3">Observability</h1>

      <div className="card-glass p-2" style={{ height: "80vh" }}>
        {/* If you proxy SigNoz via NGINX at /signoz/, this will work out of the box */}
        <iframe
          title="SigNoz"
          src="/signoz/dashboards"
          style={{ border: 0, width: "100%", height: "100%", borderRadius: 12 }}
        />
      </div>

      <div className="subtitle mt-2">
        Tip: Replace <code>/signoz/dashboards</code> with your SigNoz share URL
        or a proxied path configured in your gateway.
      </div>
    </Layout>
  );
}
