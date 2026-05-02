import Link from "next/link";

import { RevenueChart } from "@/components/charts/revenue-chart";
import { getModuleBySlug } from "@/lib/gameform-data";
import { readGameformSnapshot } from "@/lib/gameform-store";

export default async function FinancePage() {
  const snapshot = await readGameformSnapshot();
  const module24m = getModuleBySlug("finance-24m", snapshot.modules);
  const module5y = getModuleBySlug("finance-5y", snapshot.modules);
  const currency = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  });

  return (
    <main className="space-y-6">
      <section className="glass-panel rounded-[2rem] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-950">
              Projecoes Financeiras da Fase 3
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              Painel com visao tatico-estrategica para 24 meses e consolidacao de
              horizonte de 5 anos.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/app/modules/finance-24m"
              className="rounded-full border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              Abrir editor 24 meses
            </Link>
            <Link
              href="/app/modules/finance-5y"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Abrir modulo 5 anos
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
            Projecao financeira 24 meses
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {module24m?.progress ?? 0}% preenchido
          </p>
          <p className="mt-1 text-sm text-slate-600">{module24m?.nextAction}</p>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Os numeros editaveis ficam no modulo de 24 meses. Esta tela mostra o consolidado
            apos salvar.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
            Projecao financeira 5 anos
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {module5y?.progress ?? 0}% preenchido
          </p>
          <p className="mt-1 text-sm text-slate-600">{module5y?.nextAction}</p>
        </div>
      </section>

      <section className="glass-panel rounded-[2rem] p-6">
        <h2 className="text-xl font-semibold text-slate-950">Projecao 24 meses</h2>
        <p className="mt-1 text-sm text-slate-600">
          Receita, custos e caixa mensal para gestao de runway e captacao.
        </p>
        <div className="mt-5">
          <RevenueChart data={snapshot.finance24m} />
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Mês</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Receita</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Custos</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Caixa</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.finance24m.map((item) => (
                <tr key={item.month} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-900">{item.month}</td>
                  <td className="px-4 py-3 text-slate-700">{currency.format(item.receita)}</td>
                  <td className="px-4 py-3 text-slate-700">{currency.format(item.custos)}</td>
                  <td className="px-4 py-3 text-slate-700">{currency.format(item.caixa)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="glass-panel rounded-[2rem] p-6">
        <h2 className="text-xl font-semibold text-slate-950">Projecao 5 anos</h2>
        <p className="mt-1 text-sm text-slate-600">
          Consolidado anual em valores absolutos para planejamento de escala e margem.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Ano</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Receita</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Lucro líquido</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Caixa</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.finance5y.map((item) => (
                <tr key={item.year} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-900">{item.year}</td>
                  <td className="px-4 py-3 text-slate-700">{currency.format(item.receita)}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {currency.format(item.lucroLiquido)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{currency.format(item.caixa)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
