import "server-only";

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import {
  activityLogs as seedActivityLogs,
  buildStudioSummary,
  comments as seedComments,
  finance24m as seedFinance24m,
  finance5y as seedFinance5y,
  getModuleBySlug,
  modules as seedModules,
  roadmapItems as seedRoadmapItems,
  seedStartup,
} from "./gameform-data";
import type {
  ActivityLog,
  CompanyInfoDetails,
  CommentThread,
  Finance24mDetails,
  Finance5yPoint,
  GameformSnapshot,
  FundingDetails,
  RevenuePoint,
  ModuleDefinition,
  ModuleFormData,
  ModuleStatus,
  PricingDetails,
  ProductInfoDetails,
  Role,
  StartupRecord,
  StudioSummary,
  SensorWorkbookDetails,
} from "./types";
import { average } from "./utils";
import {
  calculateCompanyInfo,
  calculateFunding,
  calculatePricing,
  calculateProductInfo,
  criticalModuleSlugs,
  companyInfoDefaults,
  fundingDefaults,
  pricingDefaults,
  productInfoDefaults,
} from "./critical-module-data";
import {
  buildSensorComparisonFromResponses,
  buildWorkbookSensorResponses,
  scoreWorkbookSensorResponse,
} from "./workbook-model";
import { createSupabaseServiceClient } from "./supabase/admin";

const storeFilePath = path.join(process.cwd(), "data", "gameform-store.json");
const snapshotOrganizationId = "11111111-1111-1111-1111-111111111111";
const snapshotTableName = "gameform_snapshots";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeRevenueSeries(
  rawSeries: unknown,
  seedSeries: RevenuePoint[],
): RevenuePoint[] {
  if (!Array.isArray(rawSeries)) {
    return clone(seedSeries);
  }

  return seedSeries.map((seedPoint, index) => {
    const rawPoint =
      rawSeries[index] && typeof rawSeries[index] === "object"
        ? (rawSeries[index] as Partial<RevenuePoint>)
        : undefined;

    return {
      month:
        typeof rawPoint?.month === "string" && rawPoint.month.trim().length > 0
          ? rawPoint.month.trim()
          : seedPoint.month,
      receita:
        typeof rawPoint?.receita === "number" && Number.isFinite(rawPoint.receita)
          ? rawPoint.receita
          : seedPoint.receita,
      custos:
        typeof rawPoint?.custos === "number" && Number.isFinite(rawPoint.custos)
          ? rawPoint.custos
          : seedPoint.custos,
      caixa:
        typeof rawPoint?.caixa === "number" && Number.isFinite(rawPoint.caixa)
          ? rawPoint.caixa
          : seedPoint.caixa,
    };
  });
}

function normalizeFinance5ySeries(
  rawSeries: unknown,
  seedSeries: Finance5yPoint[],
): Finance5yPoint[] {
  if (!Array.isArray(rawSeries)) {
    return clone(seedSeries);
  }

  return seedSeries.map((seedPoint, index) => {
    const rawPoint =
      rawSeries[index] && typeof rawSeries[index] === "object"
        ? (rawSeries[index] as Partial<Finance5yPoint>)
        : undefined;

    return {
      year:
        typeof rawPoint?.year === "string" && rawPoint.year.trim().length > 0
          ? rawPoint.year.trim()
          : seedPoint.year,
      receita:
        typeof rawPoint?.receita === "number" && Number.isFinite(rawPoint.receita)
          ? rawPoint.receita
          : seedPoint.receita,
      lucroLiquido:
        typeof rawPoint?.lucroLiquido === "number" && Number.isFinite(rawPoint.lucroLiquido)
          ? rawPoint.lucroLiquido
          : seedPoint.lucroLiquido,
      caixa:
        typeof rawPoint?.caixa === "number" && Number.isFinite(rawPoint.caixa)
          ? rawPoint.caixa
          : seedPoint.caixa,
    };
  });
}

function normalizeSensorResponses(
  rawResponses: unknown,
  seedResponses: string[],
) {
  if (!Array.isArray(rawResponses) || rawResponses.length === 0) {
    return seedResponses;
  }

  return seedResponses.map((seedResponse, index) => {
    const raw = rawResponses[index];
    return typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : seedResponse;
  });
}

