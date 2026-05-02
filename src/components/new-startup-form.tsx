"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { saveStartupAction } from "@/app/app/actions";
import type { StartupRecord } from "@/lib/types";

const startupSchema = z.object({
  studioName: z.string().min(3, "Informe o nome do estudio."),
  legalName: z.string().min(3, "Informe a razao social."),
  email: z.string().email("Informe um email valido."),
  cohort: z.string().min(2, "Informe a cohort."),
  mentor: z.string().min(3, "Informe o mentor responsavel."),
});

type StartupFormValues = z.infer<typeof startupSchema>;

export function NewStartupForm({ startup }: { startup: StartupRecord }) {
  const [message, setMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StartupFormValues>({
    resolver: zodResolver(startupSchema),
    defaultValues: {
      studioName: startup.studioName,
      legalName: startup.legalName,
      email: startup.email,
      cohort: startup.cohort,
      mentor: startup.mentor,
    },
  });

  const submit = handleSubmit((values) => {
    setActionError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await saveStartupAction(values);

      if (!result.success) {
        setActionError(result.message);
        return;
      }

      if (result.startup) {
        reset({
          studioName: result.startup.studioName,
          legalName: result.startup.legalName,
          email: result.startup.email,
          cohort: result.startup.cohort,
          mentor: result.startup.mentor,
        });
      }

      setMessage(result.message);
    });
  });

  return (
    <form
      onSubmit={submit}
      className="glass-panel grid gap-5 rounded-[2rem] p-6 md:grid-cols-2"
    >
      {[
        ["studioName", "Nome fantasia"],
        ["legalName", "Razao social"],
        ["email", "Email principal"],
        ["cohort", "Cohort"],
        ["mentor", "Mentor responsavel"],
      ].map(([name, label]) => (
        <div key={name} className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">{label}</label>
          <input
            {...register(name as keyof StartupFormValues)}
            disabled={isPending}
            className="w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 outline-none"
          />
          {errors[name as keyof StartupFormValues] ? (
            <p className="text-sm text-rose-600">
              {errors[name as keyof StartupFormValues]?.message}
            </p>
          ) : null}
        </div>
      ))}

      <div className="md:col-span-2 space-y-3">
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
      </div>

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {isPending ? "Salvando cadastro..." : "Salvar startup"}
        </button>
      </div>
    </form>
  );
}
