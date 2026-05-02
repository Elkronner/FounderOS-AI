import { MentorPageClient } from "@/components/mentor-page-client";
import { buildAdvisorSummary } from "@/lib/advisor";
import { requireAuthenticatedSession } from "@/lib/auth";
import { getStudioSummary, readGameformSnapshot } from "@/lib/gameform-store";

export default async function MentorPage() {
  await requireAuthenticatedSession();

  const snapshot = await readGameformSnapshot();
  const summary = getStudioSummary(snapshot);
  const advisor = buildAdvisorSummary(snapshot);

  return (
    <MentorPageClient 
      snapshot={snapshot}
      summary={summary}
      advisor={advisor}
    />
  );
}