function getSensorComparisonFromSnapshot(snapshot: GameformSnapshot) {
  const seedResponses = buildWorkbookSensorResponses();
  const initialModule = snapshot.modules.find((module) => module.slug === "gf-sensor-initial");
  const currentModule = snapshot.modules.find((module) => module.slug === "gf-sensor-current");
  const initialDetails = initialModule?.details as SensorWorkbookDetails | undefined;
  const currentDetails = currentModule?.details as SensorWorkbookDetails | undefined;

  const initialResponses = normalizeSensorResponses(
    initialDetails?.responses,
    seedResponses.initial,
  );
  const currentResponses = normalizeSensorResponses(
    currentDetails?.responses,
    seedResponses.current,
  );

  return buildSensorComparisonFromResponses(initialResponses, currentResponses);
}

function nowIso() {
  return new Date().toISOString();
}

function formatLogWhen(timestamp: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function hasSupabaseStore() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function getActorLabel(role: Role, startup: StartupRecord) {
  if (role === "admin") {
    return "Osten Games";
  }

  if (role === "mentor") {
    return startup.mentor;
  }

  return startup.studioName;
}

function createSeedSnapshot(): GameformSnapshot {
  const workbookSensorResponses = buildWorkbookSensorResponses();
  return {
    startup: clone(seedStartup),
    modules: clone(seedModules),
    sensorComparison: buildSensorComparisonFromResponses(
      workbookSensorResponses.initial,
      workbookSensorResponses.current,
    ),
    finance24m: clone(seedFinance24m),
    finance5y: clone(seedFinance5y),
    roadmapItems: clone(seedRoadmapItems),
    comments: clone(seedComments),
    activityLogs: clone(seedActivityLogs),
    lastUpdatedAt: nowIso(),
  };
}

type GameformSnapshotRow = {
  organization_id: string;
  snapshot: unknown;
  updated_at: string;
};

async function readSnapshotFromSupabase(): Promise<Partial<GameformSnapshot> | null> {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from(snapshotTableName)
    .select("snapshot")
    .eq("organization_id", snapshotOrganizationId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.snapshot as Partial<GameformSnapshot>;
}

async function writeSnapshotToSupabase(snapshot: GameformSnapshot) {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return false;
  }

  const payload: GameformSnapshotRow = {
    organization_id: snapshotOrganizationId,
    snapshot,
    updated_at: snapshot.lastUpdatedAt,
  };

  const { error } = await supabase.from(snapshotTableName).upsert(payload, {
    onConflict: "organization_id",
  });

  if (error) {
    throw new Error(`Nao foi possivel salvar no Supabase: ${error.message}`);
  }

  return true;
}

function mergeModules(rawModules: unknown): ModuleDefinition[] {
  const baseModules = clone(seedModules);

  if (!Array.isArray(rawModules)) {
    return baseModules;
  }

  return baseModules.map((baseModule) => {
    const storedModule = rawModules.find(
      (candidate) =>
        typeof candidate === "object" &&
        candidate !== null &&
        "slug" in candidate &&
        (candidate as { slug: string }).slug === baseModule.slug,
    ) as Partial<ModuleDefinition> | undefined;

    if (!storedModule) {
      return baseModule;
    }

    return {
      ...baseModule,
      ...storedModule,
      form: {
        ...baseModule.form,
        ...(storedModule.form ?? {}),
      },
    };
  });
}

function normalizeSnapshot(rawSnapshot?: Partial<GameformSnapshot>): GameformSnapshot {
  const baseSnapshot = createSeedSnapshot();

  if (!rawSnapshot) {
    return recalculateSnapshot(baseSnapshot);
  }

  const modules = mergeModules(rawSnapshot.modules);
  const startup = {
    ...baseSnapshot.startup,
    ...(rawSnapshot.startup ?? {}),
  };
  const comments = Array.isArray(rawSnapshot.comments)
    ? (rawSnapshot.comments as CommentThread[])
    : baseSnapshot.comments;
  const activityLogs = Array.isArray(rawSnapshot.activityLogs)
    ? (rawSnapshot.activityLogs as ActivityLog[])
    : baseSnapshot.activityLogs;
  const roadmapItems = Array.isArray(rawSnapshot.roadmapItems)
    ? (rawSnapshot.roadmapItems as GameformSnapshot["roadmapItems"])
    : baseSnapshot.roadmapItems;
  const finance24m = normalizeRevenueSeries(rawSnapshot.finance24m, baseSnapshot.finance24m);
  const finance5y = normalizeFinance5ySeries(rawSnapshot.finance5y, baseSnapshot.finance5y);
  const snapshot: GameformSnapshot = {
    ...baseSnapshot,
    ...rawSnapshot,
    startup,
    modules,
    comments,
    activityLogs,
    sensorComparison: getSensorComparisonFromSnapshot({
      ...baseSnapshot,
      ...rawSnapshot,
      startup,
      modules,
      comments,
      activityLogs,
      roadmapItems,
      finance24m,
      finance5y,
      sensorComparison: baseSnapshot.sensorComparison,
      lastUpdatedAt:
        typeof rawSnapshot.lastUpdatedAt === "string"
          ? rawSnapshot.lastUpdatedAt
          : baseSnapshot.lastUpdatedAt,
    }),
    finance24m,
    finance5y,
    roadmapItems,
    lastUpdatedAt:
      typeof rawSnapshot.lastUpdatedAt === "string"
        ? rawSnapshot.lastUpdatedAt
        : baseSnapshot.lastUpdatedAt,
  };

  return recalculateSnapshot(snapshot, { touchTimestamp: false });
}

function computeTextQuality(form: Record<string, unknown>) {
  const lengths = Object.values(form)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim().length);

  if (!lengths.length) {
    return 0;
  }

  return Math.round(
    average(lengths.map((length) => Math.max(18, Math.min(100, length * 2)))),
  );
}

