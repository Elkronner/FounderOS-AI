"use client";

import { useActionState } from "react";

import { LockKeyhole, Mail, Shield } from "lucide-react";

import {
  type AuthFormState,
  loginAction,
  resetPasswordAction,
} from "@/app/login/actions";

const initialState: AuthFormState = {};

export function LoginForm({ demoMode = false }: { demoMode?: boolean }) {
  const [loginState, loginFormAction, loginPending] = useActionState(
    loginAction,
    initialState,
  );
  const [resetState, resetFormAction, resetPending] = useActionState(
    resetPasswordAction,
    initialState,
  );

  return (
    <div className="surface-panel grid overflow-hidden rounded-[2rem] lg:grid-cols-[1.05fr_0.95fr]">
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-white lg:p-10">
        <div className="max-w-md space-y-6">
          <span className="pill border-white/20 bg-white/10 text-blue-100">
            Acesso seguro por perfil
          </span>
          <div>
            <h1 className="font-display text-4xl font-bold">
              Entre no GameForm Growth System
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Fundadores, mentores e equipe Osten Games trabalham no mesmo fluxo,
              com permissões segmentadas e histórico auditável.
            </p>
          </div>
          <div className="space-y-4">
            {[
              "Cada estúdio vê somente seus próprios dados",
              "Mentores acompanham apenas startups atribuídas",
              "Admins Osten Games enxergam a operação completa",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <Shield className="mt-0.5 h-5 w-5 text-teal-300" />
                <p className="text-sm text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8 p-8 lg:p-10">
        <form action={loginFormAction} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                name="email"
                type="email"
                placeholder="voce@studio.com"
                className="w-full bg-transparent outline-none"
                defaultValue="demo@gameform.ai"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Senha</label>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <LockKeyhole className="h-4 w-4 text-slate-400" />
              <input
                name="password"
                type="password"
                placeholder="******"
                className="w-full bg-transparent outline-none"
                defaultValue="123456"
              />
            </div>
          </div>
          {demoMode ? (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Perfil (modo demo)</label>
              <select
                name="role"
                defaultValue="founder"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none"
              >
                <option value="founder">Fundador / equipe do estúdio</option>
                <option value="member">Membro do estúdio</option>
                <option value="mentor">Mentor</option>
                <option value="admin">Admin Osten Games</option>
              </select>
            </div>
          ) : (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              Seu papel de acesso é definido no Supabase Auth e nas permissões internas.
            </div>
          )}
          {loginState.error ? (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {loginState.error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={loginPending}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loginPending ? "Entrando..." : "Acessar painel"}
          </button>
        </form>

        <form action={resetFormAction} className="soft-panel space-y-3 rounded-2xl p-5">
          <div>
            <h2 className="font-semibold text-slate-900">Recuperar senha</h2>
            <p className="mt-1 text-sm text-slate-600">
              Informe o email para receber um link de redefinição.
            </p>
          </div>
          <input
            name="resetEmail"
            type="email"
            placeholder="voce@studio.com"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
          />
          {resetState.error ? (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {resetState.error}
            </p>
          ) : null}
          {resetState.success ? (
            <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {resetState.success}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={resetPending}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-60"
          >
            {resetPending ? "Enviando..." : "Enviar link"}
          </button>
        </form>
      </div>
    </div>
  );
}
