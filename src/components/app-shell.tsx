import type { ReactNode } from "react";

import { headers } from "next/headers";
import Link from "next/link";

import { BarChart3, Bot, Home, MessageSquareText, Radar } from "lucide-react";

import { QuickNavClient } from "@/components/quick-nav-client";
import { SidebarPhaseOne } from "@/components/sidebar-phase-one";
import { ThemeLanguageSwitcher } from "@/components/theme-language-switcher";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

export async function AppShell({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "/app";

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarPhaseOne role={role} pathname={pathname} />
      
      <div className="flex-1 lg:pl-[280px]">
        <header className="sticky top-0 z-40 w-full border-b border-border bg-background/60 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-8">
            <div className="hidden lg:block">
              <QuickNavClient pathname={pathname} />
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeLanguageSwitcher />
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-[10px] font-bold text-brand">
                  OG
                </span>
                <span className="hidden text-xs font-bold text-foreground sm:block">
                  Workspace Osten Games
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] p-4 sm:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