function computeFinanceProgress(monthly: RevenuePoint[], formQuality: number) {
  if (!monthly.length) {
    return formQuality;
  }

  const filledCells = monthly.reduce((total, row) => {
    return (
      total +
      [row.receita, row.custos, row.caixa].filter(
        (value) => typeof value === "number" && Number.isFinite(value),
      ).length
    );
  }, 0);

  const numericProgress = Math.round((filledCells / (monthly.length * 3)) * 100);
  return Math.round(average([numericProgress, formQuality]));
}

function normalizeFinanceMonthly(
  monthly: RevenuePoint[],
  openingCash: number,
): RevenuePoint[] {
  let runningCash = Number.isFinite(openingCash) ? openingCash : 0;

  return monthly.map((row, index) => {
    const receita = Number.isFinite(row.receita) ? row.receita : 0;
    const custos = Number.isFinite(row.custos) ? row.custos : 0;
    runningCash = index === 0 ? runningCash + receita - custos : runningCash + receita - custos;

    return {
      month: row.month,
      receita,
      custos,
      caixa: runningCash,
    };
  });
}

function computeModuleStatus(progress: number, intent: "draft" | "publish"): ModuleStatus {
  if (intent === "publish" && progress >= 85) {
    return "concluido";
  }

  if (progress >= 40) {
    return "em_andamento";
  }

  return "nao_iniciado";
}

function getRoadmapStatus(completion: number): "planejado" | "em_execucao" | "entregue" {
  if (completion >= 85) {
    return "entregue";
  }

  if (completion >= 45) {
    return "em_execucao";
  }

  return "planejado";
}

function calculateCriticalModulePayload(
  slug: (typeof criticalModuleSlugs)[number],
  details:
    | typeof companyInfoDefaults
    | typeof pricingDefaults
    | typeof productInfoDefaults
    | typeof fundingDefaults,
) {
  switch (slug) {
    case "company-info":
      return calculateCompanyInfo(details as CompanyInfoDetails);
    case "pricing":
      return calculatePricing(details as PricingDetails);
    case "product-info":
      return calculateProductInfo(details as ProductInfoDetails);
    case "fundraising":
      return calculateFunding(details as FundingDetails);
    default:
      return calculateCompanyInfo(companyInfoDefaults);
  }
}
function recalculateSnapshot(
  snapshot: GameformSnapshot,
  options: { touchTimestamp?: boolean } = {},
): GameformSnapshot {
  const pricingProgress = getModuleBySlug("pricing", snapshot.modules)?.progress ?? 0;
  const finance24Progress = getModuleBySlug("finance-24m", snapshot.modules)?.progress ?? 0;
  const finance5Progress = getModuleBySlug("finance-5y", snapshot.modules)?.progress ?? 0;
  const fundraisingMaturity = getModuleBySlug("fundraising", snapshot.modules)?.maturity ?? 0;
  const milestonesProgress = getModuleBySlug("milestones", snapshot.modules)?.progress ?? 0;
  const competenciesProgress = getModuleBySlug("competencies", snapshot.modules)?.progress ?? 0;

  const productCompletion = getModuleBySlug("product-info", snapshot.modules)?.progress ?? 0;
  const pitchCompletion = getModuleBySlug("pitch-script", snapshot.modules)?.progress ?? 0;
  const ganttCompletion = getModuleBySlug("gantt-items", snapshot.modules)?.progress ?? 0;

  snapshot.roadmapItems = [
    {
      id: "r1",
      title: "Vertical slice + UX onboarding",
      owner: "Produto",
      quarter: "Q2 2026",
      completion: Math.round(average([productCompletion, milestonesProgress])),
      status: getRoadmapStatus(Math.round(average([productCompletion, milestonesProgress]))),
    },
    {
      id: "r2",
      title: "Alpha fechado com 300 jogadores",
      owner: "Growth",
      quarter: "Q3 2026",
      completion: Math.round(average([ganttCompletion, finance24Progress, competenciesProgress])),
      status: getRoadmapStatus(
        Math.round(average([ganttCompletion, finance24Progress, competenciesProgress])),
      ),
    },
    {
      id: "r3",
      title: "Preparacao de rodada seed",
      owner: "Founders",
      quarter: "Q3 2026",
      completion: Math.round(average([fundraisingMaturity, pitchCompletion])),
      status: getRoadmapStatus(Math.round(average([fundraisingMaturity, pitchCompletion]))),
    },
    {
      id: "r4",
      title: "Soft launch regional",
      owner: "Publishing",
      quarter: "Q4 2026",
      completion: Math.round(average([pricingProgress, finance5Progress, productCompletion])),
      status: getRoadmapStatus(
        Math.round(average([pricingProgress, finance5Progress, productCompletion])),
      ),
    },
  ];

  if (options.touchTimestamp ?? true) {
    snapshot.lastUpdatedAt = nowIso();
  }

  return snapshot;
}

