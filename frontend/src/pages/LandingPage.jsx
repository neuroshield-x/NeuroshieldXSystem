import React from "react";
import { Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

const LandingPage = () => {
  return (
    <div className="text-center p-5 bg-light">
      <header className="mb-4">
        <h1 className="display-4">🛡️ NeuroShield X</h1>
        <p className="lead">AI-Powered SIEM that Thinks Ahead</p>
      </header>

      <section className="mb-5">
        <p className="fs-5">
          Detect log anomalies instantly, understand complex security alerts,
          and get actionable recommendations — all powered by neural networks.
        </p>
      </section>

      <section className="mb-4">
        <Link to="/logs" className="btn btn-primary btn-lg me-3">
          View Logs
        </Link>
        <Link to="/status" className="btn btn-outline-secondary btn-lg">
          System Status
        </Link>
      </section>

      <footer className="mt-5 text-muted">
        <small>&copy; 2025 NeuroShield X</small>
      </footer>
    </div>
  );
};

export default LandingPage;
