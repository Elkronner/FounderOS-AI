import Link from "next/link";

import { ActivityFeed } from "@/components/activity-feed";
import { requireRole } from "@/lib/auth";
import { getStudioSummary, readGameformSnapshot } from "@/lib/gameform-store";

export default async function AdminPage() {
  await requireRole(["admin"]);

  const snapshot = await readGameformSnapshot();
  const summary = getStudioSummary(snapshot);
  const phaseThreeTargets = snapshot.modules.filter((item) =>
    [
      "finance-24m",
      "milestones",
      "finance-5y",
      "gantt-items",
      "pitch-script",
      "fundraising",
      "competencies",
    ].includes(item.slug),
  );

  return (
    <main className="space-y-6">
      <section className="glass-panel rounded-[2rem] p-6">
        <h1 className="font-display text-3xl font-bold text-slate-950">
          Painel admin Osten Games
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
          Governanca da Fase 3 com visao de progresso, captacao e historico auditavel.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel rounded-[2rem] p-6">
          <h2 className="text-xl font-semibold text-slate-950">Programa atual</h2>
          <div className="mt-4 space-y-4 rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Studio em destaque</p>
            <p className="text-2xl font-bold text-slate-950">{summary.name}</p>
            <p className="text-sm text-slate-600">
              Saude geral: {summary.health}% | Mentor: {summary.mentorName}
            </p>
            <p className="text-sm text-slate-600">
              Modulos concluidos: {snapshot.modules.filter((module) => module.status === "concluido").length}
            </p>
            <p className="text-sm text-slate-600">
              Alertas criticos: {summary.pendingAlerts}
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] p-6">
          <h2 className="text-xl font-semibold text-slate-950">Fase 3 em foco</h2>
          <div className="mt-4 grid gap-3">
            {phaseThreeTargets.map((module) => (
              <Link
                key={module.slug}
                href={`/app/modules/${module.slug}`}
                className="rounded-[1.25rem] border border-slate-200 bg-white p-4 transition hover:-translate-y-1"
              >
                <p className="font-semibold text-slate-900">{module.title}</p>
                <p className="mt-1 text-sm text-slate-600">{module.nextAction}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-400">
                  {module.progress}% preenchido
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ActivityFeed logs={snapshot.activityLogs} title="Historico de alteracoes (admin)" />
    </main>
  );
}
