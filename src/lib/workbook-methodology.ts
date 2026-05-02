import type { ModuleDefinition } from "./types";

export type WorkbookFieldKind = "input" | "select" | "formula" | "reference";

export type WorkbookFieldContract = {
  ref: string;
  label: string;
  kind: WorkbookFieldKind;
  formula?: string;
  options?: string[];
  source?: string;
  helper: string;
};

export type WorkbookModuleContract = {
  slug: string;
  sheetName: string;
  sheetState: "visible" | "hidden";
  phase: "Diagnostico" | "Mercado" | "Produto" | "Financeiro" | "Execucao";
  purpose: string;
  fields: WorkbookFieldContract[];
  aiReviewFocus: string[];
  acceptanceChecks: string[];
};

export const workbookAuditSummary = {
  workbook:
    "Ferramenta GameForm - Desenvolvimento de Negocios (Nome do Participante) .xlsx",
  visibleSheets: 22,
  hiddenSheets: 2,
  formulas: 3651,
  validations: 40,
  protectedPrinciple:
    "Usuarios editam apenas campos abertos; formulas e tabelas internas sao preservadas.",
} as const;

const statusFields: WorkbookFieldContract[] = [
  {
    ref: "A2:A4",
    label: "Status padrao",
    kind: "reference",
    source: "MODELO",
    helper: "Tabela interna usada para Nao iniciado, Em andamento e Concluido.",
  },
];

const standardTextFields = [
  {
    ref: "FORM:summary",
    label: "Resumo executivo",
    kind: "input" as const,
    helper: "Campo aberto do sistema para sintetizar o preenchimento da aba.",
  },
  {
    ref: "FORM:evidence",
    label: "Evidencias",
    kind: "input" as const,
    helper: "Campo aberto para justificar a avaliacao com fatos, links ou anexos.",
  },
  {
    ref: "FORM:nextStep",
    label: "Proximo passo",
    kind: "input" as const,
    helper: "Campo aberto usado para acompanhamento e mentoria.",
  },
];

