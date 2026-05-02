"use server";

import { z } from "zod";

import { requireAuthenticatedSession } from "@/lib/auth";
import { buildAdvisorPrompt, buildAdvisorSummary } from "@/lib/advisor";
import {
  readGameformSnapshot,
  saveCommentRecord,
  saveFinance24mRecord,
  saveCriticalModuleRecord,
  saveSensorWorkbookRecord,
  saveModuleRecord,
  saveStartupRecord,
} from "@/lib/gameform-store";
import type { RevenuePoint } from "@/lib/types";

const moduleSchema = z.object({
  summary: z.string().min(10, "Descreva um resumo com pelo menos 10 caracteres."),
  priorities: z.string().min(10, "Liste prioridades com pelo menos 10 caracteres."),
  evidence: z.string().min(10, "Registre evidencias com pelo menos 10 caracteres."),
  risks: z.string().min(10, "Descreva riscos com pelo menos 10 caracteres."),
  nextStep: z.string().min(10, "Defina o proximo passo com pelo menos 10 caracteres."),
});

const saveModuleInputSchema = z.object({
  slug: z.string().min(1),
  intent: z.enum(["draft", "publish"]),
  values: moduleSchema,
});

const commentInputSchema = z.object({
  moduleSlug: z.string().min(1),
  message: z.string().min(10, "Escreva pelo menos 10 caracteres."),
});

const startupInputSchema = z.object({
  studioName: z.string().min(3, "Informe o nome do estudio."),
  legalName: z.string().min(3, "Informe a razao social."),
  email: z.string().email("Informe um email valido."),
  cohort: z.string().min(2, "Informe a cohort."),
  mentor: z.string().min(3, "Informe o mentor responsavel."),
});

const companyInfoSchema = z.object({
  companyName: z.string().min(2),
  legalName: z.string().min(2),
  cnpj: z.string().min(8),
  website: z.string().min(4),
  location: z.string().min(2),
  stage: z.string().min(2),
  description: z.string().min(10),
  partners: z.array(
    z.object({
      name: z.string().min(2),
      role: z.string().min(2),
      equityPercent: z.coerce.number().min(0).max(100),
      email: z.string().email(),
      whatsapp: z.string().min(6),
    }),
  ),
});

const pricingSchema = z.object({
  productName: z.string().min(2),
  productType: z.string().min(2),
  directCosts: z.array(
    z.object({
      label: z.string().min(2),
      value: z.coerce.number().min(0),
    }),
  ),
  taxRatePercent: z.coerce.number().min(0).max(100),
  marginPercent: z.coerce.number().min(0).max(100),
  discountPercent: z.coerce.number().min(0).max(100),
  monthlyUnits: z.coerce.number().min(0),
  competitorPriceLow: z.coerce.number().min(0),
  competitorPriceHigh: z.coerce.number().min(0),
  positioning: z.string().min(2),
  idealPriceRange: z.string().min(2),
  cltSalary: z.coerce.number().min(0),
});

const productInfoSchema = z.object({
  taxRegime: z.string().min(2),
  productFamily: z.string().min(2),
  taxProductType: z.string().min(2),
  anexo: z.string().min(2),
  lucroPresumidoPercent: z.coerce.number().min(0).max(1),
  cltSalary: z.coerce.number().min(0),
  cltBenefitsPercent: z.coerce.number().min(0).max(1),
  cltEncargosPercent: z.coerce.number().min(0).max(1),
  products: z.array(
    z.object({
      name: z.string().min(2),
      category: z.string().min(2),
      price: z.coerce.number().min(0),
      quantity: z.coerce.number().min(0),
      pisPercent: z.coerce.number().min(0).max(1),
      cofinsPercent: z.coerce.number().min(0).max(1),
      icmsPercent: z.coerce.number().min(0).max(1),
      issPercent: z.coerce.number().min(0).max(1),
    }),
  ),
});

const fundingSchema = z.object({
  strategy: z.string().min(2),
  targetAmount: z.coerce.number().min(0),
  runwayMonths: z.coerce.number().min(1),
  roundLead: z.string().min(2),
  rounds: z.array(
    z.object({
      roundName: z.string().min(2),
      status: z.string().optional().default(""),
      targetAmount: z.coerce.number().min(0),
      raisedAmount: z.coerce.number().min(0),
      percentRaised: z.coerce.number().min(0).max(1),
      investors: z.coerce.number().min(0),
      equityOfferedPercent: z.coerce.number().min(0).max(100),
      valuation: z.coerce.number().min(0),
    }),
  ),
});

const finance24mSchema = moduleSchema.extend({
  intent: z.enum(["draft", "publish"]),
  monthly: z.array(
    z.object({
      month: z.string().min(1),
      receita: z.coerce.number(),
      custos: z.coerce.number(),
      caixa: z.coerce.number(),
    }),
  ).length(24),
});

