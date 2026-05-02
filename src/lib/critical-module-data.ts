import type {
  CompanyInfoDetails,
  FundingDetails,
  ProductInfoDetails,
  PricingDetails,
} from "./types";

export const criticalModuleSlugs = [
  "company-info",
  "pricing",
  "product-info",
  "fundraising",
] as const;

export type CriticalModuleSlug = (typeof criticalModuleSlugs)[number];

export const companyInfoDefaults: CompanyInfoDetails = {
  companyName: "Nebula Forge Studio",
  legalName: "Nebula Forge Games LTDA",
  cnpj: "00.000.000/0001-00",
  website: "https://nebulaforge.com",
  location: "Sao Paulo, BR",
  stage: "Aceleracao",
  description: "Studio focado em jogos multiplayer de PC e console com operacao hibrida.",
  partners: [
    {
      name: "Ana Forge",
      role: "CEO",
      equityPercent: 45,
      email: "ana@nebulaforge.com",
      whatsapp: "+55 11 99999-0001",
    },
    {
      name: "Bruno Forge",
      role: "CTO",
      equityPercent: 35,
      email: "bruno@nebulaforge.com",
      whatsapp: "+55 11 99999-0002",
    },
    {
      name: "Carla Forge",
      role: "COO",
      equityPercent: 20,
      email: "carla@nebulaforge.com",
      whatsapp: "+55 11 99999-0003",
    },
  ],
};

export const pricingDefaults: PricingDetails = {
  productName: "Precificacao workbook",
  productType: "revenda de mercadorias",
  directCosts: [
    { label: "Custos materia prima", value: 20 },
    { label: "Custos mao de obra", value: 10 },
    { label: "Custos de entrega", value: 50 },
    { label: "Custos com marketing e vendas", value: 25 },
    { label: "Rateio custo operacional", value: 5 },
  ],
  taxRatePercent: 7,
  marginPercent: 25,
  discountPercent: 0,
  monthlyUnits: 1,
  competitorPriceLow: 75,
  competitorPriceHigh: 250,
  positioning: "> qualidade",
  idealPriceRange: "R$ 220 - R$ 240",
  cltSalary: 2500,
};

export const productInfoDefaults: ProductInfoDetails = {
  taxRegime: "Simples Nacional",
  productFamily: "Venda de mercadorias ou produtos",
  taxProductType: "Produto",
  anexo: "ANEXO 1",
  lucroPresumidoPercent: 0.08,
  cltSalary: 2500,
  cltBenefitsPercent: 0.08,
  cltEncargosPercent: 0.09,
  products: [
    {
      name: "Produto 1",
      category: "Produto",
      price: 1500,
      quantity: 1,
      pisPercent: 0.0065,
      cofinsPercent: 0.03,
      icmsPercent: 0.16,
      issPercent: 0,
    },
    {
      name: "Produto 2",
      category: "Produto",
      price: 3000,
      quantity: 1,
      pisPercent: 0.0065,
      cofinsPercent: 0.03,
      icmsPercent: 0.16,
      issPercent: 0,
    },
    {
      name: "Serviço 1",
      category: "Servico",
      price: 499,
      quantity: 1,
      pisPercent: 0.0065,
      cofinsPercent: 0.03,
      icmsPercent: 0,
      issPercent: 0.05,
    },
    {
      name: "Plano de assinatura 1",
      category: "Assinatura",
      price: 199,
      quantity: 1,
      pisPercent: 0.0065,
      cofinsPercent: 0.03,
      icmsPercent: 0,
      issPercent: 0.05,
    },
    {
      name: "Produto 5",
      category: "Produto",
      price: 0,
      quantity: 0,
      pisPercent: 0,
      cofinsPercent: 0,
      icmsPercent: 0,
      issPercent: 0,
    },
    {
      name: "Produto 6",
      category: "Produto",
      price: 0,
      quantity: 0,
      pisPercent: 0,
      cofinsPercent: 0,
      icmsPercent: 0,
      issPercent: 0,
    },
  ],
};

export const fundingDefaults: FundingDetails = {
  strategy: "Investimento captado",
  targetAmount: 1600000,
  runwayMonths: 24,
  roundLead: "Osten Games",
  rounds: [
    {
      roundName: "1ª rodada de investimento",
      status: "Concluido",
      targetAmount: 100000,
      raisedAmount: 100000,
      percentRaised: 1,
      investors: 0,
      equityOfferedPercent: 10,
      valuation: 1000000,
    },
    {
      roundName: "2ª rodada de investimento",
      status: "Concluido",
      targetAmount: 500000,
      raisedAmount: 500000,
      percentRaised: 1,
      investors: 0,
      equityOfferedPercent: 10,
      valuation: 5000000,
    },
    {
      roundName: "3ª rodada de investimento",
      status: "Parcial",
      targetAmount: 1000000,
      raisedAmount: 500000,
      percentRaised: 0.5,
      investors: 1,
      equityOfferedPercent: 10,
      valuation: 10000000,
    },
    {
      roundName: "4ª rodada de investimento",
      status: "",
      targetAmount: 0,
      raisedAmount: 0,
      percentRaised: 0,
      investors: 0,
      equityOfferedPercent: 0,
      valuation: 0,
    },
    {
      roundName: "5ª rodada de investimento",
      status: "",
      targetAmount: 0,
      raisedAmount: 0,
      percentRaised: 0,
      investors: 0,
      equityOfferedPercent: 0,
      valuation: 0,
    },
  ],
};

