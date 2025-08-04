import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/logs")
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch logs", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="mb-4">📄 System Logs</h1>

      {loading ? (
        <div className="alert alert-info">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="alert alert-warning">No logs found.</div>
      ) : (
        <table className="table table-striped table-hover border">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Timestamp</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{log.timestamp}</td>
                <td>{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-4">
        <a href="/" className="btn btn-outline-secondary">⬅ Back to Home</a>
      </div>
    </div>
  );
};

export default LogsPage;
