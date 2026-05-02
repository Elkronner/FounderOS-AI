import type { ReactNode } from "react";

export function StatCard({
  title,
  value,
  description,
  accent,
}: {
  title: string;
  value: string;
  description: string;
  accent?: ReactNode;
}) {
  return (
    <div className="surface-panel group p-6 transition-all hover:border-brand/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-brand transition">
            {title}
          </p>
          <p className="mt-2 text-2xl font-black tracking-tight text-foreground">{value}</p>
        </div>
        <div className="rounded-xl bg-card/50 p-2 shadow-sm">
          {accent}
        </div>
      </div>
      <p className="mt-4 text-xs font-bold leading-5 text-muted/80">{description}</p>
    </div>
  );
}
