import Link from "next/link";

import { RoadmapTimeline } from "@/components/charts/roadmap-timeline";
import { getModuleBySlug } from "@/lib/gameform-data";
import { readGameformSnapshot } from "@/lib/gameform-store";

export default async function RoadmapPage() {
  const snapshot = await readGameformSnapshot();
  const milestones = getModuleBySlug("milestones", snapshot.modules);
  const gantt = getModuleBySlug("gantt-items", snapshot.modules);
  const pitch = getModuleBySlug("pitch-script", snapshot.modules);
  const fundraising = getModuleBySlug("fundraising", snapshot.modules);
  const competencies = getModuleBySlug("competencies", snapshot.modules);

  return (
    <main className="space-y-6">
      <section className="glass-panel rounded-[2rem] p-6">
        <h1 className="font-display text-3xl font-bold text-slate-950">
          Marcos + Gantt
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
          Linha do tempo principal para desenvolvimento, growth e fundraising.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/app/modules/milestones"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Marcos de desenvolvimento
          </Link>
          <Link
            href="/app/modules/gantt-items"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Gantt / roadmap
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
            Marcos de desenvolvimento
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {milestones?.progress ?? 0}% preenchido
          </p>
          <p className="mt-1 text-sm text-slate-600">{milestones?.nextAction}</p>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
            Gantt / roadmap
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {gantt?.progress ?? 0}% preenchido
          </p>
          <p className="mt-1 text-sm text-slate-600">{gantt?.nextAction}</p>
        </div>
      </section>

      <section className="glass-panel rounded-[2rem] p-6">
        <RoadmapTimeline data={snapshot.roadmapItems} />
      </section>

      <section className="glass-panel rounded-[2rem] p-6">
        <h2 className="text-xl font-semibold text-slate-950">
          Pitch, captacao e competencias
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            { item: pitch, href: "/app/modules/pitch-script" },
            { item: fundraising, href: "/app/modules/fundraising" },
            { item: competencies, href: "/app/modules/competencies" },
          ].map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              className="rounded-[1.25rem] border border-slate-200 bg-white p-4 transition hover:-translate-y-1"
            >
              <p className="text-sm font-semibold text-slate-900">{entry.item?.title}</p>
              <p className="mt-2 text-sm text-slate-600">{entry.item?.nextAction}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
                {entry.item?.progress ?? 0}% preenchido
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
