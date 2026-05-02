import type {
  ActivityLog,
  CommentThread,
  Finance5yPoint,
  ModuleDefinition,
  ModuleStatus,
  RevenuePoint,
  RoadmapItem,
  Role,
  SensorPoint,
  StartupRecord,
  StudioSummary,
} from "./types";
import { average } from "./utils";
import {
  buildWorkbookFinance24m,
  buildWorkbookFinance5y,
  buildWorkbookSensorComparison,
} from "./workbook-model";

export const roles: Record<Role, { label: string; accent: string }> = {
  founder: { label: "Fundador", accent: "bg-teal-500/15 text-teal-800" },
  member: { label: "Membro do estudio", accent: "bg-cyan-500/15 text-cyan-800" },
  mentor: { label: "Mentor", accent: "bg-amber-500/15 text-amber-700" },
  admin: { label: "Admin Osten", accent: "bg-slate-900 text-white" },
};

export const phaseOneModuleSlugs = [
  "company-info",
  "vision-overview",
  "gf-sensor-initial",
  "gf-sensor-current",
] as const;

export const phaseTwoModuleSlugs = [
  "market-analysis",
  "competitors",
  "problem-analysis",
  "empathy-map",
  "influence-map",
  "value-chain",
  "value-proposition-canvas",
  "buyer-persona",
  "customer-journey",
  "pricing",
  "product-info",
] as const;

export const phaseThreeModuleSlugs = [
  "finance-24m",
  "milestones",
  "finance-5y",
  "gantt-items",
  "pitch-script",
  "fundraising",
  "competencies",
] as const;