function filledText(value: string | undefined | null) {
  return Boolean(value && value.trim().length >= 3);
}

function filledNumber(value: number | undefined | null) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function scorePresence(parts: Array<boolean>) {
  if (!parts.length) return 0;
  const filled = parts.filter(Boolean).length;
  return Math.round((filled / parts.length) * 100);
}

function getWorkbookInssRate(salary: number) {
  if (salary <= 1751.81) {
    return 0.08;
  }

  if (salary <= 2919.72) {
    return 0.09;
  }

  return 0.11;
}

function calculateWorkbookCltTotal(salary: number) {
  const inssRate = getWorkbookInssRate(salary);
  const fgtsMonthly = salary * 0.08;
  const inssMonthly = salary * inssRate;
  const vacationProvision = salary / 12;
  const vacationInssProvision = (salary * inssRate) / 12;
  const oneThirdVacationProvision = salary / 36;
  const oneThirdVacationInssProvision = (salary / 3) * inssRate / 12;
  const thirteenthProvision = salary / 12;
  const thirteenthInssProvision = (salary * inssRate) / 12;
  const fgtsAnnualProvision = (salary * 2.3333333333333335 * 0.08) / 12;

  return {
    inssRate,
    fgtsMonthly,
    inssMonthly,
    monthlyProvision:
      vacationProvision +
      vacationInssProvision +
      oneThirdVacationProvision +
      oneThirdVacationInssProvision +
      thirteenthProvision +
      thirteenthInssProvision +
      fgtsAnnualProvision,
    total: salary + fgtsMonthly + inssMonthly +
      vacationProvision +
      vacationInssProvision +
      oneThirdVacationProvision +
      oneThirdVacationInssProvision +
      thirteenthProvision +
      thirteenthInssProvision +
      fgtsAnnualProvision,
  };
}

export function calculateCompanyInfo(details: CompanyInfoDetails) {
  const equityTotal = details.partners.reduce((total, partner) => total + partner.equityPercent, 0);
  const missingEquity = Math.max(0, 100 - equityTotal);
  const averagePartnerEquity = details.partners.length
    ? Math.round(equityTotal / details.partners.length)
    : 0;

  const progress = scorePresence([
    filledText(details.companyName),
    filledText(details.legalName),
    filledText(details.cnpj),
    filledText(details.website),
    filledText(details.location),
    filledText(details.description),
    details.stage.length > 0,
    details.partners.length > 0,
  ]);

  return {
    progress,
    maturity: Math.min(100, Math.round(progress * 0.75 + averagePartnerEquity * 0.25)),
    summary: `${details.companyName} com ${details.partners.length} socios e ${equityTotal}% de equity distribuido.`,
    priorities: `Fechar ${missingEquity}% de equity restante e revisar contatos dos socios.`,
    evidence: `CNPJ ${details.cnpj} | site ${details.website} | estagio ${details.stage}.`,
    risks: missingEquity > 0 ? `Equity nao fecha 100% (faltam ${missingEquity}%).` : "Equity total fecha 100%.",
    nextStep: "Revisar contratos e vinculo societario.",
    metrics: {
      equityTotal,
      missingEquity,
      averagePartnerEquity,
    },
  };
}

