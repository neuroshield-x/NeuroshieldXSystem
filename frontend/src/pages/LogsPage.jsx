// src/pages/LogsPage.jsx
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Layout from "../components/Layout";

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // per-row explanation state
  const [expLoading, setExpLoading] = useState({});      // { idx: boolean }
  const [explanations, setExplanations] = useState({});  // { idx: string }
  const [errors, setErrors] = useState({});              // { idx: string }

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/logs");
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch {
        // you can toast/log here if you want
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const explainLog = async (idx, log) => {
    setErrors((e) => ({ ...e, [idx]: null }));
    setExpLoading((s) => ({ ...s, [idx]: true }));

    try {
      const res = await fetch("/api/explain/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timestamp: log.timestamp, message: log.message }),
      });
      const data = await res.json();
      const text =
        typeof data?.explanation === "string"
          ? data.explanation
          : JSON.stringify(data);
      setExplanations((m) => ({ ...m, [idx]: text }));
    } catch (e) {
      setErrors((er) => ({ ...er, [idx]: "Failed to fetch explanation." }));
    } finally {
      setExpLoading((s) => ({ ...s, [idx]: false }));
    }
  };

  return (
    <Layout bg="app-bg-logs">
      <h1 className="h-title mb-4">System Logs</h1>

      <div className="card-glass p-3">
        {loading ? (
          <div className="alert alert-info">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="alert alert-warning">No logs found.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 60 }}>#</th>
                  <th style={{ width: 220 }}>Timestamp</th>
                  <th>Message</th>
                  <th style={{ width: 140 }} className="text-end">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <React.Fragment key={index}>
                    <tr>
                      <td>{index + 1}</td>
                      <td className="text-monospace">{log.timestamp}</td>
                      <td>{log.message}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => explainLog(index, log)}
                          disabled={!!expLoading[index]}
                        >
                          {expLoading[index] ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              />
                              Explaining…
                            </>
                          ) : (
                            "Explain"
                          )}
                        </button>
                      </td>
                    </tr>

                    {(explanations[index] || errors[index]) && (
                      <tr className="table-active">
                        <td />
                        <td colSpan={3}>
                          {errors[index] ? (
                            <div className="alert alert-danger mb-0">
                              {errors[index]}
                            </div>
                          ) : (
                            <div className="alert alert-secondary mb-0">
                              <strong>Explanation:</strong>{" "}
                              <span>{explanations[index]}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