export const workbookModuleContracts: WorkbookModuleContract[] = [
  {
    slug: "vision-overview",
    sheetName: "VISAO GERAL",
    sheetState: "visible",
    phase: "Diagnostico",
    purpose: "Consolidar status, maturidade e trilha de desenvolvimento da empresa.",
    fields: [
      ...statusFields,
      {
        ref: "C16:I16",
        label: "Status consolidado dos modulos",
        kind: "formula",
        formula: "INDEX(MODELO!$A$2:$A$4, aba!A1)",
        helper: "Resultado calculado a partir do status de cada aba.",
      },
      {
        ref: "C33:G37",
        label: "Resumo de captacao",
        kind: "formula",
        formula: "Referencias e IFs sobre Captação de investimentos",
        helper: "A visao geral apenas le dados publicados em outras abas.",
      },
    ],
    aiReviewFocus: [
      "Explicar gargalos entre modulos concluidos e em andamento.",
      "Priorizar a proxima mentoria a partir de status e maturidade.",
    ],
    acceptanceChecks: [
      "Nao permitir edicao direta de status calculado.",
      "Mostrar origem dos dados usados na consolidacao.",
    ],
  },
  {
    slug: "company-info",
    sheetName: "Informações da empresa",
    sheetState: "visible",
    phase: "Diagnostico",
    purpose: "Registrar identidade, descricao e socios da empresa.",
    fields: [
      ...statusFields,
      { ref: "C4", label: "Nome da empresa", kind: "input", helper: "Campo aberto." },
      { ref: "C5", label: "Descricao", kind: "input", helper: "Campo aberto." },
      { ref: "C7:C12", label: "Socios", kind: "input", helper: "Campos abertos." },
    ],
    aiReviewFocus: [
      "Avaliar clareza institucional e lacunas de equipe.",
      "Sugerir evidencias para formalizacao e governanca.",
    ],
    acceptanceChecks: [
      "Salvar dados por organizacao.",
      "Registrar alteracoes no historico.",
    ],
  },
  {
    slug: "gf-sensor-initial",
    sheetName: "GF-SENSOR (inicial)",
    sheetState: "visible",
    phase: "Diagnostico",
    purpose: "Criar o baseline de maturidade da empresa em 16 dimensoes.",
    fields: [
      ...statusFields,
      {
        ref: "E4:E19",
        label: "Respostas do sensor",
        kind: "select",
        source: "Blocos E22:E85 da propria aba",
        helper: "Cada linha preserva as quatro opcoes originais da planilha.",
      },
      {
        ref: "F4:F19",
        label: "Score calculado",
        kind: "formula",
        formula: "LEFT(E4,1)+0",
        helper: "A nota vem da opcao selecionada e nao deve ser editada diretamente.",
      },
    ],
    aiReviewFocus: [
      "Explicar os pontos mais fracos do baseline.",
      "Separar risco de mercado, produto, equipe e financeiro.",
    ],
    acceptanceChecks: [
      "Cada pergunta deve ser um select.",
      "A coluna de score deve ser somente leitura.",
    ],
  },
  {
    slug: "gf-sensor-current",
    sheetName: "GF-SENSOR (atual)",
    sheetState: "visible",
    phase: "Diagnostico",
    purpose: "Medir evolucao atual contra o baseline inicial.",
    fields: [
      ...statusFields,
      {
        ref: "E4:E19",
        label: "Respostas atuais",
        kind: "select",
        source: "Blocos E22:E85 da propria aba",
        helper: "Preserva as mesmas opcoes do sensor inicial.",
      },
      {
        ref: "F4:F19",
        label: "Score atual",
        kind: "formula",
        formula: "LEFT(E4,1)+0",
        helper: "Resultado calculado a partir das respostas atuais.",
      },
    ],
    aiReviewFocus: [
      "Comparar evolucao entre sensor inicial e atual.",
      "Apontar dimensoes sem progresso e proximas acoes.",
    ],
    acceptanceChecks: [
      "Comparativo deve usar as mesmas 16 dimensoes.",
      "Mudancas devem gerar historico de publicacao.",
    ],
  },
  {
    slug: "market-analysis",
    sheetName: "Tamanho de Mercado",
    sheetState: "visible",
    phase: "Mercado",
    purpose: "Mapear mercado, segmentos, premissas e oportunidade.",
    fields: [
      ...statusFields,
      ...standardTextFields,
      {
        ref: "D3",
        label: "Tamanho de mercado",
        kind: "reference",
        helper: "Intervalo nomeado TamanhoMercado usado por outras formulas.",
      },
    ],
    aiReviewFocus: [
      "Questionar fontes de TAM, SAM e SOM.",
      "Diferenciar mercado de games e empresas gerais quando aplicavel.",
    ],
    acceptanceChecks: [
      "Exigir fonte ou evidencia para estimativas.",
      "Nao calcular mercado sem premissas registradas.",
    ],
  },
  {
    slug: "competitors",
    sheetName: "Concorrência e Diferenciação",
    sheetState: "visible",
    phase: "Mercado",
    purpose: "Comparar concorrentes, alternativas e diferenciais.",
    fields: [...statusFields, ...standardTextFields],
    aiReviewFocus: [
      "Separar concorrente direto, indireto e substituto.",
      "Identificar diferenciacao defensavel.",
    ],
    acceptanceChecks: [
      "Pedir pelo menos uma evidencia por concorrente relevante.",
      "Mostrar riscos de paridade competitiva.",
    ],
  },
  {
    slug: "problem-analysis",
    sheetName: "Entendimento do problema",
    sheetState: "visible",
    phase: "Mercado",
    purpose: "Descrever problema, publico afetado, intensidade e validacao.",
    fields: [...statusFields, ...standardTextFields],
    aiReviewFocus: [
      "Distinguir descricao de produto e problema real do cliente.",
      "Sugerir entrevistas e testes de validacao.",
    ],
    acceptanceChecks: [
      "Solicitar evidencia qualitativa ou quantitativa.",
      "Nao aceitar conclusao sem problema claro.",
    ],
  },
  {
    slug: "empathy-map",
    sheetName: "Mapa de Empatia",
    sheetState: "visible",
    phase: "Mercado",
    purpose: "Organizar dores, ganhos, pensamentos e comportamentos do cliente.",
    fields: [...standardTextFields],
    aiReviewFocus: [
      "Transformar observacoes em hipoteses testaveis.",
      "Apontar lacunas de descoberta de cliente.",
    ],
    acceptanceChecks: ["Preservar campos abertos por quadrante do canvas."],
  },
  {
    slug: "influence-map",
    sheetName: "Mapa de Influência",
    sheetState: "visible",
    phase: "Mercado",
    purpose: "Identificar atores que influenciam compra, uso e distribuicao.",
    fields: [...standardTextFields],
    aiReviewFocus: [
      "Separar decisor, usuario, influenciador e parceiro.",
      "Sugerir estrategia por stakeholder.",
    ],
    acceptanceChecks: ["Permitir revisao de mentor por grupo de influencia."],
  },
  {
    slug: "value-chain",
    sheetName: "Cadeia de Valor",
    sheetState: "visible",
    phase: "Produto",
    purpose: "Mapear atividades, recursos e parceiros que criam valor.",
    fields: [...statusFields, ...standardTextFields],
    aiReviewFocus: [
      "Encontrar gargalos operacionais.",
      "Conectar cadeia de valor a custos e milestones.",
    ],
    acceptanceChecks: ["Relacionar atividades criticas a responsaveis."],
  },
  {
    slug: "value-proposition-canvas",
    sheetName: "Canvas da Proposta de Valor",
    sheetState: "visible",
    phase: "Produto",
    purpose: "Avaliar encaixe entre dores, ganhos e proposta entregue.",
    fields: [...standardTextFields],
    aiReviewFocus: [
      "Checar se a proposta responde ao problema validado.",
      "Sugerir mensagens por publico.",
    ],
    acceptanceChecks: ["Ligar proposta a evidencias de cliente."],
  },
  {
    slug: "buyer-persona",
    sheetName: "Buyer Persona",
    sheetState: "visible",
    phase: "Mercado",
    purpose: "Detalhar perfil de comprador, usuario ou decisor.",
    fields: [...statusFields, ...standardTextFields],
    aiReviewFocus: [
      "Distinguir persona de usuario e buyer persona.",
      "Sugerir segmentacao por comportamento.",
    ],
    acceptanceChecks: ["Manter persona conectada a entrevistas e dados."],
  },
  {
    slug: "customer-journey",
    sheetName: "Jornada do cliente",
    sheetState: "visible",
    phase: "Produto",
    purpose: "Mapear descoberta, consideracao, compra, uso e expansao.",
    fields: [...statusFields, ...standardTextFields],
    aiReviewFocus: [
      "Apontar friccoes e eventos que devem ser medidos.",
      "Sugerir experimentos por etapa da jornada.",
    ],
    acceptanceChecks: ["Separar touchpoints, dores e acoes de melhoria."],
  },
  {
    slug: "pricing",
    sheetName: "Precificação",
    sheetState: "visible",
    phase: "Financeiro",
    purpose: "Calcular preco a partir de custos, margem e descontos.",
    fields: [
      ...statusFields,
      {
        ref: "D4:D10",
        label: "Custos e percentuais",
        kind: "input",
        helper: "Campos abertos que alimentam o calculo de preco.",
      },
      {
        ref: "D11",
        label: "Preco calculado",
        kind: "formula",
        formula: "SUM(D4:D8)*(1+D9)*(1+D10)",
        helper: "Resultado somente leitura derivado dos custos e percentuais.",
      },
    ],
    aiReviewFocus: [
      "Comparar preco, margem e posicionamento.",
      "Sugerir testes de willingness to pay.",
    ],
    acceptanceChecks: [
      "Nao permitir edicao do preco calculado.",
      "Mostrar premissas usadas no calculo.",
    ],
  },
  {
    slug: "product-info",
    sheetName: "Informações do produto",
    sheetState: "visible",
    phase: "Produto",
    purpose: "Registrar produtos, regime tributario, familia e impostos.",
    fields: [
      ...statusFields,
      {
        ref: "D3",
        label: "Regime tributario",
        kind: "select",
        options: ["Simples Nacional", "Lucro Presumido"],
        helper: "Select preservado da planilha.",
      },
      {
        ref: "D4",
        label: "Familia/produto",
        kind: "select",
        source: "Listas!$G$2:$G$41",
        helper: "Lista interna de tipos de produto.",
      },
      {
        ref: "D5",
        label: "Anexo Simples Nacional",
        kind: "select",
        options: ["ANEXO 1", "ANEXO 2", "ANEXO 3", "ANEXO 4", "ANEXO 5"],
        helper: "Select preservado.",
      },
      {
        ref: "D7",
        label: "Aliquota Lucro Presumido",
        kind: "formula",
        formula: 'INDEX(Listas!$D$2:$D$5,MATCH("Sim",Listas!$E$2:$E$5,0))',
        helper: "Resultado fiscal calculado a partir da aba Listas.",
      },
    ],
    aiReviewFocus: [
      "Revisar coerencia entre produto, receita e impostos.",
      "Apontar riscos fiscais e premissas ausentes.",
    ],
    acceptanceChecks: [
      "Preservar selects fiscais.",
      "Tratar tabelas da aba Listas como referencia interna.",
    ],
  },
  {
    slug: "finance-24m",
    sheetName: "Projeção Financeira (24 meses)",
    sheetState: "visible",
    phase: "Financeiro",
    purpose: "Projetar receitas, custos, caixa e runway mensal.",
    fields: [
      ...statusFields,
      {
        ref: "D15:AA87",
        label: "Linhas financeiras mensais",
        kind: "input",
        helper: "Entradas abertas alimentam totais e caixa.",
      },
      {
        ref: "D5:AA87",
        label: "Totais, impostos e caixa",
        kind: "formula",
        formula: "SUM, EOMONTH e referencias de produto",
        helper: "Resultados calculados a partir das premissas mensais.",
      },
    ],
    aiReviewFocus: [
      "Identificar meses de caixa negativo e premissas frageis.",
      "Comparar crescimento, custos e necessidade de captacao.",
    ],
    acceptanceChecks: [
      "Recalcular caixa apos salvar receita/custos.",
      "Manter meses e totais calculados somente leitura.",
    ],
  },
  {
    slug: "milestones",
    sheetName: "Marcos de Desenvolvimento",
    sheetState: "visible",
    phase: "Execucao",
    purpose: "Definir marcos, entregas, datas e status.",
    fields: [
      ...statusFields,
      {
        ref: "H12:I47",
        label: "Datas de inicio e fim",
        kind: "input",
        helper: "Campos abertos com validacao de fim maior que inicio.",
      },
      {
        ref: "I12:I47",
        label: "Validacao de data final",
        kind: "formula",
        formula: "I12>H12",
        helper: "Regra de validacao da planilha.",
      },
      {
        ref: "J12:J47",
        label: "Status do marco",
        kind: "select",
        source: "$G$7:$G$9",
        helper: "Select preservado para status de execucao.",
      },
    ],
    aiReviewFocus: [
      "Detectar marcos sem criterio de aceite.",
      "Sugerir dependencias e buffers de risco.",
    ],
    acceptanceChecks: [
      "Bloquear data final menor que inicial.",
      "Atualizar Gantt a partir dos marcos.",
    ],
  },
  {
    slug: "finance-5y",
    sheetName: "Projeção Financeira (5 anos)",
    sheetState: "visible",
    phase: "Financeiro",
    purpose: "Projetar receita, lucro, impostos e caixa anual.",
    fields: [
      ...statusFields,
      {
        ref: "D15:H87",
        label: "Premissas anuais",
        kind: "input",
        helper: "Entradas abertas para cenarios anuais.",
      },
      {
        ref: "F67:H67",
        label: "Tributacao anual",
        kind: "formula",
        formula: "IF(RegimeTributário=\"Lucro Presumido\", ..., Simples Nacional)",
        helper: "Formula fiscal baseada em regime, anexo e tabelas da aba Listas.",
      },
    ],
    aiReviewFocus: [
      "Checar coerencia entre 24 meses e 5 anos.",
      "Apontar otimismo excessivo ou lacunas de custo.",
    ],
    acceptanceChecks: ["Guardar cenario publicado como snapshot imutavel."],
  },
  {
    slug: "gantt-items",
    sheetName: "Gantt - Marcos de Desenvolvimen",
    sheetState: "visible",
    phase: "Execucao",
    purpose: "Visualizar cronograma derivado dos marcos.",
    fields: [
      ...statusFields,
      {
        ref: "E5:CN47",
        label: "Grade Gantt",
        kind: "formula",
        formula: 'IF(AND(mes>=inicio,mes<=fim),"x","")',
        helper: "Visualizacao calculada; a edicao acontece em Marcos de Desenvolvimento.",
      },
    ],
    aiReviewFocus: [
      "Interpretar conflitos de agenda e concentracao de entregas.",
      "Sugerir sequenciamento por risco.",
    ],
    acceptanceChecks: ["Nao editar Gantt diretamente; atualizar via marcos."],
  },
  {
    slug: "pitch-script",
    sheetName: "Roteiro de Pitch",
    sheetState: "visible",
    phase: "Execucao",
    purpose: "Estruturar narrativa para investidores, parceiros e comite.",
    fields: [...statusFields, ...standardTextFields],
    aiReviewFocus: [
      "Ajustar narrativa para problema, solucao, mercado, tracao e pedido.",
      "Sugerir cortes para versoes de 3, 7 e 12 minutos.",
    ],
    acceptanceChecks: ["Relacionar pitch a evidencias ja preenchidas nos modulos."],
  },
  {
    slug: "fundraising",
    sheetName: "Captação de investimentos",
    sheetState: "visible",
    phase: "Financeiro",
    purpose: "Acompanhar rodada, valor necessario, captado, valuation e investidores.",
    fields: [
      ...statusFields,
      {
        ref: "D4:D8",
        label: "Status da captacao",
        kind: "select",
        options: [
          "Decisao investimento",
          "Valor necessario",
          "Valuation",
          "Investimento captado parcialmente",
          "Investimento captado",
        ],
        helper: "Select preservado da planilha.",
      },
      {
        ref: "G4:G8",
        label: "Percentual captado",
        kind: "formula",
        formula: 'IFERROR(F4/E4,"")',
        helper: "Resultado calculado a partir de alvo e captado.",
      },
      {
        ref: "J4:J8",
        label: "Valuation por investidor",
        kind: "formula",
        formula: 'IFERROR(E4/I4,"")',
        helper: "Resultado calculado.",
      },
    ],
    aiReviewFocus: [
      "Checar coerencia entre uso do capital, runway e milestones.",
      "Sugerir riscos de diluicao e narrativa de round.",
    ],
    acceptanceChecks: [
      "Preservar select de status da rodada.",
      "Calcular percentuais sem edicao manual.",
    ],
  },
  {
    slug: "competencies",
    sheetName: "Avaliação de competências",
    sheetState: "visible",
    phase: "Execucao",
    purpose: "Avaliar gaps de tecnologia, mercado e gestao.",
    fields: [
      ...statusFields,
      {
        ref: "D6:L6",
        label: "Notas de competencia",
        kind: "select",
        options: ["1", "2", "3"],
        helper: "Select numerico preservado da planilha.",
      },
      {
        ref: "D12:L13",
        label: "Leitura consolidada",
        kind: "formula",
        formula: 'IF(D4=0,"Nao definido",D4)',
        helper: "Resultados calculados para leitura de gaps.",
      },
    ],
    aiReviewFocus: [
      "Identificar competencias criticas faltantes.",
      "Conectar gaps a contratacoes, advisors ou parceiros.",
    ],
    acceptanceChecks: [
      "Notas sao selects; resultados sao somente leitura.",
      "Gaps devem gerar proximo passo acompanhavel.",
    ],
  },
];

