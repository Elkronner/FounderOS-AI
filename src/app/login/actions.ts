"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { z } from "zod";

import { getRoleLanding } from "@/lib/gameform-data";
import { isSupabaseConfigured } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

const validRoles: Role[] = ["founder", "member", "mentor", "admin"];

function resolveRole(value: unknown, fallback: Role = "member"): Role {
  if (typeof value === "string" && validRoles.includes(value as Role)) {
    return value as Role;
  }

  return fallback;
}

const loginSchema = z.object({
  email: z.email("Informe um email valido."),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
  role: z.enum(["founder", "member", "mentor", "admin"]).optional(),
});

export type AuthFormState = {
  error?: string;
  success?: string;
};

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const payload = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!payload.success) {
    return { error: payload.error.issues[0]?.message };
  }

  const cookieStore = await cookies();
  const selectedDemoRole = resolveRole(payload.data.role, "founder");
  const supabaseEnabled = isSupabaseConfigured();

  const supabase = await createServerSupabaseClient();

  if (!supabaseEnabled || !supabase) {
    cookieStore.set("gameform-demo-role", selectedDemoRole, { path: "/" });
    redirect(getRoleLanding(selectedDemoRole));
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.data.email,
    password: payload.data.password,
  });

  if (error) {
    return { error: "Nao foi possivel autenticar. Confira email e senha." };
  }

  cookieStore.delete("gameform-demo-role");

  const fallbackRole = resolveRole(data.user?.user_metadata?.app_role, "member");

  const { data: appUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", data.user?.id ?? "")
    .maybeSingle();

  const resolvedRole = resolveRole(appUser?.role, fallbackRole);
  redirect(getRoleLanding(resolvedRole));
}

export async function resetPasswordAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = z
    .email("Informe um email valido.")
    .safeParse(formData.get("resetEmail"));

  if (!email.success) {
    return { error: email.error.issues[0]?.message };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      success:
        "Ambiente em modo demo. Configure o Supabase para ativar a recuperacao real de senha.",
    };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/login`,
  });

  if (error) {
    return { error: "Nao foi possivel enviar o email de recuperacao neste momento." };
  }

  return { success: "Enviamos um link de recuperacao para o email informado." };
}
