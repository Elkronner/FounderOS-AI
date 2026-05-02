import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getRoleLanding } from "@/lib/gameform-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/types";

const roleValues: Role[] = ["founder", "member", "mentor", "admin"];

function parseRole(value: unknown, fallback: Role = "member"): Role {
  if (typeof value === "string" && roleValues.includes(value as Role)) {
    return value as Role;
  }

  return fallback;
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export const getSessionRole = cache(async (): Promise<Role | null> => {
  if (!isSupabaseConfigured()) {
    const cookieStore = await cookies();
    const demoRole = cookieStore.get("gameform-demo-role")?.value;
    return parseRole(demoRole, "founder");
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: appUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return parseRole(appUser?.role, parseRole(user.user_metadata?.app_role, "member"));
});

export const getDemoRole = cache(async (): Promise<Role> => {
  return (await getSessionRole()) ?? "founder";
});

export const requireAuthenticatedSession = cache(async (): Promise<Role> => {
  const role = await getSessionRole();

  if (!role) {
    redirect("/login");
  }

  return role;
});

export async function requireRole(allowedRoles: Role[]) {
  const role = await requireAuthenticatedSession();

  if (!allowedRoles.includes(role)) {
    redirect(getRoleLanding(role));
  }

  return role;
}