async function ensureLocalStoreFile() {
  await fs.mkdir(path.dirname(storeFilePath), { recursive: true });

  try {
    await fs.access(storeFilePath);
  } catch {
    const snapshot = createSeedSnapshot();
    await fs.writeFile(storeFilePath, JSON.stringify(snapshot, null, 2), "utf8");
  }
}

async function writeSnapshot(snapshot: GameformSnapshot) {
  if (hasSupabaseStore()) {
    try {
      await writeSnapshotToSupabase(snapshot);
      return;
    } catch {
      // Fall back to local storage if Supabase is temporarily unavailable.
    }
  }

  await ensureLocalStoreFile();
  await fs.writeFile(storeFilePath, JSON.stringify(snapshot, null, 2), "utf8");
}

export async function readGameformSnapshot() {
  if (hasSupabaseStore()) {
    try {
      const snapshot = await readSnapshotFromSupabase();

      if (snapshot) {
        return normalizeSnapshot(snapshot);
      }

      const seedSnapshot = normalizeSnapshot();
      await writeSnapshotToSupabase(seedSnapshot);
      return seedSnapshot;
    } catch {
      // Fall back to the file store if Supabase is not reachable.
    }
  }

  await ensureLocalStoreFile();

  try {
    const fileContent = await fs.readFile(storeFilePath, "utf8");
    const parsed = JSON.parse(fileContent) as Partial<GameformSnapshot>;
    return normalizeSnapshot(parsed);
  } catch {
    const snapshot = normalizeSnapshot();
    await writeSnapshot(snapshot);
    return snapshot;
  }
}

export function getStudioSummary(snapshot: GameformSnapshot): StudioSummary {
  return buildStudioSummary(snapshot.startup, snapshot.modules);
}
export async function saveModuleRecord({
  slug,
  form,
  role,
  intent,
}: {
  slug: string;
  form: ModuleFormData;
  role: Role;
  intent: "draft" | "publish";
}) {
  const snapshot = await readGameformSnapshot();
  const moduleIndex = snapshot.modules.findIndex((item) => item.slug === slug);

  if (moduleIndex === -1) {
    throw new Error("Modulo nao encontrado.");
  }

  const currentModule = snapshot.modules[moduleIndex];
  const filledFields = Object.values(form).filter((value) => value.trim().length >= 10).length;
  const textQuality = computeTextQuality(form);
  const progress = Math.round((filledFields / 5) * 70 + textQuality * 0.3);
  const maturity = Math.round(
    Math.min(100, average([progress, textQuality, currentModule.maturity])),
  );
  const status = computeModuleStatus(progress, intent);

  const updatedModule: ModuleDefinition = {
    ...currentModule,
    form,
    progress,
    maturity,
    status,
    nextAction: form.nextStep,
  };

  snapshot.modules[moduleIndex] = updatedModule;
  const timestamp = nowIso();

  snapshot.activityLogs.unshift({
    id: randomUUID(),
    actor: getActorLabel(role, snapshot.startup),
    role,
    action: intent === "draft" ? "Salvou rascunho" : "Publicou",
    target: updatedModule.title,
    when: formatLogWhen(timestamp),
  });
  snapshot.activityLogs = snapshot.activityLogs.slice(0, 50);

  const recalculatedSnapshot = recalculateSnapshot(snapshot);
  await writeSnapshot(recalculatedSnapshot);

  return updatedModule;
}

