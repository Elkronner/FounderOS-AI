"use client";

import { useEffect, useState } from "react";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

import { useSettings } from "@/components/providers/settings-provider";

export function MaturityRadar({
  data,
}: {
  data: { area: string; score: number }[];
}) {
  const { theme } = useSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-80 w-full rounded-lg bg-card/50" />;
  }

  const gridColor = theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(30,41,59,0.05)";
  const textColor = theme === "dark" ? "#8a8f98" : "#64748b";
  const brandColor = theme === "dark" ? "#6366f1" : "#3b82f6";

  return (
    <div className="h-96 w-full animate-fade-in">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke={gridColor} strokeDasharray="4 4" />
          <PolarAngleAxis 
            dataKey="area" 
            tick={{ fill: textColor, fontSize: 10, fontWeight: 700, letterSpacing: '0.02em' }} 
          />
          <Radar 
            name="Maturidade" 
            dataKey="score" 
            stroke={brandColor} 
            strokeWidth={2}
            fill={brandColor} 
            fillOpacity={theme === "dark" ? 0.25 : 0.1} 
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
