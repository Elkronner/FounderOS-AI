import { requireAuthenticatedSession } from "@/lib/auth";
import { EvaluationSystemDashboard } from "@/components/evaluation-system-dashboard";
import { buildAdvisorSummary } from "@/lib/advisor";
import { getStudioSummary, readGameformSnapshot } from "@/lib/gameform-store";

export default async function DashboardPage() {
  const role = await requireAuthenticatedSession();
  const snapshot = await readGameformSnapshot();
  const summary = getStudioSummary(snapshot);
  const advisor = buildAdvisorSummary(snapshot);

  return (
    <EvaluationSystemDashboard
      role={role}
      modules={snapshot.modules}
      summary={summary}
      advisor={advisor}
      comments={snapshot.comments}
      sensorComparison={snapshot.sensorComparison}
    />
  );
}