const sensorWorkbookSchema = z.object({
  slug: z.enum(["gf-sensor-initial", "gf-sensor-current"]),
  intent: z.enum(["draft", "publish"]),
  responses: z.array(z.string()).length(16),
});

export async function saveModuleAction(input: unknown) {
  const role = await requireAuthenticatedSession();

  if (role === "mentor") {
    return {
      success: false,
      message: "Mentores possuem acesso de leitura neste modulo.",
    };
  }

  const parsed = saveModuleInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Nao foi possivel salvar o modulo.",
    };
  }

  try {
    const savedModule = await saveModuleRecord({
      slug: parsed.data.slug,
      form: parsed.data.values,
      role,
      intent: parsed.data.intent,
    });

    return {
      success: true,
      message:
        parsed.data.intent === "draft"
          ? `Rascunho salvo com sucesso. Progresso atual: ${savedModule.progress}%.`
          : `Modulo publicado com sucesso. Progresso atual: ${savedModule.progress}%.`,
      module: savedModule,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Nao foi possivel salvar o modulo.",
    };
  }
}

export async function createModuleCommentAction(input: unknown) {
  const role = await requireAuthenticatedSession();

  const parsed = commentInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Nao foi possivel registrar o comentario.",
    };
  }

  try {
    const comment = await saveCommentRecord({
      moduleSlug: parsed.data.moduleSlug,
      message: parsed.data.message.trim(),
      role,
    });

    return {
      success: true,
      message: "Comentario registrado com sucesso.",
      comment,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Nao foi possivel registrar o comentario.",
    };
  }
}

export async function saveStartupAction(input: unknown) {
  const role = await requireAuthenticatedSession();

  if (role === "mentor") {
    return {
      success: false,
      message: "Mentores nao podem alterar o cadastro da startup.",
    };
  }

  const parsed = startupInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Nao foi possivel salvar o cadastro.",
    };
  }

  try {
    const startup = await saveStartupRecord({
      values: parsed.data,
      role,
    });

    return {
      success: true,
      message: "Cadastro da startup salvo com sucesso.",
      startup,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Nao foi possivel salvar o cadastro.",
    };
  }
}

export async function saveCompanyInfoAction(input: unknown) {
  const role = await requireAuthenticatedSession();
  if (role === "mentor") {
    return {
      success: false,
      message: "Mentores possuem acesso de leitura neste modulo.",
    };
  }
  const parsed = companyInfoSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Nao foi possivel salvar as informacoes da empresa.",
    };
  }

  try {
    const savedModule = await saveCriticalModuleRecord({
      slug: "company-info",
      details: parsed.data,
      role,
      intent: "publish",
    });

    return {
      success: true,
      message: "Informacoes da empresa atualizadas com calculos estruturados.",
      module: savedModule,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Nao foi possivel salvar as informacoes da empresa.",
    };
  }
}

export async function savePricingAction(input: unknown) {
  const role = await requireAuthenticatedSession();
  if (role === "mentor") {
    return {
      success: false,
      message: "Mentores possuem acesso de leitura neste modulo.",
    };
  }
  const parsed = pricingSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Nao foi possivel salvar a precificacao.",
    };
  }

  try {
    const savedModule = await saveCriticalModuleRecord({
      slug: "pricing",
      details: parsed.data,
      role,
      intent: "publish",
    });

    return {
      success: true,
      message: "Precificacao atualizada com calculos estruturados.",
      module: savedModule,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Nao foi possivel salvar a precificacao.",
    };
  }
}

export async function saveProductInfoAction(input: unknown) {
  const role = await requireAuthenticatedSession();
  if (role === "mentor") {
    return {
      success: false,
      message: "Mentores possuem acesso de leitura neste modulo.",
    };
  }
  const parsed = productInfoSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Nao foi possivel salvar as informacoes do produto.",
    };
  }

  try {
    const savedModule = await saveCriticalModuleRecord({
      slug: "product-info",
      details: parsed.data,
      role,
      intent: "publish",
    });

    return {
      success: true,
      message: "Informacoes do produto atualizadas com calculos estruturados.",
      module: savedModule,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Nao foi possivel salvar as informacoes do produto.",
    };
  }
}

export async function saveFundingAction(input: unknown) {
  const role = await requireAuthenticatedSession();
  if (role === "mentor") {
    return {
      success: false,
      message: "Mentores possuem acesso de leitura neste modulo.",
    };
  }
  const parsed = fundingSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Nao foi possivel salvar a captacao.",
    };
  }

  try {
    const savedModule = await saveCriticalModuleRecord({
      slug: "fundraising",
      details: parsed.data,
      role,
      intent: "publish",
    });

    return {
      success: true,
      message: "Captacao atualizada com calculos estruturados.",
      module: savedModule,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Nao foi possivel salvar a captacao.",
    };
  }
}

