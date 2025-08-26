import React, { memo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * Area chart showing ingested logs over time
 * @param {{ data: Array<{ t: string, count: number }> }} props
 */
function TrafficArea({ data = [] }) {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="card-glass p-3">
      <div className="h5 h-title mb-3">Ingested Logs (5m)</div>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <AreaChart
            data={safeData}
            margin={{ left: 8, right: 8, top: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8a5cf6" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#8a5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="t" stroke="#9aa4bf" tick={{ fontSize: 12 }} />
            <YAxis stroke="#9aa4bf" width={48} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "rgba(20,24,45,0.95)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#7aa2ff"
              fill="url(#gradA)"
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default memo(TrafficArea);