export const modules: ModuleDefinition[] = [
  {
    slug: "company-info",
    title: "Informações da empresa",
    shortTitle: "Empresa",
    description: "Base institucional do estúdio, equipe, estágio e posicionamento.",
    area: "Estratégia",
    status: "concluido",
    progress: 100,
    maturity: 74,
    nextAction: "Atualizar composição societária e advisors.",
    mentorComment: "Boa clareza de tese e estrutura de time fundador.",
    ostenFeedback: "Padronizar indicadores de headcount e burn rate.",
    form: {
      summary: "Estúdio focado em jogos multiplayer de PC e console com operação híbrida.",
      priorities: "Consolidar conselho consultivo; formalizar OKRs trimestrais.",
      evidence: "Pitch deck 2026, organograma, CNPJ ativo, contrato social revisado.",
      risks: "Dependência de dois líderes técnicos para decisões críticas.",
      nextStep: "Criar plano de sucessão e estrutura de reporte.",
    },
  },
  {
    slug: "vision-overview",
    title: "Visão geral",
    shortTitle: "Visão",
    description: "Narrativa executiva, objetivos, marcos e status geral de evolução.",
    area: "Estratégia",
    status: "concluido",
    progress: 92,
    maturity: 78,
    nextAction: "Traduzir visão em metas de produto por trimestre.",
    mentorComment: "A narrativa de valor está forte e já comunica ambição.",
    ostenFeedback: "Trazer indicadores mais objetivos de avanço comercial.",
    form: {
      summary: "Meta de se tornar referência em co-op tático com progressão sazonal.",
      priorities: "Definir North Star; conectar visão com marcos de distribuição.",
      evidence: "Resumo executivo, benchmarking e tese de retenção.",
      risks: "Visão ainda pouco amarrada à tese financeira.",
      nextStep: "Vincular visão a metas de ARR e CAC.",
    },
  },
  {
    slug: "gf-sensor-initial",
    title: "GF-Sensor inicial",
    shortTitle: "Sensor inicial",
    description: "Diagnóstico de maturidade na entrada da aceleração.",
    area: "Estratégia",
    status: "concluido",
    progress: 100,
    maturity: 56,
    nextAction: "Validar hipóteses críticas com clientes e benchmark.",
    mentorComment: "Ponto de partida consistente para medir evolução.",
    ostenFeedback: "Usar como baseline das próximas mentorias.",
    form: {
      summary: "Diagnóstico inicial com foco em produto, mercado e captação.",
      priorities: "Registrar baseline por frente funcional.",
      evidence: "Aplicação do sensor com equipe fundadora.",
      risks: "Alguns scores foram percebidos sem evidência objetiva.",
      nextStep: "Amarrar notas a artefatos e dados concretos.",
    },
  },
  {
    slug: "gf-sensor-current",
    title: "GF-Sensor atual",
    shortTitle: "Sensor atual",
    description: "Fotografia atual da maturidade após evolução do estúdio.",
    area: "Estratégia",
    status: "em_andamento",
    progress: 78,
    maturity: 73,
    nextAction: "Fechar dimensão comercial após testes de monetização.",
    mentorComment: "Evolução clara em produto e organização.",
    ostenFeedback: "Falta atualizar finance e fundraising para refletir o momento.",
    form: {
      summary: "Leitura atual aponta avanço em operação e clareza estratégica.",
      priorities: "Atualizar monetização; revisar GTM e captação.",
      evidence: "Painel de progresso trimestral e entrevistas com usuários.",
      risks: "Lacuna entre crescimento de comunidade e pipeline comercial.",
      nextStep: "Concluir sprint de revisão do sensor com liderança.",
    },
  },
  {
    slug: "market-analysis",
    title: "Mercado",
    shortTitle: "Mercado",
    description: "Tamanho de mercado, tendências, canais e oportunidades.",
    area: "Mercado",
    status: "concluido",
    progress: 84,
    maturity: 80,
    nextAction: "Adicionar cortes regionais LATAM x NA.",
    mentorComment: "Boa leitura de nicho e de timing competitivo.",
    ostenFeedback: "Incluir fontes de TAM/SAM/SOM no próximo publish.",
    form: {
      summary: "Mercado crescente em co-op competitivo com comunidade creator-led.",
      priorities: "Detalhar geografia e canais de distribuição prioritários.",
      evidence: "Steam trends, relatórios setoriais e entrevistas com publishers.",
      risks: "Risco de superestimar penetração em console no primeiro ciclo.",
      nextStep: "Rodar recorte por segmento de preço.",
    },
  },
  {
    slug: "competitors",
    title: "Concorrência e diferenciação",
    shortTitle: "Concorrência",
    description: "Mapeamento competitivo, benchmark e proposta de diferenciação.",
    area: "Mercado",
    status: "em_andamento",
    progress: 72,
    maturity: 69,
    nextAction: "Atualizar matriz de diferenciação com features live ops.",
    mentorComment: "A diferenciação está clara, mas a prova ainda é inicial.",
    ostenFeedback: "Comparar também economia e loops de retenção.",
    form: {
      summary: "Concorrência concentrada em shooters táticos e extraction lite.",
      priorities: "Mapear diferenciação por loop social e progressão.",
      evidence: "Benchmark de store pages, reviews e sessão com mentoria.",
      risks: "Risco de parecer feature parity sem thesis de comunidade.",
      nextStep: "Refinar matriz de posicionamento.",
    },
  },
  {
    slug: "problem-analysis",
    title: "Entendimento do problema",
    shortTitle: "Problema",
    description: "Hipóteses, dores reais do público e contexto de uso.",
    area: "Mercado",
    status: "concluido",
    progress: 88,
    maturity: 77,
    nextAction: "Formalizar entrevistas por cluster de jogador.",
    mentorComment: "Problemas levantados têm boa aderência a comportamentos reais.",
    ostenFeedback: "Separar dores do jogador e do squad organizer.",
    form: {
      summary: "Jogadores buscam progressão social sem exigir sessões longas.",
      priorities: "Desambiguar dor principal por segmento.",
      evidence: "25 entrevistas e observação de comunidades no Discord.",
      risks: "Amostra forte em PC, ainda curta em console.",
      nextStep: "Ampliar entrevistas com creators e moderadores.",
    },
  },
  {
    slug: "empathy-map",
    title: "Mapa de Empatia",
    shortTitle: "Empatia",
    description: "Visão qualitativa sobre pensamentos, dores, ganhos e comportamentos.",
    area: "Mercado",
    status: "concluido",
    progress: 94,
    maturity: 82,
    nextAction: "Usar mapa em backlog de UX onboarding.",
    mentorComment: "Excelente base para comunicação e onboarding.",
    ostenFeedback: "Transformar achados em princípios de produto.",
    form: {
      summary: "Persona valoriza partidas fluidas, coesão de grupo e status percebido.",
      priorities: "Relacionar dores a oportunidades de feature.",
      evidence: "Síntese das entrevistas e community notes.",
      risks: "Parte do ganho emocional ainda não foi quantificada.",
      nextStep: "Cruzar com buyer persona e jornada.",
    },
  },
  {
    slug: "influence-map",
    title: "Mapa de Influência",
    shortTitle: "Influência",
    description: "Stakeholders que influenciam compra, retenção e distribuição.",
    area: "Mercado",
    status: "nao_iniciado",
    progress: 28,
    maturity: 41,
    nextAction: "Mapear creators, comunidades e parceiros B2B.",
    mentorComment: "Ainda faltam relações de poder fora do jogador final.",
    ostenFeedback: "Prioridade alta antes da próxima rodada de GTM.",
    form: {
      summary: "Mapa inicial considera creators e moderadores como atores-chave.",
      priorities: "Expandir para publishers, patrocinadores e plataformas.",
      evidence: "Anotações preliminares de mentoria.",
      risks: "Chance de subestimar influenciadores indiretos.",
      nextStep: "Concluir workshop com time comercial.",
    },
  },
  {
    slug: "value-chain",
    title: "Cadeia de Valor",
    shortTitle: "Cadeia de valor",
    description: "Atividades que criam, entregam e capturam valor no negócio.",
    area: "Produto",
    status: "em_andamento",
    progress: 63,
    maturity: 65,
    nextAction: "Detalhar pós-lançamento e suporte live ops.",
    mentorComment: "Estrutura já mostra gargalos de publishing.",
    ostenFeedback: "Separar processos internos e alavancas externas.",
    form: {
      summary: "Cadeia de valor cobre discovery, produção, lançamento e operação.",
      priorities: "Especificar parceiros e custos críticos por etapa.",
      evidence: "Fluxo operacional e revisão de pipeline.",
      risks: "Pontos de dependência em arte e backend online.",
      nextStep: "Anexar SLA interno por fase.",
    },
  },
  {
    slug: "value-proposition-canvas",
    title: "Canvas da Proposta de Valor",
    shortTitle: "Proposta de valor",
    description: "Ajuste entre dores, ganhos e proposta do produto.",
    area: "Produto",
    status: "concluido",
    progress: 86,
    maturity: 81,
    nextAction: "Publicar versão resumida para investidores.",
    mentorComment: "Muito claro e alinhado com a dor principal.",
    ostenFeedback: "Levar linguagem para versão externa do deck.",
    form: {
      summary: "Proposta entrega partidas memoráveis e coordenação simplificada.",
      priorities: "Ajustar mensagens por estágio de awareness.",
      evidence: "Canvas preenchido e validado com mentor.",
      risks: "Ganhos financeiros ainda pouco explicitados para parceiros.",
      nextStep: "Traduzir canvas em mensagens por canal.",
    },
  },
  {
    slug: "buyer-persona",
    title: "Buyer Persona",
    shortTitle: "Persona",
    description: "Perfil de decisor ou comprador mais provável do produto.",
    area: "Mercado",
    status: "concluido",
    progress: 80,
    maturity: 75,
    nextAction: "Adicionar segmentação por ticket e plataforma.",
    mentorComment: "Boa persona para orientar canais e conteúdo.",
    ostenFeedback: "Refinar distinção entre jogador e buyer B2B.",
    form: {
      summary: "Persona principal é squad leader de 24-34 anos com forte presença em Discord.",
      priorities: "Criar subpersonas por plataforma.",
      evidence: "Dados de entrevistas e CRM de comunidade.",
      risks: "Generalização excessiva entre PC e console.",
      nextStep: "Segmentar por comportamento de gasto.",
    },
  },
  {
    slug: "customer-journey",
    title: "Jornada do cliente",
    shortTitle: "Jornada",
    description: "Passos de descoberta, consideração, adoção e expansão.",
    area: "Produto",
    status: "em_andamento",
    progress: 70,
    maturity: 72,
    nextAction: "Conectar a jornada com eventos analíticos do produto.",
    mentorComment: "A jornada está útil para produto e marketing.",
    ostenFeedback: "Incluir momentos de community-led growth.",
    form: {
      summary: "Jornada cobre descoberta via creators, teste com squad e expansão por convites.",
      priorities: "Medir fricção em onboarding e sessão 1.",
      evidence: "Mapa de jornada e análise de comportamento.",
      risks: "Sem instrumentação completa em alguns touchpoints.",
      nextStep: "Criar matriz evento x objetivo.",
    },
  },
  {
    slug: "product-info",
    title: "Informações do produto",
    shortTitle: "Produto",
    description: "Escopo do produto, diferenciais, estágio, público e plataforma.",
    area: "Produto",
    status: "concluido",
    progress: 91,
    maturity: 83,
    nextAction: "Atualizar estado do vertical slice.",
    mentorComment: "Produto bem descrito e vendável.",
    ostenFeedback: "Adicionar seção de tecnologia e stack live ops.",
    form: {
      summary: "Vertical slice jogável com loop principal validado em playtests.",
      priorities: "Especificar requisitos de backend e live services.",
      evidence: "Build atual, playtest, backlog e visões de design.",
      risks: "Dependência de infraestrutura online para escala.",
      nextStep: "Atualizar ficha técnica do produto.",
    },
  },
  {
    slug: "milestones",
    title: "Marcos de Desenvolvimento",
    shortTitle: "Marcos",
    description: "Marcos estratégicos, entregas e critérios de aceitação.",
    area: "Execução",
    status: "em_andamento",
    progress: 74,
    maturity: 76,
    nextAction: "Adicionar dependencies entre milestones e fundraising.",
    mentorComment: "Marcos estão claros e ajudam a reduzir ambiguidade.",
    ostenFeedback: "Explicitar gates de publish e métricas por marco.",
    form: {
      summary: "Roadmap dividido em protótipo, vertical slice, alpha fechado e lançamento.",
      priorities: "Definir gates por milestone.",
      evidence: "Backlog priorizado e mapa de marcos.",
      risks: "Dependências externas ainda pouco explícitas.",
      nextStep: "Revisar com liderança técnica.",
    },
  },
  {
    slug: "finance-5y",
    title: "Projeção financeira 5 anos",
    shortTitle: "Financeiro 5 anos",
    description: "Visão anual de crescimento, margem, retorno e expansão.",
    area: "Financeiro",
    status: "nao_iniciado",
    progress: 34,
    maturity: 48,
    nextAction: "Conectar com pipeline de lançamentos futuros.",
    mentorComment: "Bom rascunho, ainda falta robustez estratégica.",
    ostenFeedback: "Exigir cenários com captação, publishing e IP própria.",
    form: {
      summary: "Visão preliminar com expansão de catálogo e receitas recorrentes.",
      priorities: "Criar cenários base, upside e downside.",
      evidence: "Modelo anual em construção.",
      risks: "Premissas de expansão ainda muito otimistas.",
      nextStep: "Fechar premissas e storytelling financeiro.",
    },
  },
  {
    slug: "pitch-script",
    title: "Roteiro de Pitch",
    shortTitle: "Pitch",
    description: "Narrativa de apresentação para parceiros e investidores.",
    area: "Captação",
    status: "concluido",
    progress: 87,
    maturity: 78,
    nextAction: "Criar versão curta para reuniões de 7 minutos.",
    mentorComment: "Pitch já vende bem equipe, dor e solução.",
    ostenFeedback: "Trazer mais evidência de mercado e uso de capital.",
    form: {
      summary: "Pitch estruturado em problema, solução, mercado, tração e uso do investimento.",
      priorities: "Encurtar história inicial e reforçar números.",
      evidence: "Deck base e roteiro falado para demo day.",
      risks: "Excesso de contexto antes da tese de retorno.",
      nextStep: "Gravar ensaio e revisar com mentor.",
    },
  },
  {
    slug: "pricing",
    title: "Precificação",
    shortTitle: "Precificação",
    description: "Estratégia de preço, pacotes, monetização e testes.",
    area: "Financeiro",
    status: "nao_iniciado",
    progress: 22,
    maturity: 39,
    nextAction: "Concluir tese premium + DLC cosmético.",
    mentorComment: "Tema ainda sensível e decisivo para a próxima etapa.",
    ostenFeedback: "Prioridade máxima antes do relatório executivo.",
    form: {
      summary: "Hipótese inicial combina entrada premium e monetização estética.",
      priorities: "Testar âncoras de preço e bundles.",
      evidence: "Benchmarks preliminares de mercado.",
      risks: "Risco alto de desalinhamento entre preço e percepção de valor.",
      nextStep: "Rodar simulações e entrevistas de willingness to pay.",
    },
  },
  {
    slug: "finance-24m",
    title: "Projeção financeira 24 meses",
    shortTitle: "Financeiro 24m",
    description: "Planejamento mensal de receita, custos, caixa e cenário base.",
    area: "Financeiro",
    status: "em_andamento",
    progress: 66,
    maturity: 70,
    nextAction: "Atualizar folha salarial e receita SaaS B2B.",
    mentorComment: "Boa estrutura, faltam sensitivities mais claras.",
    ostenFeedback: "Incluir cenário conservador e runway pós-captação.",
    form: {
      summary: "Modelo com 24 meses, burn controlado e ramp-up de monetização.",
      priorities: "Refinar folha, CAC e sazonalidade de receita.",
      evidence: "Planilha financeira e revisão com mentor.",
      risks: "Receita ainda depende de hipóteses não testadas.",
      nextStep: "Publicar versão revisada para comitê.",
    },
  },
  {
    slug: "gantt-items",
    title: "Gantt / Roadmap",
    shortTitle: "Gantt",
    description: "Visualização temporal dos marcos, dependências e execução.",
    area: "Execução",
    status: "em_andamento",
    progress: 71,
    maturity: 73,
    nextAction: "Publicar versão compartilhável para mentorias.",
    mentorComment: "Visual bom para operação e comunicação com investidor.",
    ostenFeedback: "Adicionar faixa específica de fundraising e distribuição.",
    form: {
      summary: "Roadmap consolidado com visão trimestral e owners por frente.",
      priorities: "Separar trilhas de produto, growth e captação.",
      evidence: "Cronograma atualizado em reuniões semanais.",
      risks: "Sem buffer suficiente para certificação e aprovação externa.",
      nextStep: "Inserir folgas de risco por trimestre.",
    },
  },
  {
    slug: "fundraising",
    title: "Captação de investimentos",
    shortTitle: "Captação",
    description: "Estratégia de captação, tese, round, alvos e materiais.",
    area: "Captação",
    status: "em_andamento",
    progress: 68,
    maturity: 71,
    nextAction: "Finalizar lista de fundos e tese de uso do capital.",
    mentorComment: "Tese está sólida, falta ampliar pipeline.",
    ostenFeedback: "Conectar milestone financing ao plano financeiro.",
    form: {
      summary: "Captação seed com foco em smart money para publishing e live ops.",
      priorities: "Fechar target list, narrativa de round e data room.",
      evidence: "Lista de investidores e deck revisado.",
      risks: "Rodada pode alongar se pricing não estiver fechado.",
      nextStep: "Executar outreach em ondas.",
    },
  },
  {
    slug: "competencies",
    title: "Avaliação de competências",
    shortTitle: "Competências",
    description: "Diagnóstico de gaps de equipe e competências estratégicas.",
    area: "Execução",
    status: "concluido",
    progress: 89,
    maturity: 79,
    nextAction: "Planejar contratação de produção e BI.",
    mentorComment: "Mapa de equipe está bem honesto e orienta decisões.",
    ostenFeedback: "Amarrar gaps críticos ao roadmap e budget.",
    form: {
      summary: "Time forte em design e tecnologia, com lacunas em growth e BI.",
      priorities: "Planejar hiring e advisors.",
      evidence: "Matriz de competências preenchida com equipe.",
      risks: "Sobrecarga dos founders em operações transversais.",
      nextStep: "Priorizar papéis para os próximos 2 trimestres.",
    },
  },
];

