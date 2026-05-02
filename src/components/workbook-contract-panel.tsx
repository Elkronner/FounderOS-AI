import { Bot, FileSpreadsheet, LockKeyhole, MessageSquareText } from "lucide-react";

import type { ModuleDefinition } from "@/lib/types";
import {
  getFieldCounts,
  getModuleAiFeedback,
  type WorkbookModuleContract,
} from "@/lib/workbook-methodology";

const fieldKindLabel = {
  input: "Editavel",
  select: "Select",
  formula: "Formula",
  reference: "Referencia",
} as const;

const fieldKindClass = {
  input: "border-teal-200 bg-teal-50 text-teal-800",
  select: "border-blue-200 bg-blue-50 text-blue-800",
  formula: "border-slate-300 bg-slate-100 text-slate-800",
  reference: "border-amber-200 bg-amber-50 text-amber-800",
} as const;

export function WorkbookContractPanel({
  module,
  contract,
}: {
  module: ModuleDefinition;
  contract: WorkbookModuleContract;
}) {
  const counts = getFieldCounts(contract);
  const aiFeedback = getModuleAiFeedback(module, contract);

  return (
    <div className="space-y-5">
      <section className="surface-panel p-5">
        <div className="flex items-start gap-3">
          <FileSpreadsheet className="h-9 w-9 rounded-lg bg-blue-50 p-2 text-blue-700" />
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Contrato da planilha</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Aba original: <strong>{contract.sheetName}</strong>. {contract.purpose}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          {[
            ["Inputs", counts.input],
            ["Selects", counts.select],
            ["Formulas", counts.formula],
            ["Referencias", counts.reference],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-lg font-semibold text-slate-950">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-panel p-5">
        <div className="flex items-center gap-3">
          <LockKeyhole className="h-8 w-8 rounded-lg bg-slate-100 p-2 text-slate-800" />
          <h2 className="text-lg font-semibold text-slate-950">Campos e regras</h2>
        </div>
        <div className="mt-4 space-y-3">
          {contract.fields.map((field) => (
            <div key={`${field.ref}-${field.label}`} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-950">{field.label}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">
                    {field.source ? `${field.source} | ` : ""}
                    {field.ref}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${fieldKindClass[field.kind]}`}
                >
                  {fieldKindLabel[field.kind]}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{field.helper}</p>
              {field.formula ? (
                <code className="mt-3 block rounded-lg bg-slate-950 px-3 py-2 text-xs text-white">
                  {field.formula}
                </code>
              ) : null}
              {field.options ? (
                <p className="mt-3 text-xs text-slate-500">{field.options.join(" | ")}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="surface-panel p-5">
        <div className="flex items-center gap-3">
          <Bot className="h-8 w-8 rounded-lg bg-blue-50 p-2 text-blue-700" />
          <h2 className="text-lg font-semibold text-slate-950">Sinais automaticos da metodologia</h2>
        </div>
        <div className="mt-4 space-y-3">
          {aiFeedback.map((item) => (
            <div key={item} className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
              <p className="text-sm leading-6 text-blue-900">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-panel p-5">
        <div className="flex items-center gap-3">
          <MessageSquareText className="h-8 w-8 rounded-lg bg-teal-50 p-2 text-teal-700" />
          <h2 className="text-lg font-semibold text-slate-950">Criterios de aceite</h2>
        </div>
        <ul className="mt-4 space-y-2">
          {contract.acceptanceChecks.map((check) => (
            <li key={check} className="text-sm leading-6 text-slate-600">
              {check}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
