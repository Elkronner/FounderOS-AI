import type { AdvisorInsight } from "@/lib/advisor";

const severityClass = {
  critical: "border-rose-200 bg-rose-50 text-rose-900",
  attention: "border-amber-200 bg-amber-50 text-amber-900",
  positive: "border-emerald-200 bg-emerald-50 text-emerald-900",
} as const;

const label = {
  critical: "Critico",
  attention: "Atencao",
  positive: "Forca",
} as const;

export function InsightCard({ insight }: { insight: AdvisorInsight }) {
  return (
    <article className={`rounded-lg border p-4 ${severityClass[insight.severity]}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-sm font-semibold">{insight.title}</h3>
        <span className="rounded-full border border-current/20 bg-white/55 px-2.5 py-1 text-xs font-semibold">
          {label[insight.severity]}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6">{insight.body}</p>
      <div className="mt-4 space-y-1.5">
        {insight.evidence.slice(0, 3).map((item) => (
          <p key={item} className="text-xs leading-5 opacity-80">
            {item}
          </p>
        ))}
      </div>
      <p className="mt-4 rounded-lg bg-white/65 px-3 py-2 text-xs font-semibold leading-5">
        Proximo passo: {insight.nextStep}
      </p>
    </article>
  );
}
