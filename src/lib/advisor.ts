import type { GameformSnapshot, ModuleDefinition, SensorPoint } from "./types";
import {
  getAreaMaturity,
  getOverallCompletion,
  getPhaseOneCompletion,
  getPhaseThreeCompletion,
  getPhaseTwoCompletion,
} from "./gameform-data";

export type AdvisorInsight = {
  title: string;
  severity: "critical" | "attention" | "positive";
  body: string;
  evidence: string[];
  nextStep: string;
};

export type AdvisorSummary = {
  readinessScore: number;
  readinessLabel: string;
  topRisks: AdvisorInsight[];
  nextActions: AdvisorInsight[];
  strengths: AdvisorInsight[];
  sources: string[];
};

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function getWeakModules(modules: ModuleDefinition[]) {
  return modules
    .slice()
    .sort((a, b) => a.progress + a.maturity - (b.progress + b.maturity))
    .slice(0, 4);
}

function getStrongModules(modules: ModuleDefinition[]) {
  return modules
    .slice()
    .sort((a, b) => b.progress + b.maturity - (a.progress + a.maturity))
    .slice(0, 3);
}

function sensorDelta(sensorComparison: SensorPoint[]) {
  const initial = sensorComparison.reduce((total, item) => total + item.initial, 0);
  const current = sensorComparison.reduce((total, item) => total + item.current, 0);

  return {
    initial,
    current,
    delta: current - initial,
  };
}

function readinessLabel(score: number) {
  if (score >= 80) {
    return "Pronta para abordagem seletiva";
  }

  if (score >= 65) {
    return "Quase pronta, com pendencias antes de captar";
  }

  if (score >= 45) {
    return "Precisa consolidar fundamentos";
  }

  return "Ainda cedo para captacao estruturada";
}

