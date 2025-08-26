import React from "react";
import { Link, NavLink } from "react-router-dom";

/**
 * Shared layout wrapper with navbar + footer
 * @param {{ bg?: string, children: React.ReactNode }} props
 */
export default function Layout({ bg = "app-bg", children }) {
  return (
    <div className={bg}>
      <nav className="navbar navbar-expand-lg px-3">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <span className="fs-4 h-title">
            🛡️ NeuroShield <span className="text-primary">X</span>
          </span>
        </Link>

        <div className="ms-auto d-flex gap-3">
          <NavLink className="nav-link" to="/">
            Dashboard
          </NavLink>
          <NavLink className="nav-link" to="/logs">
            Logs
          </NavLink>
          <NavLink className="nav-link" to="/status">
            Status
          </NavLink>
          <NavLink className="nav-link" to="/observability">
            Observability
          </NavLink>
        </div>
      </nav>

      <main className="container py-4">{children}</main>

      <footer className="container py-4 text-center subtitle">
        © 2025 NeuroShield X
      </footer>
    </div>
  );
}
