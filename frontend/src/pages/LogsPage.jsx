import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // per-row explanation state
  const [expLoading, setExpLoading] = useState({});       // { idx: true|false }
  const [explanations, setExplanations] = useState({});   // { idx: "text" | null }
  const [errors, setErrors] = useState({});               // { idx: "error msg" | null }

  useEffect(() => {
    fetch("/api/logs")               // NGINX proxies to alert-api
      .then((res) => res.json())
      .then((data) => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch logs", err);
        setLoading(false);
      });
  }, []);

  const explainLog = async (idx, log) => {
    setErrors((e) => ({ ...e, [idx]: null }));
    setExpLoading((s) => ({ ...s, [idx]: true }));
    try {
      const res = await fetch("/api/explain/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: log.timestamp,
          message: log.message,
        }),
      });
      const data = await res.json();
      const text =
        typeof data?.explanation === "string"
          ? data.explanation
          : JSON.stringify(data);
      setExplanations((m) => ({ ...m, [idx]: text }));
    } catch (e) {
      console.error("Explain failed", e);
      setErrors((er) => ({ ...er, [idx]: "Failed to fetch explanation." }));
    } finally {
      setExpLoading((s) => ({ ...s, [idx]: false }));
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">📄 System Logs</h1>

      {loading ? (
        <div className="alert alert-info">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="alert alert-warning">No logs found.</div>
      ) : (
        <table className="table table-striped table-hover border align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ width: 60 }}>#</th>
              <th style={{ width: 280 }}>Timestamp</th>
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

                {/* Inline explanation panel */}
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
      )}

      <div className="mt-4">
        <a href="/" className="btn btn-outline-secondary">
          ⬅ Back to Home
        </a>
      </div>
    </div>
  );
};

export default LogsPage;
