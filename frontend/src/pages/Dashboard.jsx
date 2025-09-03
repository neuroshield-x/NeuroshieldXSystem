// frontend/src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import TrafficArea from "../components/charts/TrafficArea";
import SeverityPie from "../components/charts/SeverityPie";
import AlertTimeline from "../components/charts/AlertTimeline";

// Normalize into: 'low' | 'medium' | 'high' | 'none'
function normalizeSeverity(l) {
  const raw = String(l.severity ?? "").trim().toLowerCase();
  if (["low", "info", "debug", "trace"].includes(raw)) return "low";
  if (["medium", "med", "warn", "warning", "notice"].includes(raw)) return "medium";
  if (["high", "error", "critical", "fatal", "anomaly", "alert"].includes(raw)) return "high";

  const msg = l.message || "";

  // explicit token: severity=LOW / severity: medium
  const m = /severity\s*[:=]\s*(low|medium|med|high)/i.exec(msg);
  if (m) {
    const v = m[1].toLowerCase();
    return v === "med" ? "medium" : v;
  }

  // keyword-based inference
  if (/(fatal|critical|anomaly|fail|failure|error|🔥)/i.test(msg)) return "high";
  if (/(warn|warning|degraded|retry)/i.test(msg)) return "medium";
  if (/(ok|success|login|stable|info|debug|memory usage|disk usage)/i.test(msg)) return "low";

  return "none";
}

export default function Dashboard() {
  const [health, setHealth] = useState({
    alert: "…",
    anomaly: "…",
    explain: "…",
  });
  const [logs, setLogs] = useState([]);

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
        // keep the latest ~200
        setLogs(Array.isArray(js) ? js.slice(-200) : []);
      } catch {}
    };

    fetchAll();
    const id = setInterval(fetchAll, 15000);
    return () => clearInterval(id);
  }, []);

  const kpis = useMemo(() => {
    const anomalies = logs.filter((l) => normalizeSeverity(l) === "high").length;
    return {
      totalLogs: logs.length,
      anomalies,
      last5m: logs.slice(-50).length,
    };
  }, [logs]);

  const areaData = useMemo(() => {
    const buckets = {};
    logs.forEach((l) => {
      const t = (l.timestamp || "").slice(11, 16);
      buckets[t] = (buckets[t] || 0) + 1;
    });
    return Object.entries(buckets)
      .slice(-12)
      .map(([t, count]) => ({ t, count }));
  }, [logs]);

  const sevData = useMemo(() => {
    let low = 0, med = 0, hi = 0;
    logs.forEach((l) => {
      const s = normalizeSeverity(l);
      if (s === "low") low += 1;
      else if (s === "medium") med += 1;
      else if (s === "high") hi += 1;
    });
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
      const s = normalizeSeverity(l);
      // Count any log that has a recognized severity
      const isAlertish = s === "low" || s === "medium" || s === "high";
      buckets[t] = (buckets[t] || 0) + (isAlertish ? 1 : 0);
    });
    return Object.entries(buckets)
      .slice(-12)
      .map(([t, alerts]) => ({ t, alerts }));
  }, [logs]);

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h1 className="h-title display-6 mb-1">NeuroShield Operations Center</h1>
          <div className="subtitle">AI-Powered SIEM that thinks ahead</div>
        </div>
        <div>
          <Link to="/logs" className="btn btn-primary btn-sm">
            View Logs
          </Link>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <StatCard
            label="Total Logs"
            value={kpis.totalLogs}
            trend={`Last 5m: ${kpis.last5m}`}
            size="md"
          />
        </div>
        <div className="col-md-3">
          <StatCard
            label="Anomalies"
            value={kpis.anomalies}
            tone={kpis.anomalies ? "bad" : "good"}
            size="md"
          />
        </div>
        <div className="col-md-2">
          <StatCard
            label="Alert API"
            value={health.alert}
            tone={health.alert === "running" ? "good" : "bad"}
            size="xs"
            clamp={false}
          />
        </div>
        <div className="col-md-2">
          <StatCard
            label="Detector"
            value={health.anomaly}
            tone={health.anomaly === "running" ? "good" : "bad"}
            size="xs"
            clamp={false}
          />
        </div>
        <div className="col-md-2">
          <StatCard
            label="Explain AI"
            value={health.explain}
            tone={/running/i.test(health.explain) ? "good" : "bad"}
            size="xs"
            clamp={false}
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
                  <span className="ms-3 badge bg-secondary">
                    {normalizeSeverity(l)}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
