"use client";

import { useState, useTransition } from "react";

import { Bot, Loader2 } from "lucide-react";

import { generateAiAdvisorAction } from "@/app/app/actions";
import { InsightCard } from "@/components/insight-card";
import { useSettings } from "@/components/providers/settings-provider";
import type { AdvisorSummary } from "@/lib/advisor";

export function AiAdvisorPanel({ advisor }: { advisor: AdvisorSummary }) {
  const { t } = useSettings();
  const [aiText, setAiText] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const runAdvisor = () => {
    setStatus(null);
    setAiText(null);

    startTransition(async () => {
      const result = await generateAiAdvisorAction();
      setStatus(result.notice ?? (result.success ? "Feedback gerado." : result.message));
      setAiText(result.success ? result.message : null);
    });
  };

  return (
    <div className="space-y-6">
      <section className="surface-panel overflow-hidden p-0">
        <div className="bg-slate-950 p-8 text-white">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/20">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold tracking-tight text-white">
                  {t("advisor.title")} <span className="ml-2 text-sm font-medium text-blue-400">v2.5</span>
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  {t("advisor.subtitle")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={runAdvisor}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50"
            >
              {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Bot className="h-5 w-5" />}
              {isPending ? t("common.processing") : t("common.generate_feedback")}
            </button>
          </div>
        </div>
        {status ? (
          <div className="border-t border-slate-800 bg-slate-900 px-8 py-3 text-xs font-medium text-slate-400">
            <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500"></span>
            {status}
          </div>
        ) : null}
      </section>

      {aiText ? (
        <section className="surface-panel overflow-hidden border-blue-200 bg-gradient-to-b from-blue-50/50 to-white p-0">
          <div className="flex items-center justify-between border-b border-blue-100 px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Bot className="h-5 w-5 text-blue-600" />
              {t("advisor.real_time")}
            </h2>
            <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              {t("advisor.real_time")}
            </span>
          </div>
          <div className="p-6">
            <div className="whitespace-pre-wrap text-sm leading-8 text-foreground/80">
              {aiText}
            </div>
            <div className="mt-8 flex items-center gap-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4 text-[11px] text-muted">
              <p>
                <strong>{t("common.next_step")}:</strong> {t("advisor.note")}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="surface-panel p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">{t("common.readiness")}</p>
              <p className="mt-4 text-7xl font-black tracking-tight text-foreground">{advisor.readinessScore}<span className="text-2xl font-normal text-slate-300">/100</span></p>
            </div>
            <div className={`rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-muted`}>
              {t("advisor.audit_score")}
            </div>
          </div>
          
          <p className="mt-6 text-sm font-bold text-foreground">{advisor.readinessLabel}</p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-1000" 
              style={{ width: `${advisor.readinessScore}%` }} 
            />
          </div>

          <div className="mt-8 border-t border-line pt-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">{t("advisor.data_sources")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {advisor.sources.slice(0, 6).map((source) => (
                <span key={source} className="rounded-md bg-slate-50 border border-slate-100 px-2.5 py-1.5 text-[10px] font-medium text-slate-600">
                  {source}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="surface-panel p-6">
          <h2 className="text-xl font-semibold text-slate-950">Analise local sempre disponivel</h2>
          <p className="mt-1 text-sm text-slate-600">
            Mesmo sem chave de IA, a plataforma calcula riscos e proximas acoes com os dados
            estruturados da empresa.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {advisor.topRisks.slice(0, 4).map((insight) => (
              <InsightCard key={insight.title} insight={insight} />
            ))}
          </div>
        </div>
      </section>

      <section className="surface-panel p-6">
        <h2 className="text-xl font-semibold text-slate-950">Proximas acoes sugeridas</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {advisor.nextActions.map((insight) => (
            <InsightCard key={insight.title} insight={insight} />
          ))}
        </div>
      </section>
    </div>
  );
}
