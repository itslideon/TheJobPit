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
    <div className="pit-card-sm h-72 w-full p-4">
      <h2 className="mb-3 text-lg font-semibold text-zinc-100">Pipeline by status</h2>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid rgba(45, 212, 191, 0.25)",
              borderRadius: "10px",
              color: "#e4e4e7"
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