export async function saveCommentRecord({
  moduleSlug,
  message,
  role,
}: {
  moduleSlug: string;
  message: string;
  role: Role;
}) {
  const snapshot = await readGameformSnapshot();
  const timestamp = nowIso();
  const author = getActorLabel(role, snapshot.startup);

  const comment: CommentThread = {
    id: randomUUID(),
    author,
    role,
    moduleSlug,
    message,
    createdAt: formatLogWhen(timestamp),
  };

  snapshot.comments.unshift(comment);
  snapshot.activityLogs.unshift({
    id: randomUUID(),
    actor: author,
    role,
    action: "Comentou",
    target: getModuleBySlug(moduleSlug, snapshot.modules)?.title ?? moduleSlug,
    when: formatLogWhen(timestamp),
  });
  snapshot.activityLogs = snapshot.activityLogs.slice(0, 50);

  const recalculatedSnapshot = recalculateSnapshot(snapshot);
  await writeSnapshot(recalculatedSnapshot);

  return comment;
}

export async function saveStartupRecord({
  values,
  role,
}: {
  values: Pick<StartupRecord, "studioName" | "legalName" | "email" | "cohort" | "mentor">;
  role: Role;
}) {
  const snapshot = await readGameformSnapshot();
  const timestamp = nowIso();

  snapshot.startup = {
    ...snapshot.startup,
    ...values,
    updatedAt: timestamp,
  };

  snapshot.activityLogs.unshift({
    id: randomUUID(),
    actor: getActorLabel(role, snapshot.startup),
    role,
    action: "Atualizou cadastro",
    target: snapshot.startup.studioName,
    when: formatLogWhen(timestamp),
  });
  snapshot.activityLogs = snapshot.activityLogs.slice(0, 50);

  const recalculatedSnapshot = recalculateSnapshot(snapshot);
  await writeSnapshot(recalculatedSnapshot);

  return recalculatedSnapshot.startup;
}

export async function saveCriticalModuleRecord({
  slug,
  details,
  role,
  intent,
}: {
  slug: (typeof criticalModuleSlugs)[number];
  details:
    | typeof companyInfoDefaults
    | typeof pricingDefaults
    | typeof productInfoDefaults
    | typeof fundingDefaults;
  role: Role;
  intent: "draft" | "publish";
}) {
  const snapshot = await readGameformSnapshot();
  const moduleIndex = snapshot.modules.findIndex((item) => item.slug === slug);

  if (moduleIndex === -1) {
    throw new Error("Modulo nao encontrado.");
  }

  const currentModule = snapshot.modules[moduleIndex];
  const payload = calculateCriticalModulePayload(slug, details);
  const status = computeModuleStatus(payload.progress, intent);

  const updatedModule: ModuleDefinition = {
    ...currentModule,
    details,
    form: {
      summary: payload.summary,
      priorities: payload.priorities,
      evidence: payload.evidence,
      risks: payload.risks,
      nextStep: payload.nextStep,
    },
    progress: payload.progress,
    maturity: payload.maturity,
    status,
    nextAction: payload.nextStep,
  };

  snapshot.modules[moduleIndex] = updatedModule;
  const timestamp = nowIso();

  snapshot.activityLogs.unshift({
    id: randomUUID(),
    actor: getActorLabel(role, snapshot.startup),
    role,
    action: intent === "draft" ? "Salvou rascunho estruturado" : "Publicou estruturado",
    target: updatedModule.title,
    when: formatLogWhen(timestamp),
  });
  snapshot.activityLogs = snapshot.activityLogs.slice(0, 50);

  const recalculatedSnapshot = recalculateSnapshot(snapshot);
  await writeSnapshot(recalculatedSnapshot);

  return updatedModule;
}

