import { roles } from "@/lib/gameform-data";
import type { ActivityLog } from "@/lib/types";

export function ActivityFeed({
  logs,
  title = "Historico de alteracoes",
}: {
  logs: ActivityLog[];
  title?: string;
}) {
  const visibleLogs = logs.slice(0, 20);

  return (
    <section className="surface-panel p-6">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 space-y-4">
        {visibleLogs.length === 0 ? (
          <div className="soft-panel p-4">
            <p className="text-sm text-slate-600">
              Ainda nao ha registros de atividade.
            </p>
          </div>
        ) : null}
        {visibleLogs.map((item) => (
          <div key={item.id} className="soft-panel p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-slate-900">
                {item.actor} {item.action.toLowerCase()}
              </p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${roles[item.role].accent}`}
              >
                {roles[item.role].label}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{item.target}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">
              {item.when}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
