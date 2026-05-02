import Link from "next/link";

import {
  BadgeDollarSign,
  BriefcaseBusiness,
  ChartArea,
  ClipboardList,
  Compass,
  FolderKanban,
  Home,
  Radar,
  ScrollText,
  Users,
} from "lucide-react";

import { roles } from "@/lib/gameform-data";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/app", label: "Dashboard", icon: Home },
  { href: "/app/startups/new", label: "Cadastro de startup", icon: BriefcaseBusiness },
  { href: "/app/gf-sensor", label: "Comparativo GF-Sensor", icon: Radar },
  { href: "/app/finance", label: "Financeiro 24 meses", icon: BadgeDollarSign },
  { href: "/app/roadmap", label: "Marcos + Gantt", icon: FolderKanban },
  { href: "/app/report", label: "Relatório executivo", icon: ScrollText },
  { href: "/app/mentor", label: "Painel mentor", icon: Users },
  { href: "/app/admin", label: "Painel admin", icon: ChartArea },
];

export function Sidebar({ role, pathname }: { role: Role; pathname: string }) {
  const roleMeta = roles[role];

  return (
    <aside className="glass-panel hidden w-80 flex-col rounded-[2rem] p-5 lg:flex">
      <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
        <p className="text-sm text-teal-200">FounderOS AI</p>
        <h2 className="mt-2 font-display text-2xl font-bold">Osten Games</h2>
        <span className={cn("mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold", roleMeta.accent)}>
          {roleMeta.label}
        </span>
      </div>

      <nav className="mt-6 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-white hover:text-slate-950",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[1.5rem] border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <Compass className="h-10 w-10 rounded-2xl bg-teal-50 p-2 text-teal-700" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Navegação por módulos</p>
            <p className="text-xs leading-5 text-slate-500">
              Cada aba da planilha virou um módulo independente com progresso, comentários e publish.
            </p>
          </div>
        </div>
        <Link
          href="/app/modules/company-info"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          <ClipboardList className="h-4 w-4" />
          Abrir módulo
        </Link>
      </div>
    </aside>
  );
}