export async function saveSensorWorkbookRecord({
  slug,
  responses,
  role,
  intent,
}: {
  slug: "gf-sensor-initial" | "gf-sensor-current";
  responses: string[];
  role: Role;
  intent: "draft" | "publish";
}) {
  const snapshot = await readGameformSnapshot();
  const moduleIndex = snapshot.modules.findIndex((item) => item.slug === slug);

  if (moduleIndex === -1) {
    throw new Error("Modulo nao encontrado.");
  }

  const currentModule = snapshot.modules[moduleIndex];
  const selectedResponses = responses.map((response) => response.trim());
  const filled = selectedResponses.filter((response) => response.length > 0).length;
  const scoreAverage =
    selectedResponses.length > 0
      ? Math.round(
          (selectedResponses.reduce((sum, response) => sum + scoreWorkbookSensorResponse(response), 0) /
            selectedResponses.length) * 25,
        )
      : 0;
  const progress = Math.round((filled / Math.max(selectedResponses.length, 1)) * 100);
  const maturity = Math.round(Math.min(100, average([progress, scoreAverage, currentModule.maturity])));
  const status = computeModuleStatus(progress, intent);

  const updatedModule: ModuleDefinition = {
    ...currentModule,
    details: {
      responses: selectedResponses,
    } satisfies SensorWorkbookDetails,
    progress,
    maturity,
    status,
    nextAction: currentModule.nextAction,
  };

  snapshot.modules[moduleIndex] = updatedModule;
  const timestamp = nowIso();

  snapshot.activityLogs.unshift({
    id: randomUUID(),
    actor: getActorLabel(role, snapshot.startup),
    role,
    action: intent === "draft" ? "Salvou sensor" : "Publicou sensor",
    target: updatedModule.title,
    when: formatLogWhen(timestamp),
  });
  snapshot.activityLogs = snapshot.activityLogs.slice(0, 50);

  const allModules = snapshot.modules;
  const initialModule = allModules.find((item) => item.slug === "gf-sensor-initial");
  const currentSensorModule = allModules.find((item) => item.slug === "gf-sensor-current");
  const initialResponses =
    (initialModule?.details as SensorWorkbookDetails | undefined)?.responses ??
    buildWorkbookSensorResponses().initial;
  const currentResponses =
    (currentSensorModule?.details as SensorWorkbookDetails | undefined)?.responses ??
    buildWorkbookSensorResponses().current;
  snapshot.sensorComparison = buildSensorComparisonFromResponses(initialResponses, currentResponses);

  const recalculatedSnapshot = recalculateSnapshot(snapshot);
  await writeSnapshot(recalculatedSnapshot);

  return updatedModule;
}

export async function saveFinance24mRecord({
  form,
  monthly,
  role,
  intent,
}: {
  form: ModuleFormData;
  monthly: RevenuePoint[];
  role: Role;
  intent: "draft" | "publish";
}) {
  const snapshot = await readGameformSnapshot();
  const moduleIndex = snapshot.modules.findIndex((item) => item.slug === "finance-24m");

  if (moduleIndex === -1) {
    throw new Error("Modulo nao encontrado.");
  }

  const currentModule = snapshot.modules[moduleIndex];
  const openingCashSeed =
    snapshot.finance24m.length > 0
      ? snapshot.finance24m[0].caixa - snapshot.finance24m[0].receita + snapshot.finance24m[0].custos
      : 0;
  const normalizedMonthly = normalizeFinanceMonthly(monthly, openingCashSeed);
  const textQuality = computeTextQuality(form);
  const progress = computeFinanceProgress(normalizedMonthly, textQuality);
  const maturity = Math.round(Math.min(100, average([progress, currentModule.maturity, textQuality])));
  const status = computeModuleStatus(progress, intent);

  const updatedModule: ModuleDefinition = {
    ...currentModule,
    form,
    details: {
      ...form,
      monthly: normalizedMonthly,
    } satisfies Finance24mDetails,
    progress,
    maturity,
    status,
    nextAction: form.nextStep,
  };

  snapshot.modules[moduleIndex] = updatedModule;
  snapshot.finance24m = normalizedMonthly;
  const timestamp = nowIso();

  snapshot.activityLogs.unshift({
    id: randomUUID(),
    actor: getActorLabel(role, snapshot.startup),
    role,
    action: intent === "draft" ? "Salvou financeiro 24m" : "Publicou financeiro 24m",
    target: updatedModule.title,
    when: formatLogWhen(timestamp),
  });
  snapshot.activityLogs = snapshot.activityLogs.slice(0, 50);

  const recalculatedSnapshot = recalculateSnapshot(snapshot);
  await writeSnapshot(recalculatedSnapshot);

  return updatedModule;
}
