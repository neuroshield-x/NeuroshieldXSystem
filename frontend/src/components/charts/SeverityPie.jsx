import React, { memo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#4ade80", "#f59e0b", "#ef4444"];

/**
 * Pie chart showing anomalies grouped by severity
 * @param {{ data: Array<{ name: string, value: number }> }} props
 */
function SeverityPie({ data = [] }) {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="card-glass p-3">
      <div className="h5 h-title mb-3">Anomalies by Severity</div>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={safeData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
            >
              {safeData.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              height={24}
              wrapperStyle={{ color: "#c9d4ff" }}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(20,24,45,0.95)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default memo(SeverityPie);
