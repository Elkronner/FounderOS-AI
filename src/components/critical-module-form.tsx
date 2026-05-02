"use client";

import { useState, useTransition } from "react";
import {
  useForm,
  useWatch,
  type FieldValues,
  type Path,
  type UseFormRegister,
} from "react-hook-form";

import {
  saveCompanyInfoAction,
  saveFundingAction,
  savePricingAction,
  saveProductInfoAction,
} from "@/app/app/actions";
import {
  calculateCompanyInfo,
  calculateFunding,
  calculatePricing,
  calculateProductInfo,
  companyInfoDefaults,
  fundingDefaults,
  pricingDefaults,
  productInfoDefaults,
} from "@/lib/critical-module-data";
import type {
  CompanyInfoDetails,
  FundingDetails,
  ModuleDefinition,
  PricingDetails,
  ProductInfoDetails,
  Role,
} from "@/lib/types";

function mergeCompanyInfo(details: unknown): CompanyInfoDetails {
  const current = (details as Partial<CompanyInfoDetails>) ?? {};
  return {
    ...companyInfoDefaults,
    ...current,
    partners: current.partners?.length
      ? current.partners.map((partner, index) => ({
          ...companyInfoDefaults.partners[index % companyInfoDefaults.partners.length],
          ...partner,
        }))
      : companyInfoDefaults.partners,
  };
}

function mergePricing(details: unknown): PricingDetails {
  const current = (details as Partial<PricingDetails>) ?? {};
  return {
    ...pricingDefaults,
    ...current,
    directCosts: current.directCosts?.length
      ? current.directCosts.map((cost, index) => ({
          ...pricingDefaults.directCosts[index % pricingDefaults.directCosts.length],
          ...cost,
        }))
      : pricingDefaults.directCosts,
  };
}

function mergeProductInfo(details: unknown): ProductInfoDetails {
  const current = (details as Partial<ProductInfoDetails>) ?? {};
  return {
    ...productInfoDefaults,
    ...current,
    products: productInfoDefaults.products.map((defaultProduct, index) => ({
      ...defaultProduct,
      ...(current.products?.[index] ?? {}),
    })),
  };
}

function mergeFunding(details: unknown): FundingDetails {
  const current = (details as Partial<FundingDetails>) ?? {};
  return {
    ...fundingDefaults,
    ...current,
    rounds: fundingDefaults.rounds.map((defaultRound, index) => {
      const round = current.rounds?.[index] as
        | Partial<FundingDetails["rounds"][number]>
        | undefined;

      if (!round) {
        return defaultRound;
      }

      return {
        ...defaultRound,
        ...round,
        targetAmount: round.targetAmount ?? (round as { ticketValue?: number }).ticketValue ?? defaultRound.targetAmount,
        raisedAmount: round.raisedAmount ?? defaultRound.raisedAmount,
        percentRaised: round.percentRaised ?? defaultRound.percentRaised,
        investors: round.investors ?? defaultRound.investors,
        valuation: round.valuation ?? (round as { preMoney?: number }).preMoney ?? defaultRound.valuation,
      };
    }),
  };
}

