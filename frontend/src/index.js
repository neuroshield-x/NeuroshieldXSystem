import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import LandingPage from "./pages/LandingPage";  // ← we’ll create this in Step 2
import LogsPage from "./pages/LogsPage";        // ← we’ll create this later too

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/logs" element={<LogsPage />} />
      <Route path="/status" element={<App />} /> {/* your original health check */}
    </Routes>
  </Router>
);