export const hiddenWorkbookTables = [
  {
    sheetName: "MODELO",
    purpose: "Status padrao usados pelos modulos.",
    refs: ["A2:A4"],
  },
  {
    sheetName: "Listas",
    purpose: "Tabelas fiscais, Simples Nacional, referencias mensais e anuais.",
    refs: [
      "G2:G41",
      "A2:A16",
      "O4:P50",
      "Q4:R10",
      "RefMensalSimples",
      "RefAnualSimples",
    ],
  },
];

export function getWorkbookContract(slug: string) {
  return workbookModuleContracts.find((contract) => contract.slug === slug);
}

export function getWorkbookContractsByPhase(phase: WorkbookModuleContract["phase"]) {
  return workbookModuleContracts.filter((contract) => contract.phase === phase);
}

export function getFieldCounts(contract: WorkbookModuleContract) {
  return contract.fields.reduce(
    (counts, field) => {
      counts[field.kind] += 1;
      return counts;
    },
    {
      input: 0,
      select: 0,
      formula: 0,
      reference: 0,
    } satisfies Record<WorkbookFieldKind, number>,
  );
}

export function getModuleAiFeedback(
  module: ModuleDefinition,
  contract: WorkbookModuleContract,
) {
  const missingEvidence = module.form.evidence.trim().length < 40;
  const lowProgress = module.progress < 65;
  const hasFormula = contract.fields.some((field) => field.kind === "formula");
  const hasSelect = contract.fields.some((field) => field.kind === "select");
  const signals = [
    lowProgress
      ? "Modulo ainda precisa de preenchimento antes de uma avaliacao executiva."
      : "Modulo tem base suficiente para gerar feedback comparativo.",
    missingEvidence
      ? "Evidencias ainda parecem curtas; a avaliacao com IA deve pedir fonte, dado ou anexo."
      : "Evidencias registradas podem ser usadas para justificar o parecer.",
    hasFormula
      ? "Campos calculados devem aparecer como resultado protegido e auditavel."
      : "Avaliacao depende principalmente de qualidade textual e evidencias.",
    hasSelect
      ? "Selects precisam preservar as opcoes da planilha para manter comparabilidade."
      : "Campos abertos exigem validacao por mentor ou admin.",
  ];

  return signals;
}

