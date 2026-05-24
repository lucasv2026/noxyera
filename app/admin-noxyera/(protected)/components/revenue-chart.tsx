"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="text-xs rounded-xl px-3 py-2 shadow-xl"
      style={{ background: "#122B1E", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      <p className="mb-1" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "monospace" }}>{label}</p>
      <p className="font-semibold" style={{ color: "#10B981" }}>
        CA : {payload[0]?.value?.toLocaleString("fr-FR")} €
      </p>
      {payload[1] && (
        <p style={{ color: "#F59E0B" }}>
          Marge : {payload[1]?.value?.toLocaleString("fr-FR")} €
        </p>
      )}
    </div>
  );
}

export default function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={190}>
      <BarChart data={[]} barSize={12} barGap={2} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10, fontFamily: "monospace" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey="revenue" fill="#1B4332" radius={[3, 3, 0, 0]} />
        <Bar dataKey="commission" fill="#F26522" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
