import type { Finance5yPoint, RevenuePoint, SensorPoint } from "./types";
import type {
  WorkbookCellDefinition,
  WorkbookRowDefinition,
  WorkbookSheetDefinition,
} from "./workbook-editor";

const sensorLabels = [
  "Modelo ou plano de negócio",
  "Equipe",
  "Validação do problema do público-alvo",
  "Validação do público-alvo",
  "Proposta de valor",
  "Desenvolvimento do produto/serviço",
  "Concorrência",
  "Canais de venda",
  "Modelo de receita (como ganha dinheiro)",
  "Métricas-chave do negócio",
  "Diferenciais competitivos",
  "Tamanho de mercado",
  "Vendas",
  "Relacionamento com o cliente",
  "Atividades, recursos e parcerias-chave",
  "Projeção financeira e estrutura de custos",
] as const;

const sensorInitialScores = [1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2];
const sensorCurrentScores = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

export const sensorWorkbookQuestions = [
  {
    dimension: "Modelo ou plano de negócio",
    options: [
      "1. Tenho a ideia do negócio, mas não está planificada ou documentada em lugar nenhum (sei de cabeça)",
      "2. Já preenchi mapas mentais do meu negócio, como Lean Canvas ou Business Model Canvas",
      "3. Além de mapas mentais, tenho um plano em mente para desenvolver o modelo de negócio, mas ainda não documentei como vou executá-lo",
      "4. Tenho um plano do meu negócio, com métricas, metas e o \"como executar\" bem definidos",
    ],
  },
  {
    dimension: "Equipe",
    options: [
      "1. Sou o único na equipe, ou sou quem toma todas as decisões finais",
      "2. Tenho pelo menos um sócio, mas nos falta uma ou mais competências (Ex.: não temos desenvolvedor próprio, ou somos técnicos e não trabalhamos com marketing)",
      "3. Tenho pelo menos um sócio e garantimos as competências de gestão, marketing e técnica, seja por nós ou por uma pequena equipe de funcionários",
      "4. Temos uma equipe completa, de tamanho adequado e com funções definidas e distribuídas, entre departamentos ou especialistas.",
    ],
  },
  {
    dimension: "Validação do problema do público-alvo",
    options: [
      "1. Não sei ou nunca pensei em qual problema eu resolvo, mas sei descrever o produto/serviço que idealizei",
      "2. Sei o problema, mas não validei ainda ou não sei descrevê-lo com detalhes e exemplos",
      "3. Sei o problema e tenho dados, relatos e histórias para demonstrar",
      "4. Sei o problema, seus níveis para cada cliente, e sei quem tem o problema mais urgente (Early Adopters)",
    ],
  },
  {
    dimension: "Validação do público-alvo",
    options: [
      "1. Não pensei sobre isso ainda",
      "2. Tenho uma visão ampla de quem pode se beneficiar do meu produto/serviço (Ex.: micro e pequenas empresas, 15-24 anos, etc.)",
      "3. Meu público-alvo está bem definido, com características específicas conhecidas, mas ainda não tenho relatos e histórias para validá-las",
      "4. Eu conheço bem as histórias do meu público-alvo, e consigo criar personas que o represente (Buyer Persona, um exemplo fictício de como se comporta seu cliente)",
    ],
  },
  {
    dimension: "Proposta de valor",
    options: [
      "1. Eu tenho um produto, serviço ou ideia, mas não pensei em qual valor ele entrega ou que é percebido",
      "2. Sei descrever como o produto/serviço funciona, mas não sei explicar qual o valor que entrega",
      "3. Tenho uma proposta de valor, que representa a cultura que defendo, mas não sei se o cliente \"vê\" isso como valor (não validado)",
      "4. Tenho uma proposta de valor clara e conectada ao problema/necessidade do público-alvo (validado)",
    ],
  },
  {
    dimension: "Desenvolvimento do produto/serviço",
    options: [
      "1. Eu ainda não tenho um produto/serviço, somente a ideia dele",
      "2. Eu consigo apresentar uma representação do produto/serviço, mas que não resolve o problema (PowerPoint, por exemplo, chamado MVP de baixa fidelidade)",
      "3. Consigo resolver o problema do cliente, simulando como meu produto/serviço, mas não ainda não é o produto completo (grupo de Whatsapp, por exemplo, chamado MVP de alta fidelidade)",
      "4. Já tenho ao menos uma primeira versão ou protótipo do produto/serviço rodando, com todas as funcionalidades necessárias para resolver o problema do cliente",
    ],
  },
  {
    dimension: "Concorrência",
    options: [
      "1. Não pesquisei ou não ouvi falar de concorrentes para minha solução (produto/serviço)",
      "2. Sei de empresas ou iniciativas que entregam o mesmo produto/serviço que eu e posso listá-las",
      "3. Sei indicar soluções (produtos/serviços) que resolvem o mesmo problema que eu, mesmo que sejam soluções diferentes da minha (Ex.: cinema vs teatro resolvem a mesma necessidade de entretenimento, então concorrem)",
      "4. Sei indicar meus concorrentes, mas também sei em qual o meu diferencial em relação a eles",
    ],
  },
  {
    dimension: "Canais de venda",
    options: [
      "1. Não pensei nisso ainda",
      "2. Já defini canais de venda possíveis, mas não os testei ou validei com o público-alvo",
      "3. Já defini e validei meus canais de venda, e sei qual é o principal ou que funciona melhor",
      "4. Já validei e desenvolvi meus canais de venda, e estão em operação/funcionando",
    ],
  },
  {
    dimension: "Modelo de receita (como ganha dinheiro)",
    options: [
      "1. Não pensei nisso ainda, ou não sei como e com quem vou ganhar dinheiro",
      "2. Já defini uma forma de ganhar dinheiro, mas ainda não validei se é possível e se o público-alvo se interessará",
      "3. Já defini uma forma de ganhar dinheiro e a testei/validei com meu público alvo",
      "4. Meu modelo de receita está definido e considera os custos/despesas da empresa, além do interesse do público-alvo",
    ],
  },
  {
    dimension: "Métricas-chave do negócio",
    options: [
      "1. Não pensei nisso ainda, ou ainda não sei o que é mais importante medir",
      "2. Já tenho dados de pesquisas e características do meu público-alvo, sejam de fontes secundárias ou primárias",
      "3. Além de dados dos meus clientes, tenho informações relativas ao meu processo de venda e usá-los para analisar a melhor estratégia de venda",
      "4. Tenho um histórico de dados do público-alvo e de vendas suficiente para estimar meu crescimento e saúde do negócio (CAC, Lifetime Value, Churn, MMR, etc.)",
    ],
  },
  {
    dimension: "Diferenciais competitivos",
    options: [
      "1. Não pensei nisso ainda, ou não tenho informações suficientes do mercado para definir o diferencial",
      "2. Já conheço padrões do mercado e sei as principais práticas dos concorrentes",
      "3. Conheço os padrões do mercado e defini um diferencial bom base na concorrência",
      "4. Tenho uma estratégia de diferenciação baseada no conhecimento do público-alvo e com barreira de entrada para a concorrência (velocidade de inovação, patente ou força de marca)",
    ],
  },
  {
    dimension: "Tamanho de mercado",
    options: [
      "1. Não sei qual é o tamanho do meu mercado, ou não pesquisei isso ainda",
      "2. Sei de forma geral qual o tamanho do meu mercado",
      "3. Sei o tamanho do mercado dentro do perfil de meu público-alvo",
      "4. Sei o tamanho do mercado e suas tendências com base no público-alvo",
    ],
  },
  {
    dimension: "Vendas",
    options: [
      "1. Não fiz nenhuma venda ainda, ou não estou vendendo",
      "2. Já fiz as primeiras vendas, em um MVP ou com um protótipo, por exemplo",
      "3. Já estou vendendo com regularidade e tenho um processo de vendas definido, com jornada do cliente conhecida",
      "4. Já vendo regularmente e tenho boas taxas de conversão, lucro recorrente e sustentável (já passei do meu break-even)",
    ],
  },
  {
    dimension: "Relacionamento com o cliente",
    options: [
      "1. Atendo demandas pontuais que me apresentam, mas não tenho uma estratégia de relacionamento com eles",
      "2. Tenho estratégias de retenção e crescimento de clientes, mas não as testei/validei",
      "3. Tenho estratégias de retenção e crescimento de clientes já testadas, ao menos em MVP ou protótipo",
      "4. Tenho estratégias definidas, operando e a estrutura da empresa é adequada para sustentá-las e crescer meu negócio (tenho parcerias, recursos, pessoal, etc. para executá-las)",
    ],
  },
  {
    dimension: "Atividades, recursos e parcerias-chave",
    options: [
      "1. Meu negócio está mais inicial, então ainda não pensei ou executei essa parte",
      "2. Já defini como será a estrutura do negócio (as atividades, recursos e parcerias necessárias), mas não a testei/validei na prática ainda",
      "3. Já defini e validei a estrutura na prática, as atividades se adequam à minha proposta de valor",
      "4. A estrutura e organização já está definida e operante, com responsáveis por cada atribuição (sócios, departamentos, funcionários, etc.)",
    ],
  },
  {
    dimension: "Projeção financeira e estrutura de custos",
    options: [
      "1. Ainda não sei todos os custos envolvidos na operação da empresa, ou ainda não estou operando",
      "2. Tenho uma projeção financeira simplificada com base no modelo ou plano de negócio, mas o negócio ainda não está operando para testá-la/validá-la",
      "3. Tenho uma projeção financeira com base nas primeiras vendas que realizei, que contempla ao menos 18 meses futuros",
      "4. Tenho uma projeção financeira e um plano de crescimento, que considera a evolução dos custos, marcos de desenvolvimento ou investimentos a serem capatados",
    ],
  },
];