export const sensorComparison: SensorPoint[] = buildWorkbookSensorComparison();

export const finance24m: RevenuePoint[] = buildWorkbookFinance24m();

export const finance5y: Finance5yPoint[] = buildWorkbookFinance5y();

export const roadmapItems: RoadmapItem[] = [
  { id: "r1", title: "Vertical slice + UX onboarding", owner: "Produto", quarter: "Q2 2026", status: "em_execucao", completion: 82 },
  { id: "r2", title: "Alpha fechado com 300 jogadores", owner: "Growth", quarter: "Q3 2026", status: "planejado", completion: 44 },
  { id: "r3", title: "Preparação de rodada seed", owner: "Founders", quarter: "Q3 2026", status: "em_execucao", completion: 68 },
  { id: "r4", title: "Soft launch regional", owner: "Publishing", quarter: "Q4 2026", status: "planejado", completion: 24 },
];

export const comments: CommentThread[] = [
  {
    id: "c1",
    author: "Marina Osten",
    role: "admin",
    moduleSlug: "pricing",
    message: "Precisamos transformar esta hipótese de preço em experimento com data e amostra definida.",
    createdAt: "2026-03-27 14:30",
  },
  {
    id: "c2",
    author: "Caio Mentor",
    role: "mentor",
    moduleSlug: "fundraising",
    message: "A tese está boa. Falta só conectar milestones aos usos do capital no seed.",
    createdAt: "2026-03-28 09:15",
  },
];

