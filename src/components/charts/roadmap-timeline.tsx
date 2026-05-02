import { cn } from "@/lib/utils";

export function RoadmapTimeline({
  data,
}: {
  data: {
    id: string;
    title: string;
    owner: string;
    quarter: string;
    status: string;
    completion: number;
  }[];
}) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.id} className="surface-panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{item.quarter}</p>
              <h3 className="mt-1.5 text-base font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-500">Owner: {item.owner}</p>
            </div>
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold",
                item.status === "entregue"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : item.status === "em_execucao"
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-slate-50 text-slate-600",
              )}
            >
              {item.status.replace("_", " ")}
            </span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Conclusão</span>
              <span>{item.completion}%</span>
            </div>
            <div className="progress-rail mt-2">
              <div
                className="progress-value"
                style={{ width: `${item.completion}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
