"use client";

import { useEffect, useState } from "react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { RevenuePoint } from "@/lib/types";

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const [mounted, setMounted] = useState(false);
  const currency = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  if (!mounted) {
    return <div className="h-96 w-full rounded-lg bg-slate-50" />;
  }

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="cashGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#2f6bff" stopOpacity={0.36} />
              <stop offset="95%" stopColor="#2f6bff" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.12)" />
          <XAxis dataKey="month" tick={{ fill: "#4b5563", fontSize: 12 }} />
          <YAxis tick={{ fill: "#4b5563", fontSize: 12 }} tickFormatter={(value) => currency.format(Number(value))} />
          <Tooltip formatter={(value) => currency.format(Number(value))} />
          <Legend />
          <Area type="monotone" dataKey="caixa" stroke="#2f6bff" fill="url(#cashGradient)" name="Caixa" />
          <Line type="monotone" dataKey="receita" stroke="#21b57f" strokeWidth={3} dot={false} name="Receita" />
          <Line type="monotone" dataKey="custos" stroke="#6b7280" strokeWidth={3} dot={false} name="Custos" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