const finance24mMonths = [
  "Jan/21",
  "Fev/21",
  "Mar/21",
  "Abr/21",
  "Mai/21",
  "Jun/21",
  "Jul/21",
  "Ago/21",
  "Set/21",
  "Out/21",
  "Nov/21",
  "Dez/21",
  "Jan/22",
  "Fev/22",
  "Mar/22",
  "Abr/22",
  "Mai/22",
  "Jun/22",
  "Jul/22",
  "Ago/22",
  "Set/22",
  "Out/22",
  "Nov/22",
  "Dez/22",
] as const;

const finance24mRevenue = [
  1500,
  12000,
  24000,
  36000,
  45000,
  52500,
  120000,
  195000,
  273980,
  352960,
  435920,
  518880,
  639340,
  763780,
  892200,
  1016640,
  1141080,
  1305010,
  1472920,
  1646800,
  1836600,
  2046300,
  2256000,
  2495700,
] as const;

const finance24mCosts = [
  1000,
  8000,
  16000,
  24000,
  30000,
  35000,
  80000,
  130000,
  180240,
  230480,
  280960,
  331440,
  406920,
  482640,
  558600,
  634320,
  710040,
  810880,
  911960,
  1013400,
  1115800,
  1219400,
  1323000,
  1446600,
] as const;

