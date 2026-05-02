"use client";

import Link from "next/link";
import { useSettings } from "@/components/providers/settings-provider";
import type { ModuleDefinition } from "@/lib/types";

export function ModulePageClient({
  moduleItem,
  moduleStatus,
  formContent,
  conversationContent,
  auditContent,
}: {
  moduleItem: ModuleDefinition;
  moduleStatus: ModuleDefinition["status"];
  formContent: React.ReactNode;
  conversationContent: React.ReactNode;
  auditContent: React.ReactNode;
}) {
  const { t } = useSettings();
  const statusLabel = {
    nao_iniciado: t("common.status_not_started"),
    em_andamento: t("common.status_in_progress"),
    concluido: t("common.status_completed"),
  }[moduleStatus] ?? t("common.status_pending");

  return (
    <main className="space-y-6">
      <section className="surface-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand">
              {moduleItem.area}
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-foreground">
              {moduleItem.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
              {moduleItem.description}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 px-5 py-4 min-w-[200px]">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">{t("common.status")}</p>
            <p className="mt-2 text-xl font-bold capitalize text-foreground">
              {statusLabel}
            </p>
            <p className="mt-1 text-sm text-muted">
              {t("common.module_completion")
                .replace("{progress}", String(moduleItem.progress))
                .replace("{maturity}", String(moduleItem.maturity))}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="surface-panel p-6">
          <h2 className="text-xl font-semibold text-foreground">{t("module.edit_title")}</h2>
          <p className="mt-1 text-sm text-muted">
            {t("module.filling_note")}
          </p>
          <div className="mt-6">
            {formContent}
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-panel p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-foreground">{t("module.action_plan_title")}</h2>
                <p className="mt-3 text-sm leading-7 text-muted">{moduleItem.nextAction}</p>
              </div>
              <Link
                href="/app/ai"
                className="rounded-xl border border-brand bg-brand-soft px-4 py-2 text-xs font-bold text-brand transition hover:bg-brand hover:text-white"
              >
                {t("module.request_ai_analysis")}
              </Link>
            </div>
            <div className="mt-5 rounded-xl border border-border bg-card/30 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                {t("module.mentor_signal")}
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground/80">
                {moduleItem.mentorComment}
              </p>
            </div>
            <div className="mt-4 rounded-xl border border-border bg-card/30 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                {t("module.osten_feedback")}
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground/80">
                {moduleItem.ostenFeedback}
              </p>
            </div>
          </div>

          <div className="surface-panel p-6">
            <h2 className="text-xl font-semibold text-foreground">{t("module.conversation_title")}</h2>
            <p className="mt-1 text-sm text-muted">{t("module.conversation_note")}</p>
            <div className="mt-4">{conversationContent}</div>
          </div>

          <details className="surface-panel p-5">
            <summary className="cursor-pointer text-lg font-semibold text-foreground">
              {t("module.audit_title")}
            </summary>
            <p className="mt-2 text-sm text-muted">{t("module.audit_note")}</p>
            <div className="mt-5">{auditContent}</div>
          </details>
        </div>
      </section>
    </main>
  );
}
