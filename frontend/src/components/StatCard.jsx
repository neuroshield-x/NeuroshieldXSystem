import React from "react";

/**
 * KPI card component
 * @param {{ label: string, value: string|number, trend?: string, tone?: 'good'|'bad'|'neutral' }} props
 */
export default function StatCard({ label, value, trend, tone = "neutral" }) {
  const color =
    tone === "good"
      ? "text-success"
      : tone === "bad"
      ? "text-danger"
      : "text-primary";

  return (
    <div className="card-glass p-3 h-100">
      <div className="subtitle">{label}</div>
      <div className={`display-6 h-title ${color}`}>
        {value !== undefined ? value : "—"}
      </div>
      {trend && <div className="subtitle">{trend}</div>}
    </div>
  );
}
