import type { ReactNode } from "react";

import { requireRole } from "@/lib/auth";

export default async function StartupsLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole(["founder", "member", "admin"]);

  return children;
}
