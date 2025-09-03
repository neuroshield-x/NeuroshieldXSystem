import React from "react";

/**
 * KPI card component
 * @param {{
 *   label: string,
 *   value: string|number,
 *   trend?: string,
 *   tone?: 'good'|'bad'|'neutral',
 *   size?: 'xs'|'sm'|'md'|'lg',
 *   clamp?: boolean   // true = clamp to 2 lines (default), false = unlimited wrap
 * }} props
 */
export default function StatCard({
  label,
  value,
  trend,
  tone = "neutral",
  size = "md",
  clamp = false, // set to true if you prefer 2-line clamp; false shows full text
}) {
  const toneClass =
    tone === "good" ? "stat-good" : tone === "bad" ? "stat-bad" : "stat-neutral";

  const sizeClass =
    size === "xs" ? "xs" : size === "sm" ? "sm" : size === "lg" ? "lg" : "md";

  // choose wrapping mode
  const wrapClass = clamp ? "line-clamp-2" : "wrap-normal";

  const shown = value !== undefined && value !== null ? String(value) : "—";

  return (
    <div className="card-glass p-3 h-100 stat-card" title={shown}>
      <div className="stat-label">{label}</div>

      <div className={`stat-value ${toneClass} ${sizeClass} ${wrapClass}`}>
        {shown}
      </div>

      {trend ? <div className="subtitle wrap-normal">{trend}</div> : null}
    </div>
  );
}