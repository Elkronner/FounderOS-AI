"use client";

import Link from "next/link";

import {
  BarChart3,
  Bot,
  BriefcaseBusiness,
  ChevronRight,
  ClipboardList,
  Compass,
  FileOutput,
  FolderKanban,
  Home,
  MessageSquareText,
  Radar,
  Target,
} from "lucide-react";

import {
  getPhaseOneModules,
  getPhaseThreeModules,
  getPhaseTwoModules,
  roles,
} from "@/lib/gameform-data";
import type { ModuleDefinition, Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSettings } from "@/components/providers/settings-provider";

export function SidebarPhaseOne({
  role,
  pathname,
}: {
  role: Role;
  pathname: string;
}) {
  const { t } = useSettings();
  const roleMeta = roles[role];
  const activeModuleSlug = pathname.startsWith("/app/modules/")
    ? pathname.replace("/app/modules/", "")
    : "";

  const mainNav = [
    { href: "/app", label: t("common.dashboard"), icon: Home },
    { href: "/app/ai", label: t("common.ai_advisor"), icon: Bot },
    { href: "/app/mentor", label: t("common.mentor_central"), icon: MessageSquareText },
    { href: "/app/gf-sensor", label: t("common.evolution"), icon: Radar },
    { href: "/app/finance", label: t("common.finance"), icon: BarChart3 },
    { href: "/app/roadmap", label: t("common.roadmap"), icon: FolderKanban },
    { href: "/app/report", label: t("common.report"), icon: FileOutput },
  ];

  const journeyNav = [
    { href: "/app/startups/new", label: t("common.register"), icon: BriefcaseBusiness },
    { href: "/app/modules/product-info", label: t("common.product"), icon: Compass },
    { href: "/app/modules/fundraising", label: t("common.fundraising"), icon: Target },
  ];

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-[280px] flex-col border-r border-border bg-background/50 backdrop-blur-xl lg:flex animate-fade-in">
      <div className="flex flex-col p-6">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow-lg shadow-brand/20">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight text-foreground">GameForm OS</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{t("common.brand_cockpit")}</p>
          </div>
        </div>

        <div className="mt-8">
          <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {t("common.navigation")}
          </p>
          <nav className="mt-4 space-y-1">
            {mainNav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "nav-link",
                    active && "active"
                  )}
                >
                  <item.icon className="h-4.5 w-4.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-8">
          <div className="rounded-2xl border border-border bg-card/40 p-4 shadow-sm">
            <p className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {t("common.journeys")}
            </p>
            <div className="mt-4 grid gap-1">
              {journeyNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-foreground transition hover:bg-white/5 hover:text-brand"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <item.icon className="h-4 w-4" />
                  </div>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          {t("common.modules")}
        </p>
        <div className="mt-4 space-y-2">
          <ModuleLinks
            title={t("common.module_group_diagnosis")}
            modules={getPhaseOneModules()}
            activeModuleSlug={activeModuleSlug}
          />
          <ModuleLinks
            title={t("common.module_group_market")}
            modules={getPhaseTwoModules()}
            activeModuleSlug={activeModuleSlug}
          />
          <ModuleLinks
            title={t("common.module_group_execution")}
            modules={getPhaseThreeModules()}
            activeModuleSlug={activeModuleSlug}
          />
        </div>
      </div>

      <div className="border-t border-border p-6">
        <div className="flex items-center gap-3 px-2">
          <div className={cn("h-2.5 w-2.5 rounded-full bg-accent animate-pulse")} />
          <span className="text-xs font-bold text-muted">{roleMeta.label}</span>
        </div>
      </div>
    </aside>
  );
}

function ModuleLinks({
  title,
  modules,
  activeModuleSlug,
}: {
  title: string;
  modules: ModuleDefinition[];
  activeModuleSlug: string;
}) {
  return (
    <details className="group rounded-xl transition-all duration-200 open:bg-card/30">
      <summary className="flex cursor-pointer items-center justify-between px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted hover:text-foreground">
        {title}
        <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
      </summary>
      <div className="mt-1 space-y-1 px-2 pb-2">
        {modules.map((module) => (
          <Link
            key={module.slug}
            href={`/app/modules/${module.slug}`}
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition",
              activeModuleSlug === module.slug
                ? "bg-brand/10 text-brand"
                : "text-muted hover:bg-white/5 hover:text-foreground",
            )}
          >
            <span className="flex items-center gap-2 truncate">
              <ClipboardList className="h-3.5 w-3.5 opacity-50" />
              {module.shortTitle}
            </span>
            <span className="text-[9px] font-bold opacity-40">{module.progress}%</span>
          </Link>
        ))}
      </div>
    </details>
  );
}
