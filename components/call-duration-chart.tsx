"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

export type DurationPoint = {
  label: string; // eje X (fecha corta / hora)
  minutes: number; // duración en minutos
};

export function CallDurationChart({ data }: { data: DurationPoint[] }) {
  return (
    <ChartContainer
      config={{
        duration: {
          label: "Duración (min)",
          color: "#ffffff",
        },
      }}
      className="w-full">
      <LineChart
        data={data}
        margin={{ left: 12, right: 12 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.12)"
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: "#ffffff" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={40}
          tickFormatter={(v) => `${v}`}
          tick={{ fill: "#ffffff" }}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Line
          type="monotone"
          dataKey="minutes"
          stroke="#ffffff"
          strokeWidth={2}
          connectNulls={true}
          dot={{ r: 2, stroke: "#ffffff", fill: "#ffffff" }}
          activeDot={{ r: 4, stroke: "#ffffff", fill: "#ffffff" }}
        />
      </LineChart>
    </ChartContainer>
  );
}
