import React, { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import TrafficArea from "../components/charts/TrafficArea";
import SeverityPie from "../components/charts/SeverityPie";
import AlertTimeline from "../components/charts/AlertTimeline";

export default function Dashboard() {
  const [health, setHealth] = useState({
    alert: "…",
    anomaly: "…",
    explain: "…",
  });
  const [logs, setLogs] = useState([]);

  // Poll health + logs every 15s
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const r = await fetch("/api/alert/health");
        const js = await r.json();
        setHealth((h) => ({ ...h, alert: js.status }));
      } catch {}

      try {
        const r = await fetch("/api/anomaly/health");
        const js = await r.json();
        setHealth((h) => ({ ...h, anomaly: js.status }));
      } catch {}

      try {
        const r = await fetch("/api/explain/health");
        const js = await r.json();
        setHealth((h) => ({ ...h, explain: js.status }));
      } catch {}

      try {
        const r = await fetch("/api/logs");
        const js = await r.json();
        setLogs(Array.isArray(js) ? js.slice(-200) : []);
      } catch {}
    };

    fetchAll();
    const id = setInterval(fetchAll, 15000);
    return () => clearInterval(id);
  }, []);

  // KPIs
  const kpis = useMemo(
    () => ({
      totalLogs: logs.length,
      anomalies: logs.filter((l) =>
        /anomaly|error|fail|threat/i.test(l.message)
      ).length,
      last5m: logs.slice(-50).length,
    }),
    [logs]
  );

  // Data for charts
  const areaData = useMemo(() => {
    const buckets = {};
    logs.forEach((l) => {
      const t = (l.timestamp || "").slice(11, 16); // HH:MM
      buckets[t] = (buckets[t] || 0) + 1;
    });
    return Object.entries(buckets)
      .slice(-12)
      .map(([t, count]) => ({ t, count }));
  }, [logs]);

  const sevData = useMemo(() => {
    const low = logs.filter((l) => /info|low/i.test(l.message)).length;
    const med = logs.filter((l) => /warn|medium/i.test(l.message)).length;
    const hi = logs.filter((l) =>
      /error|critical|high|anomaly/i.test(l.message)
    ).length;
    return [
      { name: "Low", value: low },
      { name: "Medium", value: med },
      { name: "High", value: hi },
    ];
  }, [logs]);

  const timeline = useMemo(() => {
    const buckets = {};
    logs.forEach((l) => {
      const t = (l.timestamp || "").slice(11, 16);
      const isAlert = /error|critical|anomaly|fail/i.test(l.message);
      buckets[t] = (buckets[t] || 0) + (isAlert ? 1 : 0);
    });
    return Object.entries(buckets)
      .slice(-12)
      .map(([t, alerts]) => ({ t, alerts }));
  }, [logs]);

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="h-title display-5">NeuroShield Operations Center</h1>
        <div className="subtitle">AI-Powered SIEM that thinks ahead</div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <StatCard
            label="Total Logs"
            value={kpis.totalLogs}
            trend={`Last 5m: ${kpis.last5m}`}
          />
        </div>
        <div className="col-md-3">
          <StatCard
            label="Anomalies"
            value={kpis.anomalies}
            tone={kpis.anomalies ? "bad" : "good"}
          />
        </div>
        <div className="col-md-2">
          <StatCard
            label="Alert API"
            value={health.alert}
            tone={health.alert === "running" ? "good" : "bad"}
          />
        </div>
        <div className="col-md-2">
          <StatCard
            label="Detector"
            value={health.anomaly}
            tone={health.anomaly === "running" ? "good" : "bad"}
          />
        </div>
        <div className="col-md-2">
          <StatCard
            label="Explain AI"
            value={health.explain}
            tone={health.explain === "explanation-ai is running" ? "good" : "bad"}
          />
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-lg-6">
          <TrafficArea data={areaData} />
        </div>
        <div className="col-lg-6">
          <AlertTimeline data={timeline} />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-4">
          <SeverityPie data={sevData} />
        </div>
        <div className="col-lg-8 card-glass p-3">
          <div className="h5 h-title mb-3">Recent Activity</div>
          <ul
            className="list-unstyled m-0"
            style={{ maxHeight: 260, overflow: "auto" }}
          >
            {logs
              .slice(-10)
              .reverse()
              .map((l, i) => (
                <li
                  key={i}
                  className="d-flex justify-content-between py-2 border-bottom border-opacity-25"
                >
                  <span className="text-monospace me-3">{l.timestamp}</span>
                  <span className="flex-grow-1">{l.message}</span>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
