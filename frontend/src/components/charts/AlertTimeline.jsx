import React, { memo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * Alerts over time line chart.
 * @param {{ data: Array<{ t: string, alerts: number }> }} props
 */
function AlertTimeline({ data = [] }) {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="card-glass p-3">
      <div className="h5 h-title mb-3">Alerts Timeline</div>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <LineChart data={safeData} margin={{ left: 8, right: 8, top: 0, bottom: 0 }}>
            <XAxis dataKey="t" stroke="#9aa4bf" tick={{ fontSize: 12 }} />
            <YAxis stroke="#9aa4bf" width={48} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "rgba(20,24,45,0.95)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="alerts"
              stroke="#8a5cf6"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default memo(AlertTimeline);
