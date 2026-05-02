"use client";

import { useEffect, useState } from "react";

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { SensorPoint } from "@/lib/types";

export function SensorComparisonChart({ data }: { data: SensorPoint[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  if (!mounted) {
    return <div className="h-96 w-full rounded-lg bg-slate-50" />;
  }

  return (
    <div className="h-[440px] w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="rgba(15,23,42,0.16)" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "#475569", fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 4]}
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickCount={5}
          />
          <Tooltip />
          <Legend />
          <Radar
            dataKey="initial"
            name="Inicial"
            stroke="#94a3b8"
            fill="#94a3b8"
            fillOpacity={0.18}
            strokeWidth={2}
          />
          <Radar
            dataKey="current"
            name="Atual"
            stroke="#2563eb"
            fill="#2563eb"
            fillOpacity={0.32}
            strokeWidth={3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
