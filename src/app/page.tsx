import Link from "next/link";

import {
  ArrowRight,
  Orbit,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="grid-sheen absolute inset-0 opacity-60" />
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-8">
            <span className="pill border-blue-200 bg-blue-50 text-blue-700">
              <Sparkles className="h-4 w-4" />
              Plataforma estrategica para estagios de crescimento
            </span>

            <div className="space-y-5">
              <h1 className="max-w-3xl font-display text-5xl font-semibold tracking-tight text-slate-950 md:text-6xl">
                GameForm Growth System
              </h1>
              <p className="max-w-2xl text-balance text-lg leading-8 text-slate-600 md:text-xl">
                Evolua estudios e startups de games com uma trilha clara de
                maturidade, mentoria colaborativa, validacao de negocio e
                acompanhamento executivo em tempo real.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Entrar na plataforma
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              >
                Ver demo navegavel
              </Link>
            </div>

            <div className="grid gap-4 pt-4 sm:grid-cols-3">
              {[
                {
                  icon: Orbit,
                  title: "Trilha de maturidade",
                  text: "Sensores, etapas e score por area para acompanhar evolucao.",
                },
                {
                  icon: Waypoints,
                  title: "Mentoria estruturada",
                  text: "Comentarios, feedbacks e reunioes com visao resumida.",
                },
                {
                  icon: ShieldCheck,
                  title: "Governanca segura",
                  text: "RLS, papeis e historico auditavel em todas as acoes relevantes.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="surface-panel rounded-3xl p-5 transition hover:-translate-y-1"
                >
                  <item.icon className="h-8 w-8 text-teal-700" />
                  <h2 className="mt-4 text-lg font-semibold text-slate-900">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-panel relative rounded-[2rem] p-6">
            <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-teal-200">Studio health</p>
                  <h2 className="mt-2 font-display text-3xl font-bold">
                    76% de prontidao
                  </h2>
                </div>
                <div className="rounded-full bg-white/10 px-4 py-2 text-sm">
                  Em aceleracao
                </div>
              </div>
              <div className="mt-8 space-y-4">
                {[
                  ["Validacao de mercado", "82%"],
                  ["Produto e roadmap", "74%"],
                  ["Financeiro e captable", "68%"],
                  ["Pitch e fundraising", "79%"],
                ].map(([label, value]) => (
                  <div key={label} className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-200">
                      <span>{label}</span>
                      <span>{value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="progress-value" style={{ width: value }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="soft-panel rounded-3xl p-5">
                <p className="text-sm text-slate-500">Pendencias criticas</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">05</p>
                <p className="mt-2 text-sm text-slate-600">
                  Precificacao, milestones e atualizacao do GF-Sensor.
                </p>
              </div>
              <div className="soft-panel rounded-3xl p-5">
                <p className="text-sm text-slate-500">Mentorias do mes</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">08</p>
                <p className="mt-2 text-sm text-slate-600">
                  Ritmo acompanhado em um painel compartilhado entre time,
                  mentor e Osten Games.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