export const activityLogs: ActivityLog[] = [
  { id: "a1", actor: "Equipe Nebula Forge", role: "founder", action: "Publicou", target: "Projeção financeira 24 meses", when: "Hoje, 09:10" },
  { id: "a2", actor: "Caio Mentor", role: "mentor", action: "Comentou", target: "Captação de investimentos", when: "Ontem, 18:20" },
  { id: "a3", actor: "Marina Osten", role: "admin", action: "Solicitou revisão", target: "Precificação", when: "Ontem, 15:05" },
];

export const seedStartup: StartupRecord = {
  id: "startup-nebula-forge",
  studioName: "Nebula Forge Studio",
  legalName: "Nebula Forge Games LTDA",
  email: "founders@nebulaforge.com",
  cohort: "Cohort 2026.1",
  mentor: "Caio Mentor",
  nextMeeting: "03 Abr 2026, 15:00",
  monthlyMentorships: 8,
  createdAt: "2026-03-01T10:00:00.000Z",
  updatedAt: "2026-03-31T18:00:00.000Z",
};

export function buildStudioSummary(
  startup: StartupRecord = seedStartup,
  moduleList: ModuleDefinition[] = modules,
): StudioSummary {
  const completion = getOverallCompletion(moduleList);
  const maturity = average(moduleList.map((module) => module.maturity));

  return {
    name: startup.studioName,
    cycle: startup.cohort,
    health: Math.round((completion + maturity) / 2),
    pendingAlerts: moduleList.filter((module) => module.status !== "concluido").length,
    mentorName: startup.mentor,
    nextMeeting: startup.nextMeeting,
    monthlyMentorships: startup.monthlyMentorships,
  };
}

