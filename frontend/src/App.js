import React, { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState({
    alert: "Loading...",
    anomaly: "Loading...",
    explain: "Loading..."
  });

  useEffect(() => {
    fetch("/api/alert/health")
      .then(res => res.json())
      .then(data => setStatus(prev => ({ ...prev, alert: data.status })))
      .catch(() => setStatus(prev => ({ ...prev, alert: "❌ Error" })));

    fetch("/api/anomaly/health")
      .then(res => res.json())
      .then(data => setStatus(prev => ({ ...prev, anomaly: data.status })))
      .catch(() => setStatus(prev => ({ ...prev, anomaly: "❌ Error" })));

    fetch("/api/explain/health")
      .then(res => res.json())
      .then(data => setStatus(prev => ({ ...prev, explain: data.status })))
      .catch(() => setStatus(prev => ({ ...prev, explain: "❌ Error" })));
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>🛡️ NeuroShield X</h1>
      <ul>
        <li><strong>Alert API:</strong> {status.alert}</li>
        <li><strong>Anomaly Detector:</strong> {status.anomaly}</li>
        <li><strong>Explanation AI:</strong> {status.explain}</li>
      </ul>
    </div>
  );
}

export default App;
