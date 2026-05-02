"use client";

import { useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { saveSensorWorkbookAction } from "@/app/app/actions";
import { WorkbookCellField } from "@/components/workbook-cell-field";
import {
  buildSensorWorkbookSheet,
  buildWorkbookSensorResponses,
  scoreWorkbookSensorResponse,
  sensorWorkbookQuestions,
} from "@/lib/workbook-model";
import { useSettings } from "@/components/providers/settings-provider";
import type { ModuleDefinition, Role, SensorWorkbookDetails } from "@/lib/types";

type SensorWorkbookFormValues = {
  responses: string[];
};

function getDefaultResponses(module: ModuleDefinition) {
  const workbookDefaults = buildWorkbookSensorResponses();
  const stored = module.details as SensorWorkbookDetails | undefined;

  if (
    Array.isArray(stored?.responses) &&
    stored.responses.length === sensorWorkbookQuestions.length
  ) {
    return stored.responses;
  }

  return module.slug === "gf-sensor-current" ? workbookDefaults.current : workbookDefaults.initial;
}

export function SensorWorkbookForm({
  module,
  actorRole = "founder",
}: {
  module: ModuleDefinition;
  actorRole?: Role;
}) {
  const { t } = useSettings();
  const canEdit = actorRole !== "mentor";
  const defaultResponses = getDefaultResponses(module);
  const { control, handleSubmit, reset } = useForm<SensorWorkbookFormValues>({
    defaultValues: { responses: defaultResponses },
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const values = useWatch({ control }) as SensorWorkbookFormValues;
  const responses = values?.responses?.length ? values.responses : defaultResponses;
  const workbookSheet = buildSensorWorkbookSheet(
    module.slug === "gf-sensor-current" ? "gf-sensor-current" : "gf-sensor-initial",
    responses,
  );

  const totalScore = responses.reduce(
    (sum, response) => sum + scoreWorkbookSensorResponse(response),
    0,
  );
  const completion = Math.round(
    (responses.filter((response) => response.trim().length > 0).length / responses.length) * 100,
  );

  const submit = (intent: "draft" | "publish") =>
    handleSubmit((data) => {
      setMessage(null);
      setError(null);

      startTransition(async () => {
        const result = await saveSensorWorkbookAction({
          slug: module.slug,
          intent,
          responses: data.responses,
        });

        if (!result.success) {
          setError(result.message);
          return;
        }

        const savedResponses =
          (result.module?.details as SensorWorkbookDetails | undefined)?.responses ?? data.responses;
        reset({ responses: savedResponses });
        setMessage(result.message);
      });
    });

  return (
    <section className="space-y-6">
      <div className="surface-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{module.title}</h2>
            <p className="mt-1 text-sm text-muted">
              {t("sensor.note")}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 px-4 py-3 text-sm text-foreground">
            <div>
              <span className="font-semibold text-muted">{t("sensor.completion")}:</span> {completion}%
            </div>
            <div>
              <span className="font-semibold text-muted">{t("sensor.total_score")}:</span> {totalScore}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-semibold">Preenchimento: startup | Revisão: mentor | Cálculo: automático</p>
          <p className="mt-1 text-xs leading-5 text-blue-800">
            O dono da startup preenche os selects. O mentor revisa e comenta. O score é calculado automaticamente.
          </p>
        </div>

        {!canEdit ? (
          <p className="mt-4 rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-500 font-medium">
            {t("sensor.read_only_mentor")}
          </p>
        ) : null}

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full overflow-hidden rounded-2xl border border-border bg-card text-sm">
            <thead className="bg-muted/5">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-muted">{t("sensor.q")}</th>
                <th className="px-4 py-3 text-left font-semibold text-muted">{t("sensor.selection")}</th>
                <th className="px-4 py-3 text-left font-semibold text-muted">{t("sensor.score")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {workbookSheet.rows.map((row, index) => {
                const selectCell = row.cells.find((cell) => cell.kind === "select");
                const formulaCell = row.cells.find((cell) => cell.kind === "formula");
                const currentResponse = responses[index] ?? "";
                const score = Number(formulaCell?.value ?? scoreWorkbookSensorResponse(currentResponse));

                return (
                  <tr key={row.title}>
                    <td className="px-4 py-3 align-top font-medium text-foreground">
                      <div className="max-w-xl">
                        <p>
                          {index + 1}. {row.title}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top min-w-[200px]">
                      <Controller
                        control={control}
                        name={`responses.${index}`}
                        render={({ field }) => (
                          <WorkbookCellField
                            label={selectCell?.label ?? t("sensor.selection")}
                            kind="select"
                            value={field.value ?? currentResponse ?? ""}
                            options={selectCell?.options ?? []}
                            disabled={!canEdit || isPending}
                            onChange={(nextValue) => field.onChange(String(nextValue))}
                          />
                        )}
                      />
                    </td>
                    <td className="px-4 py-3 align-top min-w-[120px]">
                      <div className="space-y-2">
                        <WorkbookCellField
                          label={formulaCell?.label ?? t("sensor.score")}
                          kind="formula"
                          value={score}
                          readOnlyHint={formulaCell?.hint ?? t("sensor.calculated")}
                        />
                        <div className="inline-flex rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-semibold text-foreground">
                          {score >= 4 ? "Forte" : score === 3 ? "Em evolução" : "Crítico"}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={isPending || !canEdit}
            onClick={submit("draft")}
            className="rounded-xl border border-border bg-card px-5 py-3 font-semibold text-foreground transition hover:border-brand disabled:opacity-60"
          >
            {isPending ? t("common.loading") : canEdit ? t("common.save_draft") : "Read Only"}
          </button>
          <button
            type="button"
            disabled={isPending || !canEdit}
            onClick={submit("publish")}
            className="rounded-xl bg-brand px-5 py-3 font-semibold text-brand-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {isPending ? t("common.loading") : canEdit ? t("common.publish_module") : "Read Only"}
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
