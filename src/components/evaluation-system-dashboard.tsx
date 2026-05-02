"use client";

import Link from "next/link";

import {
  Bot,
  CalendarCheck2,
  FileText,
  MessageSquareText,
  Radar,
  TrendingUp,
} from "lucide-react";

import { MaturityRadar } from "@/components/charts/maturity-radar";
import { SensorComparisonChart } from "@/components/charts/sensor-comparison-chart";
import { InsightCard } from "@/components/insight-card";
import { StatCard } from "@/components/stat-card";
import { useSettings } from "@/components/providers/settings-provider";
import type { AdvisorSummary } from "@/lib/advisor";
import {
  getAreaMaturity,
  getOverallCompletion,
  getPhaseOneCompletion,
  getPhaseThreeCompletion,
  getPhaseTwoCompletion,
  roles,
} from "@/lib/gameform-data";
import type {
  CommentThread,
  ModuleDefinition,
  Role,
  SensorPoint,
  StudioSummary,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/utils";

  const journeyCards = [
    {
      title: "Diagnóstico",
      description: "Empresa, visão e maturidade inicial.",
      href: "/app/gf-sensor",
      color: "border-brand/20 bg-brand-soft text-brand",
    },
    {
      title: "Mercado e produto",
      description: "Prova de problema, proposta, jornada e pricing.",
      href: "/app/modules/market-analysis",
      color: "border-amber-500/20 bg-amber-500/5 text-amber-600",
    },
    {
      title: "Financeiro",
      description: "Receita, custos, caixa, runway e cenários.",
      href: "/app/finance",
      color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-600",
    },
    {
      title: "Captação",
      description: "Pitch, uso do capital, data room e pipeline.",
      href: "/app/modules/fundraising",
      color: "border-fuchsia-500/20 bg-fuchsia-500/5 text-fuchsia-600",
    },
  ];

function statusLabel(status: ModuleDefinition["status"]) {
  return {
    nao_iniciado: "Nao iniciado",
    em_andamento: "Em andamento",
    concluido: "Concluido",
  }[status];
}

function PriorityModuleList({ modules }: { modules: ModuleDefinition[] }) {
  const priorities = modules
    .slice()
    .sort((a, b) => a.progress + a.maturity - (b.progress + b.maturity))
    .slice(0, 5);

  return (
    <div className="space-y-3">
      {priorities.map((module) => (
        <Link
          key={module.slug}
          href={`/app/modules/${module.slug}`}
          className="block rounded-xl border border-border bg-card p-4 transition hover:border-brand group"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-foreground group-hover:text-brand transition">{module.title}</p>
              <p className="mt-1 text-xs leading-5 text-muted">{module.nextAction}</p>
            </div>
            <span className="rounded-full bg-muted/5 border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
              {module.status.replace("_", " ")}
            </span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted/10">
            <div className="h-full rounded-full bg-brand" style={{ width: `${module.progress}%` }} />
          </div>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted/60">
            {module.progress}% preenchido | {module.maturity}% maturidade
          </p>
        </Link>
      ))}
    </div>
  );
}

export function EvaluationSystemDashboard({
  role,
  modules,
  summary,
  advisor,
  comments,
  sensorComparison,
}: {
  role: Role;
  modules: ModuleDefinition[];
  summary: StudioSummary;
  advisor: AdvisorSummary;
  comments: CommentThread[];
  sensorComparison: SensorPoint[];
}) {
  const { t } = useSettings();
  const phaseOne = getPhaseOneCompletion(modules);
  const phaseTwo = getPhaseTwoCompletion(modules);
  const phaseThree = getPhaseThreeCompletion(modules);
  const sensorInitial = sensorComparison.reduce((total, item) => total + item.initial, 0);
  const sensorCurrent = sensorComparison.reduce((total, item) => total + item.current, 0);
  const openComments = comments.length;

  return (
    <main className="space-y-8 pb-12 animate-fade-in">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card/30 p-8 sm:p-10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/10 blur-[100px]" />
        
        <div className="relative grid gap-8 xl:grid-cols-[1fr_380px]">
          <div>
            <div className="flex items-center gap-3">
              <span className="pill text-brand border-brand/20 bg-brand/5">
                {t("common.readiness_score")}
              </span>
              <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                v2.4 Premium
              </span>
            </div>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {t("common.dashboard")}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
              {t("mentor.subtitle")}
            </p>
            
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/app/ai"
                className="group inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-brand-foreground shadow-lg shadow-brand/20 transition-all hover:scale-105 hover:shadow-xl hover:shadow-brand/30"
              >
                <Bot className="h-5 w-5 transition-transform group-hover:rotate-12" />
                {t("common.ai_advisor")}
              </Link>
              <Link
                href="/app/mentor"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 px-6 py-3 text-sm font-bold text-foreground backdrop-blur-sm transition-all hover:bg-white/5 hover:border-brand"
              >
                <MessageSquareText className="h-5 w-5" />
                {t("common.mentor_central")}
              </Link>
            </div>
          </div>
          
          <div className="flex flex-col justify-center rounded-3xl border border-border bg-card/50 p-8 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{t("advisor.readiness")}</p>
              <div className={cn("rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-tighter", roles[role].accent)}>
                {roles[role].label}
              </div>
            </div>
            
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-6xl font-black tracking-tighter text-foreground">{advisor.readinessScore}</span>
              <span className="text-xl font-bold text-muted">/100</span>
            </div>
            
            <p className="mt-4 text-sm font-bold text-foreground/90">{advisor.readinessLabel}</p>
            
            <div className="mt-8">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted mb-2">
                <span>Progresso Total</span>
                <span>{advisor.readinessScore}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted/10">
                <div className="h-full rounded-full bg-brand shadow-[0_0_12px_rgba(99,102,241,0.5)] transition-all duration-1000" style={{ width: `${advisor.readinessScore}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Empresa ativa"
          value={summary.name}
          description={`${summary.cycle}. Mentor: ${summary.mentorName}.`}
          accent={<CalendarCheck2 className="h-8 w-8 text-teal-500 opacity-20" />}
        />
        <StatCard
          title="Saúde geral"
          value={formatPercent(summary.health)}
          description={`${formatPercent(getOverallCompletion(modules))} preenchimento.`}
          accent={<TrendingUp className="h-8 w-8 text-brand opacity-20" />}
        />
        <StatCard
          title="Evolução Sensor"
          value={sensorCurrent > sensorInitial ? `+${sensorCurrent - sensorInitial}` : String(sensorCurrent - sensorInitial)}
          description={`Inicial ${sensorInitial} | atual ${sensorCurrent}.`}
          accent={<Radar className="h-8 w-8 text-indigo-500 opacity-20" />}
        />
        <StatCard
          title="Conversas"
          value={String(openComments)}
          description="Comentários nos módulos."
          accent={<MessageSquareText className="h-8 w-8 text-amber-500 opacity-20" />}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-panel p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">Radar de maturidade</h2>
              <p className="mt-1 text-xs text-muted font-medium">Visão por área estratégica.</p>
            </div>
            <Link href="/app/gf-sensor" className="rounded-lg bg-brand/10 px-3 py-1.5 text-[10px] font-bold text-brand hover:bg-brand/20 transition">
              Ver sensor
            </Link>
          </div>
          <div className="mt-6">
            <MaturityRadar data={getAreaMaturity(modules)} />
          </div>
        </div>

        <div className="surface-panel p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">Evolução GF-Sensor</h2>
              <p className="mt-1 text-xs text-muted font-medium">Comparativo diagnóstico x atual.</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted/40">
              {sensorComparison.length} Dimensões
            </span>
          </div>
          <div className="mt-6">
            <SensorComparisonChart data={sensorComparison} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="surface-panel p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            <h2 className="text-lg font-bold text-foreground tracking-tight">Riscos Críticos</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {advisor.topRisks.slice(0, 4).map((insight) => (
              <InsightCard key={insight.title} insight={insight} />
            ))}
          </div>
        </div>

        <div className="surface-panel p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-2 w-2 rounded-full bg-brand shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            <h2 className="text-lg font-bold text-foreground tracking-tight">Prioridades</h2>
          </div>
          <PriorityModuleList modules={modules} />
        </div>
      </section>

      <section className="surface-panel p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">Jornadas de trabalho</h2>
            <p className="mt-1 text-sm text-muted font-medium">Metodologia agrupada por decisão estratégica.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Diagnóstico", val: phaseOne },
              { label: "Mercado", val: phaseTwo },
              { label: "Captação", val: phaseThree }
            ].map(p => (
              <div key={p.label} className="flex items-center gap-2 rounded-lg border border-border bg-card/50 px-3 py-1.5">
                <span className="text-[10px] font-bold text-muted">{p.label}</span>
                <span className="text-xs font-black text-foreground">{formatPercent(p.val)}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {journeyCards.map((item) => (
            <Link key={item.title} href={item.href} className={cn("group rounded-[2rem] border p-8 transition-all hover:-translate-y-2 hover:shadow-2xl", item.color)}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 mb-6 transition-transform group-hover:scale-110">
                <TrendingUp className="h-6 w-6" />
              </div>
              <p className="text-xl font-bold tracking-tight">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed opacity-70 font-medium">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