function Panel({
  title,
  summary,
  priorities,
  evidence,
  risks,
  nextStep,
  metrics,
}: {
  title: string;
  summary: string;
  priorities: string;
  evidence: string;
  risks: string;
  nextStep: string;
  metrics: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
        <p><span className="font-semibold text-slate-900">Resumo:</span> {summary}</p>
        <p><span className="font-semibold text-slate-900">Prioridades:</span> {priorities}</p>
        <p><span className="font-semibold text-slate-900">Evidencias:</span> {evidence}</p>
        <p><span className="font-semibold text-slate-900">Riscos:</span> {risks}</p>
        <p><span className="font-semibold text-slate-900">Proximo passo:</span> {nextStep}</p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{metric.label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{metric.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SaveFeedback({
  message,
  error,
}: {
  message: string | null;
  error: string | null;
}) {
  return (
    <>
      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      ) : null}
      {message ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}
    </>
  );
}

function TextInput<TFieldValues extends FieldValues>({
  label,
  register,
  name,
  required = true,
  disabled = false,
}: {
  label: string;
  register: UseFormRegister<TFieldValues>;
  name: Path<TFieldValues>;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        {...register(name, { required })}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"
      />
    </label>
  );
}

function NumberInput<TFieldValues extends FieldValues>({
  label,
  register,
  name,
  step = "0.01",
  disabled = false,
}: {
  label: string;
  register: UseFormRegister<TFieldValues>;
  name: Path<TFieldValues>;
  step?: string;
  disabled?: boolean;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type="number"
        step={step}
        {...register(name, { valueAsNumber: true, required: true })}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"
      />
    </label>
  );
}

function CompanyInfoForm({
  module,
  actorRole,
}: {
  module: ModuleDefinition;
  actorRole: Role;
}) {
  const canEdit = actorRole !== "mentor";
  const defaults = mergeCompanyInfo(module.details);
  const {
    control,
    register,
    handleSubmit,
    reset,
  } = useForm<CompanyInfoDetails>({ defaultValues: defaults });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const values = useWatch({ control }) as CompanyInfoDetails;
  const calc = calculateCompanyInfo(values);

  const submit = handleSubmit((data) => {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await saveCompanyInfoAction(data);
      if (!result.success) {
        setError(result.message);
        return;
      }

      if (result.module?.details) {
        reset(result.module.details as CompanyInfoDetails);
      }
      setMessage(result.message);
    });
  });

  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <h2 className="text-xl font-semibold text-slate-950">Informacoes da empresa</h2>
        <p className="mt-1 text-sm text-slate-600">
          Campos estruturados para cadastro institucional e tabela de socios.
        </p>
        {!canEdit ? (
          <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Mentores possuem acesso de leitura neste modulo.
          </p>
        ) : null}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <TextInput label="Nome fantasia" register={register} name="companyName" disabled={!canEdit || isPending} />
          <TextInput label="Razao social" register={register} name="legalName" disabled={!canEdit || isPending} />
          <TextInput label="CNPJ" register={register} name="cnpj" disabled={!canEdit || isPending} />
          <TextInput label="Website" register={register} name="website" disabled={!canEdit || isPending} />
          <TextInput label="Localizacao" register={register} name="location" disabled={!canEdit || isPending} />
          <TextInput label="Estagio" register={register} name="stage" disabled={!canEdit || isPending} />
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Descricao</span>
            <textarea
              rows={4}
              {...register("description")}
              disabled={!canEdit || isPending}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-400"
            />
          </label>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-3 py-2">Socio</th>
                <th className="px-3 py-2">Papel</th>
                <th className="px-3 py-2">Equity %</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {defaults.partners.map((_, index) => (
                <tr key={index} className="border-b border-slate-100 align-top">
                  <td className="px-2 py-2">
                    <input
                      {...register(`partners.${index}.name`)}
                      disabled={!canEdit || isPending}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      {...register(`partners.${index}.role`)}
                      disabled={!canEdit || isPending}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      step="0.1"
                      {...register(`partners.${index}.equityPercent`, {
                        valueAsNumber: true,
                      })}
                      disabled={!canEdit || isPending}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      {...register(`partners.${index}.email`)}
                      disabled={!canEdit || isPending}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      {...register(`partners.${index}.whatsapp`)}
                      disabled={!canEdit || isPending}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={isPending || !canEdit}
            onClick={submit}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isPending ? "Salvando..." : canEdit ? "Salvar estrutura" : "Somente leitura"}
          </button>
        </div>

        <div className="mt-4">
          <SaveFeedback message={message} error={error} />
        </div>
      </div>

      <Panel
        title="Calculos da aba"
        summary={calc.summary}
        priorities={calc.priorities}
        evidence={calc.evidence}
        risks={calc.risks}
        nextStep={calc.nextStep}
        metrics={[
          { label: "Equity total", value: `${calc.metrics.equityTotal}%` },
          { label: "Equity restante", value: `${calc.metrics.missingEquity}%` },
          { label: "Media por socio", value: `${calc.metrics.averagePartnerEquity}%` },
        ]}
      />
    </section>
  );
}

function PricingForm({
  module,
  actorRole,
}: {
  module: ModuleDefinition;
  actorRole: Role;
}) {
  const canEdit = actorRole !== "mentor";
  const defaults = mergePricing(module.details);
  const { control, register, handleSubmit, reset } = useForm<PricingDetails>({
    defaultValues: defaults,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const values = useWatch({ control }) as PricingDetails;
  const calc = calculatePricing(values);

  const submit = handleSubmit((data) => {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await savePricingAction(data);
      if (!result.success) {
        setError(result.message);
        return;
      }
      if (result.module?.details) {
        reset(result.module.details as PricingDetails);
      }
      setMessage(result.message);
    });
  });

  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <h2 className="text-xl font-semibold text-slate-950">Precificacao</h2>
        <p className="mt-1 text-sm text-slate-600">
          Custos, impostos, margem e preco final calculados em tempo real.
        </p>
        {!canEdit ? (
          <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Mentores possuem acesso de leitura neste modulo.
          </p>
        ) : null}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <TextInput label="Nome do produto" register={register} name="productName" disabled={!canEdit || isPending} />
          <TextInput label="Tipo de produto" register={register} name="productType" disabled={!canEdit || isPending} />
          <NumberInput label="Aliquota de imposto %" register={register} name="taxRatePercent" step="0.1" disabled={!canEdit || isPending} />
          <NumberInput label="Margem alvo %" register={register} name="marginPercent" step="0.1" disabled={!canEdit || isPending} />
          <NumberInput label="Desconto maximo %" register={register} name="discountPercent" step="0.1" disabled={!canEdit || isPending} />
          <NumberInput label="Unidades mensais" register={register} name="monthlyUnits" step="1" disabled={!canEdit || isPending} />
          <NumberInput label="Preco concorrente mais baixo" register={register} name="competitorPriceLow" step="0.01" disabled={!canEdit || isPending} />
          <NumberInput label="Preco concorrente mais alto" register={register} name="competitorPriceHigh" step="0.01" disabled={!canEdit || isPending} />
          <TextInput label="Posicionamento" register={register} name="positioning" disabled={!canEdit || isPending} />
          <TextInput label="Faixa ideal de preço" register={register} name="idealPriceRange" disabled={!canEdit || isPending} />
          <NumberInput label="Salario CLT" register={register} name="cltSalary" step="0.01" disabled={!canEdit || isPending} />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-3 py-2">Custo</th>
                <th className="px-3 py-2">Valor</th>
              </tr>
            </thead>
            <tbody>
              {defaults.directCosts.map((_, index) => (
                <tr key={index} className="border-b border-slate-100">
                  <td className="px-2 py-2">
                    <input
                      {...register(`directCosts.${index}.label`)}
                      disabled={!canEdit || isPending}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      step="0.01"
                      {...register(`directCosts.${index}.value`, {
                        valueAsNumber: true,
                      })}
                      disabled={!canEdit || isPending}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={isPending || !canEdit}
            onClick={submit}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isPending ? "Salvando..." : canEdit ? "Salvar estrutura" : "Somente leitura"}
          </button>
        </div>

        <div className="mt-4">
          <SaveFeedback message={message} error={error} />
        </div>
      </div>

      <Panel
        title="Calculos da aba"
        summary={calc.summary}
        priorities={calc.priorities}
        evidence={calc.evidence}
        risks={calc.risks}
        nextStep={calc.nextStep}
        metrics={[
          { label: "Custo direto", value: calc.metrics.directCostTotal.toFixed(2) },
          { label: "Custo tributado", value: calc.metrics.taxedCost.toFixed(3) },
          { label: "Preco workbook", value: calc.metrics.finalPrice.toFixed(3) },
          { label: "Custo CLT", value: calc.metrics.cltTotal.toFixed(2) },
        ]}
      />
    </section>
  );
}

function ProductInfoForm({
  module,
  actorRole,
}: {
  module: ModuleDefinition;
  actorRole: Role;
}) {
  const canEdit = actorRole !== "mentor";
  const defaults = mergeProductInfo(module.details);
  const { control, register, handleSubmit, reset } = useForm<ProductInfoDetails>({
    defaultValues: defaults,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const values = useWatch({ control }) as ProductInfoDetails;
  const calc = calculateProductInfo(values);

  const submit = handleSubmit((data) => {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await saveProductInfoAction(data);
      if (!result.success) {
        setError(result.message);
        return;
      }
      if (result.module?.details) {
        reset(result.module.details as ProductInfoDetails);
      }
      setMessage(result.message);
    });
  });

  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <h2 className="text-xl font-semibold text-slate-950">Informacoes do produto</h2>
        <p className="mt-1 text-sm text-slate-600">
          Regime tributario, familia de produto e custo real de equipe.
        </p>
        {!canEdit ? (
          <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Mentores possuem acesso de leitura neste modulo.
          </p>
        ) : null}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <TextInput label="Regime tributario" register={register} name="taxRegime" disabled={!canEdit || isPending} />
          <TextInput label="Familia do produto" register={register} name="productFamily" disabled={!canEdit || isPending} />
          <TextInput label="Tipo de produto" register={register} name="taxProductType" disabled={!canEdit || isPending} />
          <TextInput label="Anexo" register={register} name="anexo" disabled={!canEdit || isPending} />
          <NumberInput label="Presuncao Lucro %" register={register} name="lucroPresumidoPercent" step="0.01" disabled={!canEdit || isPending} />
          <NumberInput label="Salario CLT" register={register} name="cltSalary" step="0.01" disabled={!canEdit || isPending} />
          <NumberInput label="Beneficios %" register={register} name="cltBenefitsPercent" step="0.01" disabled={!canEdit || isPending} />
          <NumberInput label="Encargos %" register={register} name="cltEncargosPercent" step="0.01" disabled={!canEdit || isPending} />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-3 py-2">Produto</th>
                <th className="px-3 py-2">Categoria</th>
                <th className="px-3 py-2">Preco</th>
                <th className="px-3 py-2">Quantidade</th>
                <th className="px-3 py-2">PIS</th>
                <th className="px-3 py-2">COFINS</th>
                <th className="px-3 py-2">ICMS</th>
                <th className="px-3 py-2">ISS</th>
              </tr>
            </thead>
            <tbody>
              {defaults.products.map((_, index) => (
                <tr key={index} className="border-b border-slate-100">
                  <td className="px-2 py-2">
                    <input
                      {...register(`products.${index}.name`)}
                      disabled={!canEdit || isPending}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      {...register(`products.${index}.category`)}
                      disabled={!canEdit || isPending}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      step="0.01"
                      {...register(`products.${index}.price`, { valueAsNumber: true })}
                      disabled={!canEdit || isPending}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      step="1"
                      {...register(`products.${index}.quantity`, { valueAsNumber: true })}
                      disabled={!canEdit || isPending}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      step="0.0001"
                      {...register(`products.${index}.pisPercent`, { valueAsNumber: true })}
                      disabled={!canEdit || isPending}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      step="0.0001"
                      {...register(`products.${index}.cofinsPercent`, { valueAsNumber: true })}
                      disabled={!canEdit || isPending}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      step="0.0001"
                      {...register(`products.${index}.icmsPercent`, { valueAsNumber: true })}
                      disabled={!canEdit || isPending}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      step="0.0001"
                      {...register(`products.${index}.issPercent`, { valueAsNumber: true })}
                      disabled={!canEdit || isPending}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={isPending || !canEdit}
            onClick={submit}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isPending ? "Salvando..." : canEdit ? "Salvar estrutura" : "Somente leitura"}
          </button>
        </div>

        <div className="mt-4">
          <SaveFeedback message={message} error={error} />
        </div>
      </div>

      <Panel
        title="Calculos da aba"
        summary={calc.summary}
        priorities={calc.priorities}
        evidence={calc.evidence}
        risks={calc.risks}
        nextStep={calc.nextStep}
        metrics={[
          { label: "Custo CLT", value: calc.metrics.cltTotal.toFixed(2) },
          { label: "Receita potencial", value: calc.metrics.productsRevenue.toFixed(2) },
          { label: "Tributos", value: calc.metrics.productTaxTotal.toFixed(2) },
          { label: "Produtos ativos", value: String(calc.metrics.activeProducts) },
        ]}
      />
    </section>
  );
}

function FundingForm({
  module,
  actorRole,
}: {
  module: ModuleDefinition;
  actorRole: Role;
}) {
  const canEdit = actorRole !== "mentor";
  const defaults = mergeFunding(module.details);
  const { control, register, handleSubmit, reset } = useForm<FundingDetails>({
    defaultValues: defaults,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const values = useWatch({ control }) as FundingDetails;
  const calc = calculateFunding(values);

  const submit = handleSubmit((data) => {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await saveFundingAction(data);
      if (!result.success) {
        setError(result.message);
        return;
      }
      if (result.module?.details) {
        reset(result.module.details as FundingDetails);
      }
      setMessage(result.message);
    });
  });

  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <h2 className="text-xl font-semibold text-slate-950">Captacao de investimentos</h2>
        <p className="mt-1 text-sm text-slate-600">
          Tese, rodada, valuations e distribuicao de equity por rodada.
        </p>
        {!canEdit ? (
          <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Mentores possuem acesso de leitura neste modulo.
          </p>
        ) : null}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <TextInput label="Estrategia" register={register} name="strategy" disabled={!canEdit || isPending} />
          <TextInput label="Lead da rodada" register={register} name="roundLead" disabled={!canEdit || isPending} />
          <NumberInput label="Target amount" register={register} name="targetAmount" step="0.01" disabled={!canEdit || isPending} />
          <NumberInput label="Runway (meses)" register={register} name="runwayMonths" step="1" disabled={!canEdit || isPending} />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-3 py-2">Rodada</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Valor a captar</th>
                <th className="px-3 py-2">Valor captado</th>
                <th className="px-3 py-2">%</th>
                <th className="px-3 py-2">Investidores</th>
                <th className="px-3 py-2">Equity %</th>
                <th className="px-3 py-2">Valuation</th>
              </tr>
            </thead>
            <tbody>
              {defaults.rounds.map((_, index) => (
                <tr key={index} className="border-b border-slate-100">
                  <td className="px-2 py-2">
                    <input
                      {...register(`rounds.${index}.roundName`)}
                      disabled={!canEdit || isPending}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      {...register(`rounds.${index}.status`)}
                      disabled={!canEdit || isPending}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      step="0.01"
                      {...register(`rounds.${index}.targetAmount`, { valueAsNumber: true })}
                      disabled={!canEdit || isPending}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      step="0.01"
                      {...register(`rounds.${index}.raisedAmount`, { valueAsNumber: true })}
                      disabled={!canEdit || isPending}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      step="0.01"
                      {...register(`rounds.${index}.percentRaised`, { valueAsNumber: true })}
                      disabled={!canEdit || isPending}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      step="1"
                      {...register(`rounds.${index}.investors`, { valueAsNumber: true })}
                      disabled={!canEdit || isPending}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      step="0.1"
                      {...register(`rounds.${index}.equityOfferedPercent`, {
                        valueAsNumber: true,
                      })}
                      disabled={!canEdit || isPending}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      step="0.01"
                      {...register(`rounds.${index}.valuation`, { valueAsNumber: true })}
                      disabled={!canEdit || isPending}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={isPending || !canEdit}
            onClick={submit}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isPending ? "Salvando..." : canEdit ? "Salvar estrutura" : "Somente leitura"}
          </button>
        </div>

        <div className="mt-4">
          <SaveFeedback message={message} error={error} />
        </div>
      </div>

      <Panel
        title="Calculos da aba"
        summary={calc.summary}
        priorities={calc.priorities}
        evidence={calc.evidence}
        risks={calc.risks}
        nextStep={calc.nextStep}
        metrics={[
          { label: "Valor necessario", value: calc.metrics.totalRequested.toLocaleString("pt-BR") },
          { label: "Valor captado", value: calc.metrics.totalRaised.toLocaleString("pt-BR") },
          { label: "Valor a captar", value: calc.metrics.remainingToRaise.toLocaleString("pt-BR") },
          { label: "Valuation atual", value: calc.metrics.currentValuation.toLocaleString("pt-BR") },
        ]}
      />
    </section>
  );
}

export function CriticalModuleForm({
  module,
  actorRole,
}: {
  module: ModuleDefinition;
  actorRole: Role;
}) {
  switch (module.slug) {
    case "company-info":
      return <CompanyInfoForm module={module} actorRole={actorRole} />;
    case "pricing":
      return <PricingForm module={module} actorRole={actorRole} />;
    case "product-info":
      return <ProductInfoForm module={module} actorRole={actorRole} />;
    case "fundraising":
      return <FundingForm module={module} actorRole={actorRole} />;
    default:
      return null;
  }
}
