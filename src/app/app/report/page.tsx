import { ActivityFeed } from "@/components/activity-feed";
import { ReportExportButton } from "@/components/report-export-button";
import { getPhaseThreeModules } from "@/lib/gameform-data";
import { getStudioSummary, readGameformSnapshot } from "@/lib/gameform-store";

export default async function ReportPage() {
  const snapshot = await readGameformSnapshot();
  const summary = getStudioSummary(snapshot);
  const phaseThree = getPhaseThreeModules(snapshot.modules);

  return (
    <main className="space-y-6">
      <section className="glass-panel rounded-[2rem] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-950">
              Relatorio executivo
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              Consolidado da Fase 3 para mentorias e comite com exportacao em PDF.
            </p>
          </div>
          <ReportExportButton
            summary={summary}
            modules={phaseThree}
            activityLogs={snapshot.activityLogs}
            comments={snapshot.comments}
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel rounded-[2rem] p-6">
          <h2 className="text-xl font-semibold text-slate-950">Resumo geral</h2>
          <div className="mt-5 space-y-4 rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-600">Studio</p>
            <p className="text-2xl font-bold text-slate-950">{summary.name}</p>
            <p className="text-sm text-slate-500">Saude geral: {summary.health}%</p>
            <p className="text-sm text-slate-500">Mentor: {summary.mentorName}</p>
            <p className="text-sm text-slate-500">Proxima reuniao: {summary.nextMeeting}</p>
            <p className="text-sm text-slate-500">
              Pendencias prioritarias: {summary.pendingAlerts}
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] p-6">
          <h2 className="text-xl font-semibold text-slate-950">Destaques da Fase 3</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {phaseThree.map((module) => (
              <div
                key={module.slug}
                className="rounded-[1.5rem] border border-slate-200 bg-white p-4"
              >
                <p className="text-sm font-semibold text-slate-900">{module.title}</p>
                <p className="mt-2 text-sm text-slate-600">{module.nextAction}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
                  {module.progress}% preenchido | maturidade {module.maturity}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ActivityFeed logs={snapshot.activityLogs} title="Historico de alteracoes da trilha" />
    </main>
  );
}
