"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { saveModuleAction } from "@/app/app/actions";
import { useSettings } from "@/components/providers/settings-provider";
import type { ModuleDefinition, ModuleFormData, Role } from "@/lib/types";

type ModuleFormValues = ModuleFormData;

export function ModuleForm({
  module,
  actorRole = "founder",
}: {
  module: ModuleDefinition;
  actorRole?: Role;
}) {
  const { t } = useSettings();
  const moduleSchema = z.object({
    summary: z.string().min(10, t("module.validation_summary")),
    priorities: z.string().min(10, t("module.validation_priorities")),
    evidence: z.string().min(10, t("module.validation_evidence")),
    risks: z.string().min(10, t("module.validation_risks")),
    nextStep: z.string().min(10, t("module.validation_next_step")),
  });
  const fields: Array<{ name: keyof ModuleFormData; label: string }> = [
    { name: "summary", label: t("module.form_summary") },
    { name: "priorities", label: t("module.form_priorities") },
    { name: "evidence", label: t("module.form_evidence") },
    { name: "risks", label: t("module.form_risks") },
    { name: "nextStep", label: t("module.form_next_step") },
  ];
  const canEdit = actorRole !== "mentor";
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
    defaultValues: module.form,
  });

  const submit = (intent: "draft" | "publish") =>
    handleSubmit((values) => {
      setMessage(null);
      setActionError(null);
      startTransition(async () => {
        const result = await saveModuleAction({
          slug: module.slug,
          intent,
          values,
        });

        if (!result.success) {
          setActionError(result.message);
          return;
        }

        reset(result.module?.form ?? values);
        setMessage(result.message);
      });
    });

  return (
    <form className="space-y-5">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">{field.label}</label>
          <textarea
            rows={4}
            {...register(field.name)}
            disabled={!canEdit || isPending}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-400"
          />
          {errors[field.name] ? (
            <p className="text-sm text-rose-600">{errors[field.name]?.message}</p>
          ) : null}
        </div>
      ))}

      {!canEdit ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t("module.read_only_mentor")}
        </p>
      ) : null}

      {actionError ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {actionError}
        </p>
      ) : null}

      {message ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={submit("draft")}
          disabled={isPending || !canEdit}
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-60"
        >
          {isPending ? t("module.saving") : t("common.save_draft")}
        </button>
        <button
          type="button"
          onClick={submit("publish")}
          disabled={isPending || !canEdit}
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          {isPending ? t("module.publishing") : t("common.publish_module")}
        </button>
      </div>
    </form>
  );
}
