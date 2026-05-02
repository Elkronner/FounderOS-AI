import Link from "next/link";

import {
  BellRing,
  Building2,
  CheckCircle2,
  Clock3,
  ShieldCheck,
} from "lucide-react";

import { MaturityRadar } from "@/components/charts/maturity-radar";
import { StatCard } from "@/components/stat-card";
import {
  getAreaMaturity,
  getPhaseOneCompletion,
  getPhaseOneModules,
  getPhaseThreeCompletion,
  getPhaseThreeModules,
  getPhaseTwoCompletion,
  getPhaseTwoModules,
  roles,
} from "@/lib/gameform-data";
import type { ModuleDefinition, Role, StudioSummary } from "@/lib/types";
import { formatPercent } from "@/lib/utils";

export function PhaseOneDashboard({
  role,
  modules,
  summary,
}: {
  role: Role;
  modules: ModuleDefinition[];
  summary: StudioSummary;
}) {
  const phaseOneModules = getPhaseOneModules(modules);
  const phaseTwoModules = getPhaseTwoModules(modules);
  const phaseThreeModules = getPhaseThreeModules(modules);
  const currentSensor = phaseOneModules.find(
    (module) => module.slug === "gf-sensor-current",
  );

  return (
    <main className="space-y-5">
      <section className="surface-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <span className="pill border-blue-200 bg-blue-50 text-blue-700">
              Fase 3 em operacao
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold text-slate-950 sm:text-4xl">
              Dashboard principal
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              Visao consolidada da trilha GameForm com progresso real salvo no servidor.
            </p>
          </div>
          <div
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${roles[role].accent}`}
          >
            Sessao: {roles[role].label}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          title="Startup ativa"
          value={summary.name}
          description={`Ciclo ${summary.cycle}. Acompanhamento central da Osten Games.`}
          accent={<Building2 className="h-8 w-8 text-teal-700" />}
        />
        <StatCard
          title="Fase 1 concluida"
          value={formatPercent(getPhaseOneCompletion(modules))}
          description="Base institucional, visao e sensores de maturidade."
          accent={<CheckCircle2 className="h-8 w-8 text-teal-700" />}
        />
        <StatCard
          title="Fase 2 em execucao"
          value={formatPercent(getPhaseTwoCompletion(modules))}
          description="Mercado, proposta de valor, jornada, pricing e produto."
          accent={<CheckCircle2 className="h-8 w-8 text-teal-700" />}
        />
        <StatCard
          title="Pendencias imediatas"
          value={String(summary.pendingAlerts)}
          description="Itens que ainda precisam de atualizacao antes da proxima mentoria."
          accent={<BellRing className="h-8 w-8 text-amber-500" />}
        />
        <StatCard
          title="Fase 3 em execucao"
          value={formatPercent(getPhaseThreeCompletion(modules))}
          description="Financeiro, execucao, pitch, captacao e competencias."
          accent={<CheckCircle2 className="h-8 w-8 text-indigo-700" />}
        />
        <StatCard
          title="Proxima mentoria"
          value={summary.nextMeeting}
          description={`Mentor responsavel: ${summary.mentorName}.`}
          accent={<Clock3 className="h-8 w-8 text-teal-700" />}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Radar de maturidade</h2>
              <p className="mt-1 text-sm text-slate-600">
                Leitura sintetica das frentes estrategicas visiveis nesta fase.
              </p>
            </div>
            <Link href="/app/gf-sensor" className="text-sm font-semibold text-teal-700">
              Ver GF-Sensor
            </Link>
          </div>
          <MaturityRadar data={getAreaMaturity(modules)} />
        </div>

        <div className="surface-panel p-6">
          <h2 className="text-xl font-semibold text-slate-950">Papeis e acesso</h2>
          <div className="mt-5 space-y-4">
            {[
              "Fundador/equipe acessa e atualiza apenas o proprio estudio.",
              "Mentor acompanha somente estudios atribuidos.",
              "Admin Osten Games visualiza toda a base e o historico.",
            ].map((item) => (
              <div key={item} className="soft-panel p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-teal-700" />
                  <p className="text-sm leading-6 text-slate-600">{item}</p>
                </div>
              </div>
            ))}
            {currentSensor ? (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-700">
                  GF-Sensor atual em andamento: {currentSensor.progress}% preenchido
                </p>
                <p className="mt-1 text-sm text-blue-700">{currentSensor.nextAction}</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="surface-panel p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Trilha inicial de modulos</h2>
            <p className="mt-1 text-sm text-slate-600">
              Sequencia recomendada para iniciar o acompanhamento do estudio.
            </p>
          </div>
          <Link
            href="/app/startups/new"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
          >
            Atualizar cadastro
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {phaseOneModules.map((module) => (
            <Link
              key={module.slug}
              href={`/app/modules/${module.slug}`}
              className="soft-panel p-4 transition hover:-translate-y-1"
            >
              <p className="text-sm font-semibold text-slate-900">{module.title}</p>
              <p className="mt-2 text-sm text-slate-600">{module.description}</p>
              <div className="progress-rail mt-4">
                <div className="progress-value" style={{ width: `${module.progress}%` }} />
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
                {module.progress}% preenchido | maturidade {module.maturity}%
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="surface-panel p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              Fase 2: mercado, produto e growth
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Mapeie validacao de negocio e evolua os modulos centrais desta etapa.
            </p>
          </div>
          <span className="pill border-slate-200 bg-slate-100 text-slate-600">
            {phaseTwoModules.length} modulos ativos
          </span>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {phaseTwoModules.map((module) => (
            <Link
              key={module.slug}
              href={`/app/modules/${module.slug}`}
              className="soft-panel p-4 transition hover:-translate-y-1"
            >
              <p className="text-sm font-semibold text-slate-900">{module.title}</p>
              <p className="mt-2 text-sm text-slate-600">{module.description}</p>
              <div className="progress-rail mt-4">
                <div className="progress-value" style={{ width: `${module.progress}%` }} />
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
                {module.progress}% preenchido | {module.status.replaceAll("_", " ")}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="surface-panel p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              Fase 3: consolidacao, execucao e captacao
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Central da etapa avancada com financeiro, roadmap, pitch e competencias.
            </p>
          </div>
          <span className="pill border-slate-200 bg-slate-100 text-slate-600">
            {phaseThreeModules.length} modulos ativos
          </span>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {phaseThreeModules.map((module) => (
            <Link
              key={module.slug}
              href={`/app/modules/${module.slug}`}
              className="soft-panel p-4 transition hover:-translate-y-1"
            >
              <p className="text-sm font-semibold text-slate-900">{module.title}</p>
              <p className="mt-2 text-sm text-slate-600">{module.description}</p>
              <div className="progress-rail mt-4">
                <div className="progress-value" style={{ width: `${module.progress}%` }} />
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
                {module.progress}% preenchido | {module.status.replaceAll("_", " ")}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
