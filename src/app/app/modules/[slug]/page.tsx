import { notFound } from "next/navigation";
import { ModulePageClient } from "@/components/module-page-client";
import { Finance24mForm } from "@/components/finance-24m-form";
import { ModuleComments } from "@/components/module-comments";
import { ModuleForm } from "@/components/module-form";
import { CriticalModuleForm } from "@/components/critical-module-form";
import { SensorWorkbookForm } from "@/components/sensor-workbook-form";
import { WorkbookContractPanel } from "@/components/workbook-contract-panel";
import { requireAuthenticatedSession } from "@/lib/auth";
import { readGameformSnapshot } from "@/lib/gameform-store";
import { getWorkbookContract } from "@/lib/workbook-methodology";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const role = await requireAuthenticatedSession();
  const snapshot = await readGameformSnapshot();
  const moduleItem = snapshot.modules.find((item) => item.slug === slug);

  if (!moduleItem) {
    notFound();
  }

  const workbookContract = getWorkbookContract(slug);

  if (!workbookContract) {
    notFound();
  }

  const moduleComments = snapshot.comments.filter((comment) => comment.moduleSlug === slug);

  return (
    <ModulePageClient
      moduleItem={moduleItem!}
      moduleStatus={moduleItem!.status}
      formContent={
        moduleItem!.slug === "finance-24m" ? (
          <Finance24mForm
            module={moduleItem!}
            monthlyRows={snapshot.finance24m}
            actorRole={role}
          />
        ) : moduleItem!.slug === "gf-sensor-initial" || moduleItem!.slug === "gf-sensor-current" ? (
          <SensorWorkbookForm module={moduleItem!} actorRole={role} />
        ) : ["company-info", "pricing", "product-info", "fundraising"].includes(
            moduleItem!.slug,
          ) ? (
          <CriticalModuleForm module={moduleItem!} actorRole={role} />
        ) : (
          <ModuleForm module={moduleItem!} actorRole={role} />
        )
      }
      conversationContent={
        <ModuleComments moduleSlug={slug} comments={moduleComments} actorRole={role} />
      }
      auditContent={<WorkbookContractPanel module={moduleItem!} contract={workbookContract!} />}
    />
  );
}