export function buildAdvisorSummary(snapshot: GameformSnapshot): AdvisorSummary {
  const modules = snapshot.modules;
  const areaMaturity = getAreaMaturity(modules);
  const finance = modules.find((module) => module.slug === "finance-24m");
  const fundraising = modules.find((module) => module.slug === "fundraising");
  const pricing = modules.find((module) => module.slug === "pricing");
  const pitch = modules.find((module) => module.slug === "pitch-script");
  const delta = sensorDelta(snapshot.sensorComparison);
  const cashValues = snapshot.finance24m.map((item) => item.caixa);
  const minCash = Math.min(...cashValues);
  const completion = getOverallCompletion(modules);
  const maturity = average(modules.map((module) => module.maturity));
  const capitalReadiness = average([
    fundraising?.maturity ?? 0,
    finance?.maturity ?? 0,
    pitch?.maturity ?? 0,
    pricing?.maturity ?? 0,
  ]);
  const readinessScore = average([completion, maturity, capitalReadiness]);
  const weakModules = getWeakModules(modules);
  const strongModules = getStrongModules(modules);

  const topRisks: AdvisorInsight[] = [
    {
      title: "Captacao depende de financeiro e pricing mais consistentes",
      severity: capitalReadiness >= 70 ? "attention" : "critical",
      body:
        "A narrativa de rodada existe, mas ainda precisa fechar premissas de preco, runway, uso do capital e cenarios antes de uma abordagem ampla.",
      evidence: [
        `Captacao: ${fundraising?.progress ?? 0}% preenchido`,
        `Financeiro 24m: ${finance?.progress ?? 0}% preenchido`,
        `Precificacao: ${pricing?.progress ?? 0}% preenchido`,
      ],
      nextStep:
        "Criar uma revisao conjunta de pricing, financeiro 24m e captacao antes do proximo envio para investidores.",
    },
    {
      title: "Modulos fracos ainda travam uma leitura executiva limpa",
      severity: weakModules.some((module) => module.progress < 45) ? "critical" : "attention",
      body:
        "A plataforma precisa destacar os gargalos que impedem progresso real, em vez de apenas listar todas as abas da metodologia.",
      evidence: weakModules.map(
        (module) => `${module.shortTitle}: ${module.progress}% preenchido, maturidade ${module.maturity}%`,
      ),
      nextStep: weakModules[0]?.nextAction ?? "Escolher um modulo prioritario para destravar.",
    },
    {
      title: "Evolucao existe, mas precisa virar prova visual",
      severity: delta.delta > 0 ? "attention" : "critical",
      body:
        "O GF-Sensor mostra mudanca entre diagnostico inicial e atual, mas essa leitura precisa aparecer no painel principal como sinal de evolucao da empresa.",
      evidence: [`Sensor inicial: ${delta.initial}`, `Sensor atual: ${delta.current}`, `Delta: ${delta.delta}`],
      nextStep: "Usar o radar e o comparativo do sensor como primeira leitura do dashboard.",
    },
  ];

  if (minCash < 0) {
    topRisks.unshift({
      title: "Caixa projetado fica negativo",
      severity: "critical",
      body:
        "A projecao de 24 meses possui pelo menos um mes com caixa negativo, o que deve virar alerta de runway e captacao.",
      evidence: [`Menor caixa projetado: R$ ${minCash.toLocaleString("pt-BR")}`],
      nextStep: "Revisar custos, receita esperada e tamanho da rodada para proteger runway.",
    });
  }

  const nextActions: AdvisorInsight[] = [
    {
      title: "Transformar feedback em plano de mentoria",
      severity: "attention",
      body:
        "Mentor, founder e admin precisam conversar em cima dos mesmos modulos, com respostas, tarefas e decisao registrada.",
      evidence: [`Comentarios registrados: ${snapshot.comments.length}`, `Proxima mentoria: ${snapshot.startup.nextMeeting}`],
      nextStep: "Usar os modulos prioritarios como pauta da proxima sessao.",
    },
    {
      title: "Preparar data room de captacao",
      severity: "attention",
      body:
        "A empresa precisa consolidar pitch, financeiro, marcos, captacao e evidencias em uma narrativa unica para recursos.",
      evidence: [
        `Pitch: ${pitch?.progress ?? 0}%`,
        `Fundraising: ${fundraising?.progress ?? 0}%`,
        `Fase 3: ${getPhaseThreeCompletion(modules)}%`,
      ],
      nextStep: "Criar checklist de data room e bloquear itens ausentes antes de outreach.",
    },
    {
      title: "Simplificar a experiencia por jornadas",
      severity: "attention",
      body:
        "Os 22 modulos continuam existindo, mas a navegacao principal deve trabalhar por jornadas de decisao, nao por aba.",
      evidence: [
        `Diagnostico: ${getPhaseOneCompletion(modules)}%`,
        `Mercado e produto: ${getPhaseTwoCompletion(modules)}%`,
        `Execucao e captacao: ${getPhaseThreeCompletion(modules)}%`,
      ],
      nextStep: "Agrupar telas em Diagnostico, Produto/Mercado, Financeiro, Roadmap, Captacao e Relatorio.",
    },
  ];

  const strengths: AdvisorInsight[] = strongModules.map((module) => ({
    title: module.shortTitle,
    severity: "positive",
    body: module.mentorComment,
    evidence: [`${module.progress}% preenchido`, `Maturidade ${module.maturity}%`, module.form.evidence],
    nextStep: module.nextAction,
  }));

  return {
    readinessScore,
    readinessLabel: readinessLabel(readinessScore),
    topRisks,
    nextActions,
    strengths,
    sources: [
      "GF-Sensor inicial e atual",
      "Progresso e maturidade dos modulos",
      "Financeiro 24 meses",
      "Captacao, pitch e precificacao",
      ...areaMaturity.map((item) => `Maturidade ${item.area}: ${item.score}%`),
    ],
  };
}

export function buildAdvisorPrompt(snapshot: GameformSnapshot, summary: AdvisorSummary) {
  const modules = snapshot.modules.map((module) => ({
    slug: module.slug,
    title: module.title,
    area: module.area,
    status: module.status,
    progress: module.progress,
    maturity: module.maturity,
    summary: module.form.summary,
    evidence: module.form.evidence,
    risks: module.form.risks,
    nextStep: module.form.nextStep,
  }));

  return JSON.stringify(
    {
      company: snapshot.startup.studioName,
      readinessScore: summary.readinessScore,
      readinessLabel: summary.readinessLabel,
      modules,
      sensorComparison: snapshot.sensorComparison,
      finance24m: snapshot.finance24m,
      roadmap: snapshot.roadmapItems,
      comments: snapshot.comments,
      instruction:
        "Analise esta empresa para uma plataforma SaaS de gestao, mentoria e captacao. Responda em portugues do Brasil com riscos, pontos fortes, proximas acoes e campos usados como evidencia.",
    },
    null,
    2,
  );
}
