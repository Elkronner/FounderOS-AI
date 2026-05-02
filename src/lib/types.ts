export type Role = "founder" | "member" | "mentor" | "admin";

export type ModuleStatus = "nao_iniciado" | "em_andamento" | "concluido";

export type ModuleArea =
  | "Estratégia"
  | "Mercado"
  | "Produto"
  | "Financeiro"
  | "Execução"
  | "Captação";

export type ModuleFormData = {
  summary: string;
  priorities: string;
  evidence: string;
  risks: string;
  nextStep: string;
};

export type ModuleDefinition = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  area: ModuleArea;
  status: ModuleStatus;
  progress: number;
  maturity: number;
  nextAction: string;
  mentorComment: string;
  ostenFeedback: string;
  form: ModuleFormData;
  details?: unknown;
};

export type SensorPoint = {
  dimension: string;
  initial: number;
  current: number;
};

export type SensorWorkbookQuestion = {
  dimension: string;
  options: string[];
};

export type SensorWorkbookDetails = {
  responses: string[];
};

export type RevenuePoint = {
  month: string;
  receita: number;
  custos: number;
  caixa: number;
};

export type Finance24mDetails = ModuleFormData & {
  startDate?: string;
  openingCash?: number;
  monthly: RevenuePoint[];
};

export type Finance5yPoint = {
  year: string;
  receita: number;
  lucroLiquido: number;
  caixa: number;
};

export type RoadmapItem = {
  id: string;
  title: string;
  owner: string;
  quarter: string;
  status: "planejado" | "em_execucao" | "entregue";
  completion: number;
};

export type ActivityLog = {
  id: string;
  actor: string;
  role: Role;
  action: string;
  target: string;
  when: string;
};

export type CommentThread = {
  id: string;
  author: string;
  role: Role;
  moduleSlug: string;
  message: string;
  createdAt: string;
};

export type StartupRecord = {
  id: string;
  studioName: string;
  legalName: string;
  email: string;
  cohort: string;
  mentor: string;
  nextMeeting: string;
  monthlyMentorships: number;
  createdAt: string;
  updatedAt: string;
};

export type CompanyPartner = {
  name: string;
  role: string;
  equityPercent: number;
  email: string;
  whatsapp: string;
};

export type CompanyInfoDetails = {
  companyName: string;
  legalName: string;
  cnpj: string;
  website: string;
  location: string;
  stage: string;
  description: string;
  partners: CompanyPartner[];
};

export type PricingCostItem = {
  label: string;
  value: number;
};

export type PricingDetails = {
  productName: string;
  productType: string;
  directCosts: PricingCostItem[];
  taxRatePercent: number;
  marginPercent: number;
  discountPercent: number;
  monthlyUnits: number;
  competitorPriceLow: number;
  competitorPriceHigh: number;
  positioning: string;
  idealPriceRange: string;
  cltSalary: number;
};

export type ProductLineItem = {
  name: string;
  category: string;
  price: number;
  quantity: number;
  pisPercent: number;
  cofinsPercent: number;
  icmsPercent: number;
  issPercent: number;
};

export type ProductInfoDetails = {
  taxRegime: string;
  productFamily: string;
  taxProductType: string;
  anexo: string;
  lucroPresumidoPercent: number;
  cltSalary: number;
  cltBenefitsPercent: number;
  cltEncargosPercent: number;
  products: ProductLineItem[];
};

export type FundingRound = {
  roundName: string;
  status: string;
  targetAmount: number;
  raisedAmount: number;
  percentRaised: number;
  investors: number;
  equityOfferedPercent: number;
  valuation: number;
};

export type FundingDetails = {
  strategy: string;
  targetAmount: number;
  runwayMonths: number;
  roundLead: string;
  rounds: FundingRound[];
};

export type StudioSummary = {
  name: string;
  cycle: string;
  health: number;
  pendingAlerts: number;
  mentorName: string;
  nextMeeting: string;
  monthlyMentorships: number;
};

export type GameformSnapshot = {
  startup: StartupRecord;
  modules: ModuleDefinition[];
  sensorComparison: SensorPoint[];
  finance24m: RevenuePoint[];
  finance5y: Finance5yPoint[];
  roadmapItems: RoadmapItem[];
  comments: CommentThread[];
  activityLogs: ActivityLog[];
  lastUpdatedAt: string;
};
