"use client";

import { useEffect, useState, useTransition } from "react";

import { createModuleCommentAction } from "@/app/app/actions";
import { roles } from "@/lib/gameform-data";
import type { CommentThread, Role } from "@/lib/types";

import { useSettings } from "@/components/providers/settings-provider";

export function ModuleComments({
  moduleSlug,
  comments,
  actorRole,
}: {
  moduleSlug: string;
  comments: CommentThread[];
  actorRole: Role;
}) {
  const { t } = useSettings();
  const [commentList, setCommentList] = useState<CommentThread[]>(comments);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setCommentList(comments);
  }, [comments]);

  const submit = () => {
    setError(null);
    setFeedback(null);

    startTransition(async () => {
      const result = await createModuleCommentAction({
        moduleSlug,
        message,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      if (result.comment) {
        const createdComment = result.comment;
        setCommentList((current) => [createdComment, ...current]);
      }
      setMessage("");
      setFeedback(result.message);
    });
  };

  return (
    <div className="space-y-4">
      <textarea
        rows={4}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        disabled={isPending}
        placeholder={t("mentor.composer_placeholder")}
        className="w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition focus:ring-2 focus:ring-brand/20"
      />
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={isPending}
          className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {isPending
            ? t("common.loading")
            : actorRole === "admin"
              ? t("mentor.reply_as_osten")
              : actorRole === "mentor"
                ? t("mentor.reply_as_mentor")
                : t("mentor.reply_as_company")}
        </button>
        <p className="rounded-xl bg-muted/5 px-4 py-2 text-sm text-muted">
          {t("mentor.audit_trail_note")}
        </p>
      </div>
      {error ? (
        <p className="rounded-xl bg-rose-500/10 px-4 py-2 text-sm text-rose-500">
          {error}
        </p>
      ) : null}
      {feedback ? (
        <p className="rounded-xl bg-emerald-500/10 px-4 py-2 text-sm text-emerald-500">
          {feedback}
        </p>
      ) : null}

      <div className="space-y-4">
        {commentList.length === 0 ? (
          <div className="soft-panel border-dashed p-6 text-center">
            <p className="text-sm text-muted">
              {t("mentor.empty_conversation")}
            </p>
          </div>
        ) : null}
        {commentList.map((comment) => (
          <div key={comment.id} className="soft-panel p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-foreground">{comment.author}</p>
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${roles[comment.role].accent}`}
              >
                {roles[comment.role].label}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-foreground/80">{comment.message}</p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted">
              {comment.createdAt}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
