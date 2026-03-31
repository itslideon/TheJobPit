"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type PipelineDatum = {
  name: string;
  value: number;
  color: string;
};

type PipelineChartProps = {
  data: PipelineDatum[];
};

export function PipelineChart({ data }: PipelineChartProps) {
  return (
    <div className="h-72 w-full rounded-xl border border-red-950 bg-black/70 p-4">
      <h2 className="mb-3 text-lg font-semibold text-red-100">Pipeline by status</h2>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#0a0a0a",
              border: "1px solid #7f1d1d",
              borderRadius: "10px",
              color: "#fee2e2"
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
