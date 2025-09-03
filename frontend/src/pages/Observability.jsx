import React, { useEffect, useState, useMemo, useRef } from "react";
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
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const tableEndRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/logs");
        const data = await res.json();
        setLogs(Array.isArray(data) ? data.slice(-500) : []);
      } catch (e) {
        console.error("Failed to load logs", e);
      }
    };
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll to newest
  useEffect(() => {
    if (tableEndRef.current) {
      tableEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const s = normalizeSeverity(l);
      const matchSeverity = filter === "all" || s === filter;
      const matchQuery =
        query === "" || (l.message || "").toLowerCase().includes(query.toLowerCase());
      return matchSeverity && matchQuery;
    });
  }, [logs, filter, query]);

  const sevData = useMemo(() => {
    let low = 0,
      med = 0,
      hi = 0;
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
    return Object.entries(buckets)
      .slice(-12)
      .map(([t, count]) => ({ t, count }));
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
    return Object.entries(buckets)
      .slice(-12)
      .map(([t, alerts]) => ({ t, alerts }));
  }, [logs]);

  return (
    <Layout>
      <h1 className="h-title mb-3">Observability</h1>

      <div className="row g-3 mb-4">
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

      <div className="subtitle mb-3">
        Live view of system logs and severities. Data updates every 5 seconds.
      </div>

      {/* Filters */}
      <div className="d-flex gap-2 mb-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="form-select w-auto"
        >
          <option value="all">All Severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="text"
          placeholder="Search logs..."
          className="form-control"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Log table */}
      <div
        className="card-glass p-3"
        style={{ maxHeight: "60vh", overflow: "auto", backgroundColor: "black", color: "white" }}
      >
        <table className="table table-sm table-dark">
          <thead className="sticky-top" style={{ backgroundColor: "black", color: "white" }}>
            <tr>
              <th style={{ width: "20%" }}>Timestamp</th>
              <th style={{ width: "65%" }}>Message</th>
              <th style={{ width: "15%" }}>Severity</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(-200).map((l, i) => {
              const sev = normalizeSeverity(l);
              return (
                <tr key={i}>
                  <td className="text-monospace">{l.timestamp}</td>
                  <td>{l.message}</td>
                  <td>
                    <span
                      className={`badge ${
                        sev === "high"
                          ? "bg-danger"
                          : sev === "medium"
                          ? "bg-warning text-dark"
                          : sev === "low"
                          ? "bg-success"
                          : "bg-secondary"
                      }`}
                    >
                      {sev}
                    </span>
                  </td>
                </tr>
              );
            })}
            <tr ref={tableEndRef}></tr>
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