export const studioSummary = buildStudioSummary();

export function getModuleBySlug(
  slug: string,
  moduleList: ModuleDefinition[] = modules,
) {
  return moduleList.find((module) => module.slug === slug);
}

export function getModulesByStatus(
  status: ModuleStatus,
  moduleList: ModuleDefinition[] = modules,
) {
  return moduleList.filter((module) => module.status === status);
}

export function getPhaseOneModules(moduleList: ModuleDefinition[] = modules) {
  return moduleList.filter((module) =>
    phaseOneModuleSlugs.includes(
      module.slug as (typeof phaseOneModuleSlugs)[number],
    ),
  );
}

export function getPhaseTwoModules(moduleList: ModuleDefinition[] = modules) {
  return moduleList.filter((module) =>
    phaseTwoModuleSlugs.includes(
      module.slug as (typeof phaseTwoModuleSlugs)[number],
    ),
  );
}

export function getPhaseThreeModules(moduleList: ModuleDefinition[] = modules) {
  return moduleList.filter((module) =>
    phaseThreeModuleSlugs.includes(
      module.slug as (typeof phaseThreeModuleSlugs)[number],
    ),
  );
}

export function getOverallCompletion(moduleList: ModuleDefinition[] = modules) {
  return average(moduleList.map((module) => module.progress));
}

export function getPhaseOneCompletion(moduleList: ModuleDefinition[] = modules) {
  return average(getPhaseOneModules(moduleList).map((module) => module.progress));
}

export function getPhaseTwoCompletion(moduleList: ModuleDefinition[] = modules) {
  return average(getPhaseTwoModules(moduleList).map((module) => module.progress));
}

export function getPhaseThreeCompletion(moduleList: ModuleDefinition[] = modules) {
  return average(getPhaseThreeModules(moduleList).map((module) => module.progress));
}

export function getAreaMaturity(moduleList: ModuleDefinition[] = modules) {
  const grouped = moduleList.reduce<Record<string, number[]>>((acc, module) => {
    acc[module.area] ??= [];
    acc[module.area].push(module.maturity);
    return acc;
  }, {});

  return Object.entries(grouped).map(([area, values]) => ({
    area,
    score: Math.round(average(values)),
  }));
}

export function getRoleLanding(role: Role) {
  if (role === "admin") {
    return "/app/admin";
  }

  if (role === "mentor") {
    return "/app/mentor";
  }

  return "/app";
}
