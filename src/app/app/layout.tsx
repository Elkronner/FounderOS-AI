import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { requireAuthenticatedSession } from "@/lib/auth";

export default async function PlatformLayout({
  children,
}: {
  children: ReactNode;
}) {
  const role = await requireAuthenticatedSession();

  return <AppShell role={role}>{children}</AppShell>;
}
