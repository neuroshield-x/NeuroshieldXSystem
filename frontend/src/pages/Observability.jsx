import React, { useEffect, useState, useMemo } from "react";
import Layout from "../components/Layout";
import SeverityPie from "../components/charts/SeverityPie";
import TrafficArea from "../components/charts/TrafficArea";
import AlertTimeline from "../components/charts/AlertTimeline";

// same normalization as in Dashboard
function normalizeSeverity(l) {
  const raw = String(l.severity ?? "").trim().toLowerCase();
  if (["low", "info", "debug", "trace"].includes(raw)) return "low";
  if (["medium", "med", "warn", "warning", "notice"].includes(raw)) return "medium";
  if (["high", "error", "critical", "fatal", "anomaly", "alert"].includes(raw)) return "high";
  const msg = l.message || "";
  if (/(fatal|critical|anomaly|fail|failure|error|🔥)/i.test(msg)) return "high";
  if (/(warn|warning|degraded|retry)/i.test(msg)) return "medium";
  if (/(ok|success|login|stable|info|debug|memory usage|disk usage)/i.test(msg)) return "low";
  return "none";
}

export default function Observability() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/logs?severity=all&limit=500");
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load logs", e);
      }
    };
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const sevData = useMemo(() => {
    let low = 0, med = 0, hi = 0;
    logs.forEach((l) => {
      const s = normalizeSeverity(l);
      if (s === "low") low++;
      else if (s === "medium") med++;
      else if (s === "high") hi++;
    });
    return [
      { name: "Low", value: low },
      { name: "Medium", value: med },
      { name: "High", value: hi },
    ];
  }, [logs]);

  const areaData = useMemo(() => {
    const buckets = {};
    logs.forEach((l) => {
      const t = (l.timestamp || "").slice(11, 16);
      buckets[t] = (buckets[t] || 0) + 1;
    });
    return Object.entries(buckets).slice(-12).map(([t, count]) => ({ t, count }));
  }, [logs]);

  const timeline = useMemo(() => {
    const buckets = {};
    logs.forEach((l) => {
      const t = (l.timestamp || "").slice(11, 16);
      const s = normalizeSeverity(l);
      if (["low", "medium", "high"].includes(s)) {
        buckets[t] = (buckets[t] || 0) + 1;
      }
    });
    return Object.entries(buckets).slice(-12).map(([t, alerts]) => ({ t, alerts }));
  }, [logs]);

  return (
    <Layout>
      <h1 className="h-title mb-3">Observability</h1>

      <div className="row g-3">
        <div className="col-lg-4">
          <SeverityPie data={sevData} />
        </div>
        <div className="col-lg-4">
          <TrafficArea data={areaData} />
        </div>
        <div className="col-lg-4">
          <AlertTimeline data={timeline} />
        </div>
      </div>

      <div className="subtitle mt-3">
        Live view of system logs and severities. Data updates every 15 seconds.
      </div>
    </Layout>
  );
}
