// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Global styles
import "bootstrap/dist/css/bootstrap.min.css";

// Pages
import App from "./App";                 // Status page
import Dashboard from "./pages/Dashboard";
import LogsPage from "./pages/LogsPage";
import Observability from "./pages/Observability";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/logs" element={<LogsPage />} />
      <Route path="/status" element={<App />} />
      <Route path="/observability" element={<Observability />} />
    </Routes>
  </Router>
);
