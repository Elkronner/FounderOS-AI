"use client";

import type { CommentThread, Role } from "@/lib/types";

const STORAGE_KEY = "gameform-local-module-comments";

type NewCommentPayload = {
  moduleSlug: string;
  message: string;
  author: string;
  role: Role;
};

export function readLocalComments(): CommentThread[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as CommentThread[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function pushLocalComment(payload: NewCommentPayload) {
  if (typeof window === "undefined") {
    return;
  }

  const comments = readLocalComments();
  const now = new Date();
  const item: CommentThread = {
    id: `local-comment-${now.getTime()}`,
    author: payload.author,
    role: payload.role,
    moduleSlug: payload.moduleSlug,
    message: payload.message,
    createdAt: now.toLocaleString("pt-BR"),
  };

  const next = [item, ...comments].slice(0, 120);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("gameform-comments-updated"));
}
