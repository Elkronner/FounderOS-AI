"use client";

import type { ActivityLog, Role } from "@/lib/types";

const STORAGE_KEY = "gameform-local-activity-logs";

type ActivityEventPayload = {
  actor: string;
  role: Role;
  action: string;
  target: string;
};

export function readLocalActivityLogs(): ActivityLog[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as ActivityLog[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function pushLocalActivityLog(payload: ActivityEventPayload) {
  if (typeof window === "undefined") {
    return;
  }

  const logs = readLocalActivityLogs();
  const now = new Date();
  const item: ActivityLog = {
    id: `local-${now.getTime()}`,
    actor: payload.actor,
    role: payload.role,
    action: payload.action,
    target: payload.target,
    when: now.toLocaleString("pt-BR"),
  };

  const next = [item, ...logs].slice(0, 80);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("gameform-activity-updated"));
}