export function calculatePricing(details: PricingDetails) {
  const directCostTotal = details.directCosts.reduce((total, item) => total + item.value, 0);
  const taxedCost = directCostTotal * (1 + details.taxRatePercent / 100);
  const finalPrice = taxedCost * (1 + details.marginPercent / 100);
  const grossRevenue = finalPrice * details.monthlyUnits;
  const contributionMargin = finalPrice - directCostTotal;
  const clt = calculateWorkbookCltTotal(details.cltSalary);

  const progress = scorePresence([
    filledText(details.productName),
    filledText(details.productType),
    details.directCosts.length >= 3,
    filledNumber(details.taxRatePercent),
    filledNumber(details.marginPercent),
    filledNumber(details.monthlyUnits),
    filledNumber(details.competitorPriceLow),
    filledNumber(details.competitorPriceHigh),
    filledText(details.positioning),
  ]);

  return {
    progress,
    maturity: Math.min(100, Math.round(progress * 0.7 + Math.min(100, contributionMargin / 20))),
    summary: `${details.productName} com custo base de ${finalPrice.toFixed(3)} e CLT total de ${clt.total.toFixed(2)}.`,
    priorities: `Validar faixa competitiva entre ${details.competitorPriceLow.toFixed(2)} e ${details.competitorPriceHigh.toFixed(2)}.`,
    evidence: `Total custos ${directCostTotal.toFixed(2)} | preço mínimo workbook ${finalPrice.toFixed(3)}.`,
    risks: contributionMargin <= 0 ? "Preco final abaixo do custo direto." : "Preco sensivel a imposto e margem.",
    nextStep: "Fechar a âncora de preço e comparar com a faixa ideal.",
    metrics: {
      directCostTotal,
      taxedCost,
      finalPrice,
      grossRevenue,
      contributionMargin,
      competitorPriceLow: details.competitorPriceLow,
      competitorPriceHigh: details.competitorPriceHigh,
      cltTotal: clt.total,
      cltMonthlyProvision: clt.monthlyProvision,
      cltFgtsMonthly: clt.fgtsMonthly,
      cltInssMonthly: clt.inssMonthly,
    },
  };
}

export function calculateProductInfo(details: ProductInfoDetails) {
  const clt = calculateWorkbookCltTotal(details.cltSalary);
  const productsRevenue = details.products.reduce((total, item) => total + item.price * item.quantity, 0);
  const productTaxes = details.products.map((item) => {
    const taxRate = item.pisPercent + item.cofinsPercent + item.icmsPercent + item.issPercent;
    if (details.taxRegime.trim().toLowerCase().includes("simples")) {
      return 0;
    }
    return item.price * taxRate * item.quantity;
  });
  const productTaxTotal = productTaxes.reduce((total, value) => total + value, 0);
  const activeProducts = details.products.filter((item) => item.name.trim().length > 0).length;

  const progress = scorePresence([
    filledText(details.taxRegime),
    filledText(details.productFamily),
    filledText(details.taxProductType),
    filledText(details.anexo),
    filledNumber(details.cltSalary),
    activeProducts >= 2,
  ]);

  return {
    progress,
    maturity: Math.min(100, Math.round(progress * 0.72 + Math.min(100, productsRevenue / 1000))),
    summary: `${details.productFamily} com ${activeProducts} produtos e custo CLT de ${clt.total.toFixed(2)}.`,
    priorities: `Ajustar regime tributario ${details.taxRegime} e consolidar ${details.anexo}.`,
    evidence: `Receita potencial da linha: ${productsRevenue.toFixed(2)} | Tributos: ${productTaxTotal.toFixed(2)}.`,
    risks: clt.total <= 0 ? "Custo CLT nao calculado." : "Carga de equipe pode pressionar margem.",
    nextStep: "Fechar cálculo tributário por regime e equipe.",
    metrics: {
      cltTotal: clt.total,
      productsRevenue,
      productTaxTotal,
      activeProducts,
      inssRate: clt.inssRate,
    },
  };
}

export function calculateFunding(details: FundingDetails) {
  const totalRequested = details.rounds.reduce((total, round) => total + round.targetAmount, 0);
  const totalRaised = details.rounds.reduce((total, round) => total + round.raisedAmount, 0);
  const remainingToRaise = totalRequested - totalRaised;
  const totalEquityOffered = details.rounds.reduce((total, round) => total + round.equityOfferedPercent, 0);
  const currentValuation = Math.max(
    0,
    ...details.rounds.filter((round) => round.valuation > 1).map((round) => round.valuation),
  );
  const capturedPercent = totalRequested > 0 ? totalRaised / totalRequested : 0;

  const progress = scorePresence([
    filledText(details.strategy),
    filledNumber(details.targetAmount),
    filledNumber(details.runwayMonths),
    filledText(details.roundLead),
    details.rounds.length >= 1,
  ]);

  return {
    progress,
    maturity: Math.min(100, Math.round(progress * 0.8 + Math.min(100, totalEquityOffered))),
    summary: `${details.strategy} com ${totalRaised.toLocaleString("pt-BR")} captados de ${totalRequested.toLocaleString("pt-BR")}.`,
    priorities: `Garantir runway de ${details.runwayMonths} meses e lead ${details.roundLead}.`,
    evidence: `Captado ${totalRaised.toLocaleString("pt-BR")} | a captar ${remainingToRaise.toLocaleString("pt-BR")} | valuation ${currentValuation.toLocaleString("pt-BR")}.`,
    risks: totalEquityOffered > 30 ? "Diluição acumulada acima do patamar desejado." : "Captação depende de tese e valuation.",
    nextStep: "Ajustar valuation e data room.",
    metrics: {
      totalRequested,
      totalRaised,
      remainingToRaise,
      totalEquityOffered,
      currentValuation,
      capturedPercent,
    },
  };
}