const finance24mCash = [
  188440,
  179960,
  175000,
  172867,
  173077,
  165239.5,
  172994.5,
  197004.5,
  241303.64,
  298585.36,
  380220.56,
  478573.36,
  599018.76,
  744540.56,
  918122.56,
  1116780.96,
  1340515.76,
  1596193.86,
  1886799.06,
  2216807.06,
  2598153.06,
  3045756.06,
  3559616.06,
  4144033.06,
] as const;

const finance5yYears = ["2021", "2022", "2023", "2024", "2025"] as const;

const finance5yRevenue = [
  2067740,
  17512370,
  21980000,
  32450000,
  40410000,
] as const;

const finance5yLucroLiquido = [
  278573.36,
  3665459.7,
  5131300,
  10252000,
  15993600,
] as const;

const finance5yCash = [
  478573.36,
  4144033.06,
  9275333.06,
  19527333.06,
  35520933.06,
] as const;

function sum(values: readonly number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function buildSensorResponses(scores: readonly number[]) {
  return sensorWorkbookQuestions.map((question, index) => {
    const targetScore = scores[index] ?? 1;
    return (
      question.options.find((option) => option.trim().startsWith(`${targetScore}.`)) ??
      question.options[0] ??
      `${targetScore}.`
    );
  });
}

function scoreSensorResponse(response: string) {
  const match = response.trim().match(/^(\d+)/);
  return match ? Number(match[1]) : 0;
}

function buildSensorWorkbookRow(
  question: (typeof sensorWorkbookQuestions)[number],
  response: string,
  rowNumber: number,
): WorkbookRowDefinition {
  const score = scoreSensorResponse(response);
  const cells: WorkbookCellDefinition[] = [
    {
      ref: `D${rowNumber}`,
      label: "Critério",
      kind: "label",
      value: `${rowNumber - 3}. ${question.dimension}`,
    },
    {
      ref: `E${rowNumber}`,
      label: "Seleção",
      kind: "select",
      value: response,
      options: question.options.map((option) => ({
        label: option,
        value: option,
      })),
      hint: "Celula editavel da planilha",
    },
    {
      ref: `F${rowNumber}`,
      label: "Score",
      kind: "formula",
      value: score,
      formula: `=LEFT(E${rowNumber},1)+0`,
      hint: "Celula de resultado calculada pela planilha",
    },
  ];

  return {
    title: question.dimension,
    cells,
  };
}

export function buildWorkbookSensorComparison(): SensorPoint[] {
  return sensorLabels.map((dimension, index) => ({
    dimension,
    initial: sensorInitialScores[index],
    current: sensorCurrentScores[index],
  }));
}

export function buildWorkbookSensorResponses() {
  return {
    initial: buildSensorResponses(sensorInitialScores),
    current: buildSensorResponses(sensorCurrentScores),
  };
}

export function buildSensorComparisonFromResponses(
  initialResponses: readonly string[],
  currentResponses: readonly string[],
): SensorPoint[] {
  return sensorWorkbookQuestions.map((question, index) => ({
    dimension: question.dimension,
    initial: scoreSensorResponse(initialResponses[index] ?? question.options[0] ?? "1"),
    current: scoreSensorResponse(currentResponses[index] ?? question.options[0] ?? "1"),
  }));
}

export function scoreWorkbookSensorResponse(response: string) {
  return scoreSensorResponse(response);
}

export function buildSensorWorkbookSheet(
  sheetId: "gf-sensor-initial" | "gf-sensor-current",
  responses: readonly string[],
): WorkbookSheetDefinition {
  return {
    sheetId,
    title: sheetId === "gf-sensor-initial" ? "GF-SENSOR (inicial)" : "GF-SENSOR (atual)",
    rows: sensorWorkbookQuestions.map((question, index) =>
      buildSensorWorkbookRow(
        question,
        responses[index] ?? question.options[0] ?? "",
        index + 4,
      ),
    ),
  };
}

export function buildWorkbookFinance24m(): RevenuePoint[] {
  return finance24mMonths.map((month, index) => ({
    month,
    receita: finance24mRevenue[index],
    custos: finance24mCosts[index],
    caixa: finance24mCash[index],
  }));
}

export function buildWorkbookFinance5y(): Finance5yPoint[] {
  return finance5yYears.map((year, index) => ({
    year,
    receita: finance5yRevenue[index],
    lucroLiquido: finance5yLucroLiquido[index],
    caixa: finance5yCash[index],
  }));
}

export function buildWorkbookFinance24mWithTotals() {
  return {
    monthly: buildWorkbookFinance24m(),
    totalRevenue: sum(finance24mRevenue),
    totalCosts: sum(finance24mCosts),
    totalCash: finance24mCash[finance24mCash.length - 1],
  };
}
