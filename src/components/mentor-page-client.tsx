"use client";

import Link from "next/link";
import { ActivityFeed } from "@/components/activity-feed";
import { AiAdvisorPanel } from "@/components/ai-advisor-panel";
import { useSettings } from "@/components/providers/settings-provider";
import { getModuleBySlug } from "@/lib/gameform-data";
import type { GameformSnapshot, StudioSummary } from "@/lib/types";
import type { AdvisorSummary } from "@/lib/advisor";

export function MentorPageClient({ 
  snapshot, 
  summary, 
  advisor 
}: { 
  snapshot: any; 
  summary: StudioSummary; 
  advisor: any;
}) {
  const { t } = useSettings();
  
  const reviewQueue = snapshot.modules
    .filter((module: any) => module.status !== "concluido" || module.progress < 75)
    .sort((a: any, b: any) => a.progress + a.maturity - (b.progress + b.maturity))
    .slice(0, 6);
    
  const recentComments = snapshot.comments.slice(0, 8);

  return (
    <main className="space-y-6">
      <section className="surface-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="pill border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              {t("common.mentor_central")}
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold text-foreground">
              {t("mentor.title")}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
              {t("mentor.subtitle")}
            </p>
          </div>
          <div className="rounded-lg border border-line bg-card px-5 py-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Empresa</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{summary.name}</p>
            <p className="mt-1 text-sm text-muted">{summary.nextMeeting}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="surface-panel p-6">
          <h2 className="text-xl font-semibold text-foreground">{t("mentor.review_queue")}</h2>
          <p className="mt-1 text-sm text-muted">
            {t("mentor.review_queue")}
          </p>
          <div className="mt-5 space-y-3">
            {reviewQueue.map((module: any) => (
              <Link
                key={module.slug}
                href={`/app/modules/${module.slug}`}
                className="block rounded-lg border border-line bg-card p-4 transition hover:border-brand"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{module.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">{module.nextAction}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-muted">
                    {module.progress}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="surface-panel p-6">
          <h2 className="text-xl font-semibold text-foreground">{t("mentor.recent_chats")}</h2>
          <p className="mt-1 text-sm text-muted">
            {t("mentor.recent_chats")}
          </p>
          <div className="mt-5 space-y-3">
            {recentComments.map((comment: any) => {
              const relatedModule = getModuleBySlug(comment.moduleSlug, snapshot.modules);

              return (
                <Link
                  key={comment.id}
                  href={`/app/modules/${comment.moduleSlug}`}
                  className="block rounded-lg border border-line bg-card p-4 transition hover:border-brand"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{relatedModule?.title ?? comment.moduleSlug}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">
                        {comment.author} | {comment.createdAt}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-muted">
                      {comment.role}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted">{comment.message}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <AiAdvisorPanel advisor={advisor} />
      </section>

      <ActivityFeed logs={snapshot.activityLogs} title={t("mentor.history")} />
    </main>
  );
}