export async function saveFinance24mAction(input: unknown) {
  const role = await requireAuthenticatedSession();

  if (role === "mentor") {
    return {
      success: false,
      message: "Mentores possuem acesso de leitura neste modulo.",
    };
  }

  const parsed = finance24mSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Nao foi possivel salvar o financeiro 24m.",
    };
  }

  try {
    const savedModule = await saveFinance24mRecord({
      form: {
        summary: parsed.data.summary,
        priorities: parsed.data.priorities,
        evidence: parsed.data.evidence,
        risks: parsed.data.risks,
        nextStep: parsed.data.nextStep,
      },
      monthly: parsed.data.monthly as RevenuePoint[],
      role,
      intent: parsed.data.intent,
    });

    return {
      success: true,
      message:
        parsed.data.intent === "draft"
          ? "Projecao financeira 24m salva com sucesso."
          : "Projecao financeira 24m publicada com sucesso.",
      module: savedModule,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Nao foi possivel salvar o financeiro 24m.",
    };
  }
}

export async function saveSensorWorkbookAction(input: unknown) {
  const role = await requireAuthenticatedSession();

  if (role === "mentor") {
    return {
      success: false,
      message: "Mentores possuem acesso de leitura neste modulo.",
    };
  }

  const parsed = sensorWorkbookSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Nao foi possivel salvar o sensor.",
    };
  }

  try {
    const savedModule = await saveSensorWorkbookRecord({
      slug: parsed.data.slug,
      responses: parsed.data.responses,
      role,
      intent: parsed.data.intent,
    });

    return {
      success: true,
      message:
        parsed.data.intent === "draft"
          ? "Sensor salvo com sucesso."
          : "Sensor publicado com sucesso.",
      module: savedModule,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Nao foi possivel salvar o sensor.",
    };
  }
}

function extractOpenAiText(payload: any) {
  return payload?.choices?.[0]?.message?.content ?? "";
}

function buildLocalAdvisorText(advisor: ReturnType<typeof buildAdvisorSummary>) {
  const risks = advisor.topRisks
    .slice(0, 3)
    .map(
      (item, index) =>
        `${index + 1}. ${item.title}\nEvidencias: ${item.evidence.join("; ")}\nProximo passo: ${item.nextStep}`,
    )
    .join("\n\n");
  const actions = advisor.nextActions
    .slice(0, 3)
    .map((item, index) => `${index + 1}. ${item.title}: ${item.nextStep}`)
    .join("\n");
  const strengths = advisor.strengths
    .slice(0, 3)
    .map((item) => `- ${item.title}: ${item.body}`)
    .join("\n");

  return `Readiness de captacao: ${advisor.readinessScore}/100 - ${advisor.readinessLabel}

Principais riscos:
${risks}

Proximas acoes recomendadas:
${actions}

Pontos fortes atuais:
${strengths}

Fontes usadas:
${advisor.sources.slice(0, 8).map((source) => `- ${source}`).join("\n")}`;
}

export async function generateAiAdvisorAction() {
  await requireAuthenticatedSession();

  const apiKey = process.env.OPENAI_API_KEY;
  const snapshot = await readGameformSnapshot();
  const advisor = buildAdvisorSummary(snapshot);

  if (!apiKey) {
    return {
      success: true,
      message: buildLocalAdvisorText(advisor),
      notice:
        "Analise local gerada. Configure OPENAI_API_KEY para ativar o feedback generativo.",
      fallback: advisor,
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Voce e um advisor de empresas de tecnologia, games e IA. Seja objetivo, cite evidencias dos dados recebidos e proponha proximas acoes para mentor, founder e captacao. Responda em Portugues do Brasil.",
          },
          {
            role: "user",
            content: buildAdvisorPrompt(snapshot, advisor),
          }
        ],
        max_tokens: 1200,
        temperature: 0.7,
      }),
    });

    const payload = (await response.json()) as any;

    if (!response.ok) {
      console.error("OpenAI API Error:", payload);
      return {
        success: true,
        message: buildLocalAdvisorText(advisor),
        notice: `Erro na API (${response.status}); mantive a analise local.`,
        fallback: advisor,
      };
    }

    const text = payload.choices?.[0]?.message?.content?.trim() || "";

    return {
      success: Boolean(text),
      message: text || "A IA retornou uma resposta vazia.",
      fallback: advisor,
    };
  } catch (error) {
    console.error("AI Action Error:", error);
    return {
      success: true,
      message: buildLocalAdvisorText(advisor),
      notice: "Falha de conexao com a IA. Mantive a analise local estruturada.",
      fallback: advisor,
    };
  }
}
