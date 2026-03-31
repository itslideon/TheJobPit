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
    <div className="h-72 w-full rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      <h2 className="mb-3 text-lg font-semibold text-slate-100">Pipeline by status</h2>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
