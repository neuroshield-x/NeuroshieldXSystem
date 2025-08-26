// src/App.js
import React, { useEffect, useState } from "react";
import Layout from "./components/Layout";

export default function App() {
  const [status, setStatus] = useState({
    alert: "Loading...",
    anomaly: "Loading...",
    explain: "Loading...",
  });

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const r = await fetch("/api/alert/health");
        const js = await r.json();
        setStatus((s) => ({ ...s, alert: js.status }));
      } catch {
        setStatus((s) => ({ ...s, alert: "❌ Error" }));
      }

      try {
        const r = await fetch("/api/anomaly/health");
        const js = await r.json();
        setStatus((s) => ({ ...s, anomaly: js.status }));
      } catch {
        setStatus((s) => ({ ...s, anomaly: "❌ Error" }));
      }

      try {
        const r = await fetch("/api/explain/health");
        const js = await r.json();
        setStatus((s) => ({ ...s, explain: js.status }));
      } catch {
        setStatus((s) => ({ ...s, explain: "❌ Error" }));
      }
    };

    fetchHealth();
  }, []);

  return (
    <Layout>
      <h1 className="h-title mb-3">Service Health</h1>
      <ul className="list-unstyled">
        <li>
          <strong>Alert API:</strong> {status.alert}
        </li>
        <li>
          <strong>Anomaly Detector:</strong> {status.anomaly}
        </li>
        <li>
          <strong>Explanation AI:</strong> {status.explain}
        </li>
      </ul>
    </Layout>
  );
}
