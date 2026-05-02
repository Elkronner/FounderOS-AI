"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";

import { saveFinance24mAction } from "@/app/app/actions";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { WorkbookCellField } from "@/components/workbook-cell-field";
import type { ModuleDefinition, ModuleFormData, RevenuePoint, Role } from "@/lib/types";

type Finance24mFormValues = ModuleFormData & {
  monthly: RevenuePoint[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);
}

function computeTotals(monthly: RevenuePoint[]) {
  return monthly.reduce(
    (acc, item) => ({
      receita: acc.receita + (Number.isFinite(item.receita) ? item.receita : 0),
      custos: acc.custos + (Number.isFinite(item.custos) ? item.custos : 0),
      caixa: acc.caixa + (Number.isFinite(item.caixa) ? item.caixa : 0),
    }),
    { receita: 0, custos: 0, caixa: 0 },
  );
}

function deriveCashSeries(monthly: RevenuePoint[], openingCashSeed: number) {
  let currentCash = Number.isFinite(openingCashSeed) ? openingCashSeed : 0;

  return monthly.map((row, index) => {
    const receita = Number.isFinite(row.receita) ? row.receita : 0;
    const custos = Number.isFinite(row.custos) ? row.custos : 0;
    currentCash = index === 0 ? currentCash + receita - custos : currentCash + receita - custos;

    return {
      ...row,
      receita,
      custos,
      caixa: currentCash,
    };
  });
}

function computeCompletion(monthly: RevenuePoint[]) {
  if (!monthly.length) {
    return 0;
  }

  const filledCells = monthly.reduce((total, row) => {
    return (
      total +
      [row.receita, row.custos, row.caixa].filter(
        (value) => typeof value === "number" && Number.isFinite(value),
      ).length
    );
  }, 0);

  return Math.round((filledCells / (monthly.length * 3)) * 100);
}

export function Finance24mForm({
  module,
  monthlyRows,
  actorRole = "founder",
}: {
  module: ModuleDefinition;
  monthlyRows: RevenuePoint[];
  actorRole?: Role;
}) {
  const canEdit = actorRole !== "mentor";
  const defaultValues: Finance24mFormValues = {
    ...module.form,
    monthly: monthlyRows.length ? monthlyRows : [],
  };
  const { register, handleSubmit, reset, control } = useForm<Finance24mFormValues>({
    defaultValues,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const values = useWatch({ control }) as Finance24mFormValues;
  const monthlyInput = values?.monthly?.length ? values.monthly : defaultValues.monthly;
  const openingCashSeed =
    monthlyRows.length > 0
      ? monthlyRows[0].caixa - monthlyRows[0].receita + monthlyRows[0].custos
      : 0;
  const monthly = deriveCashSeries(monthlyInput, openingCashSeed);
  const totals = computeTotals(monthly);
  const completion = computeCompletion(monthly);
  const latestCash = monthly[monthly.length - 1]?.caixa ?? 0;

  const submit = (intent: "draft" | "publish") =>
    handleSubmit((data) => {
      setMessage(null);
      setError(null);
      startTransition(async () => {
        const result = await saveFinance24mAction({
          ...data,
          monthly: deriveCashSeries(data.monthly, openingCashSeed),
          intent,
        });

        if (!result.success) {
          setError(result.message);
          return;
        }

        const savedModule = result.module as ModuleDefinition | undefined;
        const savedMonthly =
          (savedModule?.details as { monthly?: RevenuePoint[] } | undefined)?.monthly ??
          data.monthly;

        reset({
          ...(savedModule?.form ?? data),
          monthly: savedMonthly,
        });
        setMessage(result.message);
      });
    });

  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Editor financeiro 24 meses</h2>
            <p className="mt-1 text-sm text-slate-600">
              Atualize os valores da planilha linha por linha.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Preenchimento:</span> {completion}%
          </div>
        </div>

        {!canEdit ? (
          <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Mentores possuem acesso de leitura neste modulo.
          </p>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Receita total</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{formatCurrency(totals.receita)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Custos totais</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{formatCurrency(totals.custos)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Caixa final</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{formatCurrency(latestCash)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Meses</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{monthly.length}</p>
          </div>
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
              {monthly.map((row, index) => (
                <tr key={`${row.month}-${index}`} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    <WorkbookCellField
                      label="Mês"
                      kind="formula"
                      value={row.month}
                      disabled
                      readOnlyHint="Mês calculado pela planilha"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      step="0.01"
                      {...register(`monthly.${index}.receita`, { valueAsNumber: true })}
                      disabled={!canEdit || isPending}
                      className="w-full min-w-32 rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      step="0.01"
                      {...register(`monthly.${index}.custos`, { valueAsNumber: true })}
                      disabled={!canEdit || isPending}
                      className="w-full min-w-32 rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <WorkbookCellField
                      label={`Caixa ${row.month}`}
                      kind="formula"
                      value={row.caixa}
                      disabled
                      readOnlyHint="Resultado calculado da planilha"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-white p-5">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Resumo executivo</span>
              <textarea
                rows={4}
                {...register("summary")}
                disabled={!canEdit || isPending}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Prioridades</span>
              <textarea
                rows={4}
                {...register("priorities")}
                disabled={!canEdit || isPending}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Evidencias</span>
              <textarea
                rows={4}
                {...register("evidence")}
                disabled={!canEdit || isPending}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Riscos</span>
              <textarea
                rows={4}
                {...register("risks")}
                disabled={!canEdit || isPending}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Proximo passo</span>
              <textarea
                rows={4}
                {...register("nextStep")}
                disabled={!canEdit || isPending}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400"
              />
            </label>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-slate-950">Visualização ao vivo</h3>
              <p className="mt-1 text-sm text-slate-600">
              O gráfico acompanha a edição dos valores em tempo real.
              </p>
              <div className="mt-5">
                <RevenueChart data={monthly} />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-900">Como usar</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <li>1. Ajuste receita, custos e caixa mês a mês.</li>
                <li>2. Revise o texto do plano financeiro para manter a narrativa.</li>
                <li>3. Salve ou publique para persistir no store e atualizar o dashboard.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={isPending || !canEdit}
            onClick={submit("draft")}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-60"
          >
            {isPending ? "Salvando..." : canEdit ? "Salvar rascunho" : "Somente leitura"}
          </button>
          <button
            type="button"
            disabled={isPending || !canEdit}
            onClick={submit("publish")}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isPending ? "Publicando..." : canEdit ? "Publicar módulo" : "Somente leitura"}
          </button>
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
        ) : null}
        {message ? (
          <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
