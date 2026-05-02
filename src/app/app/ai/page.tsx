import { AiAdvisorPanel } from "@/components/ai-advisor-panel";
import { buildAdvisorSummary } from "@/lib/advisor";
import { requireAuthenticatedSession } from "@/lib/auth";
import { readGameformSnapshot } from "@/lib/gameform-store";

export default async function AiAdvisorPage() {
  await requireAuthenticatedSession();

  const snapshot = await readGameformSnapshot();
  const advisor = buildAdvisorSummary(snapshot);

  return <AiAdvisorPanel advisor={advisor} />;
}
