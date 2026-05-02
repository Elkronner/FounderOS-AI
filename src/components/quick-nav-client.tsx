"use client";

import Link from "next/link";
import { useSettings } from "@/components/providers/settings-provider";
import { cn } from "@/lib/utils";
import { Home, Bot, MessageSquareText, Radar, BarChart3 } from "lucide-react";

export function QuickNavClient({ pathname }: { pathname: string }) {
  const { t } = useSettings();
  
  const quickNav = [
    { href: "/app", label: t("common.dashboard"), icon: Home },
    { href: "/app/ai", label: t("common.ai_advisor"), icon: Bot },
    { href: "/app/mentor", label: t("common.mentor_central"), icon: MessageSquareText },
    { href: "/app/gf-sensor", label: t("common.sensor"), icon: Radar },
    { href: "/app/finance", label: t("common.finance"), icon: BarChart3 },
  ];

  return (
    <nav className="flex items-center gap-1 overflow-x-auto lg:gap-2">
      {quickNav.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
              active
                ? "bg-brand/10 text-brand shadow-[0_0_20px_-12px_rgba(99,102,241,0.5)]"
                : "text-muted hover:bg-white/5 hover:text-foreground",
            )}
          >
            <item.icon className={cn("h-4 w-4 transition-transform", active && "scale-110")} />
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
