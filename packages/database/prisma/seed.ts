import {
  CostBehavior,
  CostDirectness,
  EconomicNature,
  ManagementAccountNature,
  PrismaClient,
} from '@prisma/client';

const prisma = new PrismaClient();

type AccountSeed = {
  code: string;
  name: string;
  nature: ManagementAccountNature;
  economicNature: EconomicNature;
  behavior: CostBehavior;
  directness: CostDirectness;
  dre?: string;
  cash?: string;
};

async function main() {
  const dre: Record<string, string> = {};
  const cash: Record<string, string> = {};

  async function dreGroup(
    code: string,
    name: string,
    displayOrder: number,
    parentCode?: string,
  ) {
    const row = await prisma.dreGroup.upsert({
      where: { code },
      update: {
        name,
        displayOrder,
        parentId: parentCode ? dre[parentCode] : null,
      },
      create: {
        code,
        name,
        displayOrder,
        parentId: parentCode ? dre[parentCode] : null,
      },
    });
    dre[code] = row.id;
  }

  async function cashFlowGroup(
    code: string,
    name: string,
    displayOrder: number,
    parentCode?: string,
  ) {
    const row = await prisma.cashFlowGroup.upsert({
      where: { code },
      update: {
        name,
        displayOrder,
        parentId: parentCode ? cash[parentCode] : null,
      },
      create: {
        code,
        name,
        displayOrder,
        parentId: parentCode ? cash[parentCode] : null,
      },
    });
    cash[code] = row.id;
  }

  // DRE gerencial
  await dreGroup('DRE-REV', 'Receita Bruta', 100);
  await dreGroup('DRE-REV-SRV', 'Receitas de Serviços', 110, 'DRE-REV');
  await dreGroup('DRE-REV-SUP', 'Receitas de Fornecimentos', 120, 'DRE-REV');
  await dreGroup('DRE-TAX-REV', 'Impostos e Deduções sobre Receita', 200);
  await dreGroup('DRE-COST-DIR', 'Custos Diretos', 300);
  await dreGroup('DRE-OPEX', 'Despesas Operacionais', 400);
  await dreGroup('DRE-OPEX-PER', 'Pessoal e Encargos', 410, 'DRE-OPEX');
  await dreGroup('DRE-OPEX-ADM', 'Despesas Administrativas', 420, 'DRE-OPEX');
  await dreGroup('DRE-OPEX-COM', 'Despesas Comerciais', 430, 'DRE-OPEX');
  await dreGroup('DRE-OPEX-OPS', 'Despesas Operacionais e Técnicas', 440, 'DRE-OPEX');
  await dreGroup('DRE-FIN', 'Resultado Financeiro', 500);
  await dreGroup('DRE-FIN-INC', 'Receitas Financeiras', 510, 'DRE-FIN');
  await dreGroup('DRE-FIN-EXP', 'Despesas Financeiras', 520, 'DRE-FIN');
  await dreGroup('DRE-OTHER-TAX', 'Outros Tributos e Taxas', 600);
  await dreGroup('DRE-ADJ', 'Ajustes Gerenciais', 900);

  // Fluxo de caixa gerencial
  await cashFlowGroup('CF-OPER', 'Atividades Operacionais', 100);
  await cashFlowGroup('CF-OPER-CUST', 'Recebimentos de Clientes', 110, 'CF-OPER');
  await cashFlowGroup('CF-OPER-SUP', 'Fornecedores e Custos Diretos', 120, 'CF-OPER');
  await cashFlowGroup('CF-OPER-PER', 'Pessoal e Encargos', 130, 'CF-OPER');
  await cashFlowGroup('CF-OPER-TAX', 'Tributos', 140, 'CF-OPER');
  await cashFlowGroup('CF-OPER-ADM', 'Despesas Administrativas', 150, 'CF-OPER');
  await cashFlowGroup('CF-OPER-COM', 'Despesas Comerciais', 160, 'CF-OPER');
  await cashFlowGroup('CF-OPER-OTH', 'Outras Operações', 170, 'CF-OPER');

  await cashFlowGroup('CF-INV', 'Atividades de Investimento', 200);
  await cashFlowGroup('CF-INV-OUT', 'Aplicações e Aquisições', 210, 'CF-INV');
  await cashFlowGroup('CF-INV-IN', 'Resgates e Alienações', 220, 'CF-INV');

  await cashFlowGroup('CF-FIN', 'Atividades de Financiamento', 300);
  await cashFlowGroup('CF-FIN-LOAN-IN', 'Empréstimos Recebidos', 310, 'CF-FIN');
  await cashFlowGroup('CF-FIN-LOAN-OUT', 'Amortização de Empréstimos', 320, 'CF-FIN');
  await cashFlowGroup('CF-FIN-EQUITY-IN', 'Aportes de Sócios', 330, 'CF-FIN');
  await cashFlowGroup('CF-FIN-EQUITY-OUT', 'Distribuições e Retiradas', 340, 'CF-FIN');

  await cashFlowGroup('CF-TRANSFER', 'Transferências Internas', 400);
  await cashFlowGroup('CF-ADJ', 'Ajustes de Caixa', 900);

  // Centros de custo
  const costCenters = [
    ['CC-ENG', 'Engenharia'],
    ['CC-PRD', 'Produção'],
    ['CC-CMP', 'Compras'],
    ['CC-COM', 'Comercial'],
    ['CC-MKT', 'Marketing'],
    ['CC-FIN', 'Financeiro'],
    ['CC-ADM', 'Administrativo'],
    ['CC-DIR', 'Diretoria'],
  ] as const;

  for (const [code, name] of costCenters) {
    await prisma.costCenter.upsert({
      where: { code },
      update: { name },
      create: { code, name },
    });
  }

  // Linhas de negócio
  const businessLines = [
    ['BL-ENG', 'Projetos de Engenharia'],
    ['BL-INT', 'Integração de Sistemas'],
    ['BL-MNT', 'Manutenção Industrial'],
    ['BL-PNL', 'Painéis Elétricos e Automação'],
    ['BL-EQP', 'Fornecimento de Equipamentos'],
    ['BL-MAT', 'Fornecimento de Materiais'],
  ] as const;

  for (const [code, name] of businessLines) {
    await prisma.businessLine.upsert({
      where: { code },
      update: { name },
      create: { code, name },
    });
  }

  const accounts: AccountSeed[] = [
    // Receitas operacionais
    {
      code: 'REV-SRV-ENG', name: 'Projeto de Engenharia',
      nature: ManagementAccountNature.CREDIT,
      economicNature: EconomicNature.OPERATING_REVENUE,
      behavior: CostBehavior.NOT_APPLICABLE,
      directness: CostDirectness.DIRECT,
      dre: 'DRE-REV-SRV', cash: 'CF-OPER-CUST',
    },
    {
      code: 'REV-SRV-INT', name: 'Integração de Sistemas',
      nature: ManagementAccountNature.CREDIT,
      economicNature: EconomicNature.OPERATING_REVENUE,
      behavior: CostBehavior.NOT_APPLICABLE,
      directness: CostDirectness.DIRECT,
      dre: 'DRE-REV-SRV', cash: 'CF-OPER-CUST',
    },
    {
      code: 'REV-SRV-MNT', name: 'Manutenção Industrial',
      nature: ManagementAccountNature.CREDIT,
      economicNature: EconomicNature.OPERATING_REVENUE,
      behavior: CostBehavior.NOT_APPLICABLE,
      directness: CostDirectness.DIRECT,
      dre: 'DRE-REV-SRV', cash: 'CF-OPER-CUST',
    },
    {
      code: 'REV-SUP-PNL', name: 'Painéis Elétricos e Automação',
      nature: ManagementAccountNature.CREDIT,
      economicNature: EconomicNature.OPERATING_REVENUE,
      behavior: CostBehavior.NOT_APPLICABLE,
      directness: CostDirectness.DIRECT,
      dre: 'DRE-REV-SUP', cash: 'CF-OPER-CUST',
    },
    {
      code: 'REV-SUP-EQP', name: 'Equipamentos',
      nature: ManagementAccountNature.CREDIT,
      economicNature: EconomicNature.OPERATING_REVENUE,
      behavior: CostBehavior.NOT_APPLICABLE,
      directness: CostDirectness.DIRECT,
      dre: 'DRE-REV-SUP', cash: 'CF-OPER-CUST',
    },
    {
      code: 'REV-SUP-MAT', name: 'Materiais',
      nature: ManagementAccountNature.CREDIT,
      economicNature: EconomicNature.OPERATING_REVENUE,
      behavior: CostBehavior.NOT_APPLICABLE,
      directness: CostDirectness.DIRECT,
      dre: 'DRE-REV-SUP', cash: 'CF-OPER-CUST',
    },

    // Estrutura administrativa
    ...[
      ['EXP-ADM-WATER', 'Água e Saneamento', CostBehavior.SEMI_VARIABLE],
      ['EXP-ADM-RENT', 'Aluguel', CostBehavior.FIXED],
      ['EXP-ADM-POWER', 'Energia Elétrica', CostBehavior.SEMI_VARIABLE],
      ['EXP-ADM-ACCOUNTING', 'Honorários Contábeis', CostBehavior.FIXED],
      ['EXP-ADM-TEL-INET', 'Telefonia e Internet', CostBehavior.FIXED],
      ['EXP-ADM-MOBILE', 'Telefonia Móvel', CostBehavior.FIXED],
      ['EXP-ADM-SECURITY', 'Vigilância e Segurança', CostBehavior.FIXED],
      ['EXP-ADM-LICENSE', 'Alvará de Funcionamento', CostBehavior.FIXED],
      ['EXP-ADM-OFFICE', 'Materiais de Escritório', CostBehavior.VARIABLE],
      ['EXP-ADM-SOFTWARE', 'Softwares', CostBehavior.FIXED],
      ['EXP-ADM-INFRA', 'Infraestrutura', CostBehavior.CONTEXT_DEPENDENT],
      ['EXP-ADM-POST', 'Correios e Sedex', CostBehavior.VARIABLE],
      ['EXP-ADM-LEGAL', 'Jurídico', CostBehavior.CONTEXT_DEPENDENT],
      ['EXP-ADM-FIN-MGMT', 'Acompanhamento Financeiro', CostBehavior.FIXED],
    ].map(([code, name, behavior]) => ({
      code: code as string,
      name: name as string,
      nature: ManagementAccountNature.DEBIT,
      economicNature: EconomicNature.OPERATING_EXPENSE,
      behavior: behavior as CostBehavior,
      directness: CostDirectness.INDIRECT,
      dre: 'DRE-OPEX-ADM',
      cash: 'CF-OPER-ADM',
    })),

    // Pessoal e encargos. A classificação efetiva pode ser sobrescrita na alocação.
    ...[
      ['EXP-PER-SALARY', 'Salários', CostBehavior.FIXED, CostDirectness.CONTEXT_DEPENDENT],
      ['EXP-PER-VAC', 'Férias', CostBehavior.FIXED, CostDirectness.CONTEXT_DEPENDENT],
      ['EXP-PER-FOOD', 'Vale-Alimentação', CostBehavior.FIXED, CostDirectness.CONTEXT_DEPENDENT],
      ['EXP-PER-HEALTH', 'Plano de Saúde Colaboradores', CostBehavior.FIXED, CostDirectness.INDIRECT],
      ['EXP-PER-LIFE', 'Seguro de Vida', CostBehavior.FIXED, CostDirectness.INDIRECT],
      ['EXP-PER-MED', 'Exames Médicos', CostBehavior.VARIABLE, CostDirectness.INDIRECT],
      ['EXP-PER-UNIFORM', 'Uniformes', CostBehavior.VARIABLE, CostDirectness.CONTEXT_DEPENDENT],
      ['EXP-PER-PROLAB', 'Pró-Labore', CostBehavior.FIXED, CostDirectness.INDIRECT],
      ['EXP-PER-FGTS', 'FGTS e Multa de FGTS', CostBehavior.FIXED, CostDirectness.CONTEXT_DEPENDENT],
      ['EXP-PER-INSS', 'INSS Patronal / Encargos sobre Salários', CostBehavior.FIXED, CostDirectness.CONTEXT_DEPENDENT],
    ].map(([code, name, behavior, directness]) => ({
      code: code as string,
      name: name as string,
      nature: ManagementAccountNature.DEBIT,
      economicNature: EconomicNature.OPERATING_EXPENSE,
      behavior: behavior as CostBehavior,
      directness: directness as CostDirectness,
      dre: 'DRE-OPEX-PER',
      cash: 'CF-OPER-PER',
    })),

    // Operação, engenharia, mobilização e logística.
    ...[
      ['EXP-OPS-TOOLS', 'Ferramentas'],
      ['EXP-OPS-COMPUTERS', 'Computadores e Periféricos'],
      ['EXP-OPS-CREA', 'CREA'],
      ['EXP-OPS-TRAINING', 'Cursos e Treinamentos'],
      ['EXP-OPS-VEH-MAINT', 'Manutenção de Veículos'],
      ['EXP-OPS-LEASING', 'Leasing - Máquinas e Equipamentos'],
      ['EXP-OPS-RD', 'P&D'],
      ['EXP-OPS-SMS', 'SMS'],
      ['EXP-OPS-IMPORT', 'Importação'],
      ['EXP-OPS-LODGING', 'Hospedagem'],
      ['EXP-OPS-CAR-RENT', 'Aluguel de Carro'],
      ['EXP-OPS-FUEL', 'Combustíveis'],
      ['EXP-OPS-TOLL', 'Pedágios'],
      ['EXP-OPS-MEALS', 'Lanches e Refeições'],
      ['EXP-OPS-TRAVEL', 'Viagens e Representações'],
      ['EXP-OPS-FREIGHT', 'Transporte de Mercadorias Vendidas'],
    ].map(([code, name]) => ({
      code,
      name,
      nature: ManagementAccountNature.DEBIT,
      economicNature: EconomicNature.OPERATING_EXPENSE,
      behavior: CostBehavior.VARIABLE,
      directness: CostDirectness.CONTEXT_DEPENDENT,
      dre: 'DRE-OPEX-OPS',
      cash: 'CF-OPER-OTH',
    })),

    // Materiais que normalmente compõem custo direto.
    {
      code: 'COST-MAT-MACHINE', name: 'Materiais Aplicados em Máquinas',
      nature: ManagementAccountNature.DEBIT,
      economicNature: EconomicNature.DIRECT_COST,
      behavior: CostBehavior.VARIABLE,
      directness: CostDirectness.DIRECT,
      dre: 'DRE-COST-DIR', cash: 'CF-OPER-SUP',
    },
    {
      code: 'COST-MAT-SERVICE', name: 'Materiais Aplicados na Prestação de Serviços',
      nature: ManagementAccountNature.DEBIT,
      economicNature: EconomicNature.DIRECT_COST,
      behavior: CostBehavior.VARIABLE,
      directness: CostDirectness.DIRECT,
      dre: 'DRE-COST-DIR', cash: 'CF-OPER-SUP',
    },

    // Comercial e marketing
    {
      code: 'EXP-COM-MKT', name: 'Marketing e Publicidade',
      nature: ManagementAccountNature.DEBIT,
      economicNature: EconomicNature.OPERATING_EXPENSE,
      behavior: CostBehavior.VARIABLE,
      directness: CostDirectness.INDIRECT,
      dre: 'DRE-OPEX-COM', cash: 'CF-OPER-COM',
    },
    {
      code: 'EXP-COM-JOB-ADS', name: 'Anúncio de Vaga no LinkedIn',
      nature: ManagementAccountNature.DEBIT,
      economicNature: EconomicNature.OPERATING_EXPENSE,
      behavior: CostBehavior.VARIABLE,
      directness: CostDirectness.INDIRECT,
      dre: 'DRE-OPEX-ADM', cash: 'CF-OPER-ADM',
    },

    // Tributos
    {
      code: 'TAX-DAS', name: 'Simples Nacional - DAS',
      nature: ManagementAccountNature.DEBIT,
      economicNature: EconomicNature.TAX,
      behavior: CostBehavior.VARIABLE,
      directness: CostDirectness.CONTEXT_DEPENDENT,
      dre: 'DRE-TAX-REV', cash: 'CF-OPER-TAX',
    },
    {
      code: 'TAX-DARE', name: 'Tributos e Taxas via DARE',
      nature: ManagementAccountNature.DEBIT,
      economicNature: EconomicNature.TAX,
      behavior: CostBehavior.CONTEXT_DEPENDENT,
      directness: CostDirectness.INDIRECT,
      dre: 'DRE-OTHER-TAX', cash: 'CF-OPER-TAX',
    },
    {
      code: 'EXP-OPS-TRAFFIC-FINE', name: 'Multas de Trânsito',
      nature: ManagementAccountNature.DEBIT,
      economicNature: EconomicNature.OPERATING_EXPENSE,
      behavior: CostBehavior.VARIABLE,
      directness: CostDirectness.CONTEXT_DEPENDENT,
      dre: 'DRE-OPEX-OPS', cash: 'CF-OPER-OTH',
    },

    // Valores relacionados à folha que não devem duplicar a despesa salarial.
    {
      code: 'ADJ-PER-SALARY-ADV', name: 'Adiantamento Salarial',
      nature: ManagementAccountNature.NEUTRAL,
      economicNature: EconomicNature.ADJUSTMENT,
      behavior: CostBehavior.NOT_APPLICABLE,
      directness: CostDirectness.NOT_APPLICABLE,
      cash: 'CF-OPER-PER',
    },
    {
      code: 'ADJ-PER-IRRF', name: 'IRRF sobre Salários',
      nature: ManagementAccountNature.NEUTRAL,
      economicNature: EconomicNature.ADJUSTMENT,
      behavior: CostBehavior.NOT_APPLICABLE,
      directness: CostDirectness.NOT_APPLICABLE,
      cash: 'CF-OPER-TAX',
    },
    {
      code: 'ADJ-PER-PENSION', name: 'Pensão Alimentícia',
      nature: ManagementAccountNature.NEUTRAL,
      economicNature: EconomicNature.ADJUSTMENT,
      behavior: CostBehavior.NOT_APPLICABLE,
      directness: CostDirectness.NOT_APPLICABLE,
      cash: 'CF-OPER-PER',
    },

    // Resultado financeiro
    {
      code: 'FIN-INC-INV', name: 'Rendimentos de Aplicações',
      nature: ManagementAccountNature.CREDIT,
      economicNature: EconomicNature.FINANCIAL_INCOME,
      behavior: CostBehavior.NOT_APPLICABLE,
      directness: CostDirectness.INDIRECT,
      dre: 'DRE-FIN-INC', cash: 'CF-OPER-OTH',
    },
    {
      code: 'FIN-INC-INTEREST', name: 'Juros Recebidos',
      nature: ManagementAccountNature.CREDIT,
      economicNature: EconomicNature.FINANCIAL_INCOME,
      behavior: CostBehavior.NOT_APPLICABLE,
      directness: CostDirectness.INDIRECT,
      dre: 'DRE-FIN-INC', cash: 'CF-OPER-OTH',
    },
    ...[
      ['FIN-EXP-GUARANTEE', 'Juros de Conta Garantida'],
      ['FIN-EXP-BANK-FEE', 'Tarifas Bancárias'],
      ['FIN-EXP-CARD-FEE', 'Tarifas de Cartões de Crédito'],
      ['FIN-EXP-COLLECTION', 'Tarifas de Negativação de Nome'],
      ['FIN-EXP-LOAN-INTEREST', 'Juros de Empréstimos e Financiamentos'],
    ].map(([code, name]) => ({
      code,
      name,
      nature: ManagementAccountNature.DEBIT,
      economicNature: EconomicNature.FINANCIAL_EXPENSE,
      behavior: CostBehavior.VARIABLE,
      directness: CostDirectness.INDIRECT,
      dre: 'DRE-FIN-EXP',
      cash: 'CF-OPER-OTH',
    })),

    // Investimentos: principal não entra na DRE.
    {
      code: 'INV-APPLICATION', name: 'Aplicações e Investimentos',
      nature: ManagementAccountNature.NEUTRAL,
      economicNature: EconomicNature.INVESTMENT,
      behavior: CostBehavior.NOT_APPLICABLE,
      directness: CostDirectness.NOT_APPLICABLE,
      cash: 'CF-INV-OUT',
    },
    {
      code: 'INV-REDEMPTION', name: 'Resgate de Investimentos',
      nature: ManagementAccountNature.NEUTRAL,
      economicNature: EconomicNature.INVESTMENT,
      behavior: CostBehavior.NOT_APPLICABLE,
      directness: CostDirectness.NOT_APPLICABLE,
      cash: 'CF-INV-IN',
    },

    // Financiamentos: principal não entra na DRE.
    {
      code: 'FIN-LOAN-IN', name: 'Empréstimos Recebidos',
      nature: ManagementAccountNature.NEUTRAL,
      economicNature: EconomicNature.FINANCING,
      behavior: CostBehavior.NOT_APPLICABLE,
      directness: CostDirectness.NOT_APPLICABLE,
      cash: 'CF-FIN-LOAN-IN',
    },
    {
      code: 'FIN-LOAN-OUT', name: 'Amortização de Empréstimos',
      nature: ManagementAccountNature.NEUTRAL,
      economicNature: EconomicNature.FINANCING,
      behavior: CostBehavior.NOT_APPLICABLE,
      directness: CostDirectness.NOT_APPLICABLE,
      cash: 'CF-FIN-LOAN-OUT',
    },

    // Patrimônio / sócios
    {
      code: 'EQT-CONTRIBUTION', name: 'Aporte Financeiro de Sócios',
      nature: ManagementAccountNature.NEUTRAL,
      economicNature: EconomicNature.EQUITY,
      behavior: CostBehavior.NOT_APPLICABLE,
      directness: CostDirectness.NOT_APPLICABLE,
      cash: 'CF-FIN-EQUITY-IN',
    },
    {
      code: 'EQT-PROFIT-DIST', name: 'Retirada / Distribuição de Lucros',
      nature: ManagementAccountNature.NEUTRAL,
      economicNature: EconomicNature.EQUITY,
      behavior: CostBehavior.NOT_APPLICABLE,
      directness: CostDirectness.NOT_APPLICABLE,
      cash: 'CF-FIN-EQUITY-OUT',
    },

    // Ajustes e estornos: preferir reversão do lançamento original quando possível.
    {
      code: 'ADJ-LOAN-INSURANCE', name: 'Estorno de Seguro de Empréstimo',
      nature: ManagementAccountNature.NEUTRAL,
      economicNature: EconomicNature.ADJUSTMENT,
      behavior: CostBehavior.NOT_APPLICABLE,
      directness: CostDirectness.NOT_APPLICABLE,
      dre: 'DRE-ADJ', cash: 'CF-ADJ',
    },
    {
      code: 'ADJ-PURCHASE-REVERSAL', name: 'Estorno de Material Comprado',
      nature: ManagementAccountNature.NEUTRAL,
      economicNature: EconomicNature.ADJUSTMENT,
      behavior: CostBehavior.NOT_APPLICABLE,
      directness: CostDirectness.CONTEXT_DEPENDENT,
      dre: 'DRE-ADJ', cash: 'CF-ADJ',
    },
    {
      code: 'ADJ-CONTROL-DIFF', name: 'Diferença no Controle',
      nature: ManagementAccountNature.NEUTRAL,
      economicNature: EconomicNature.ADJUSTMENT,
      behavior: CostBehavior.NOT_APPLICABLE,
      directness: CostDirectness.NOT_APPLICABLE,
      dre: 'DRE-ADJ', cash: 'CF-ADJ',
    },
  ];

  for (const account of accounts) {
    await prisma.managementAccount.upsert({
      where: { code: account.code },
      update: {
        name: account.name,
        nature: account.nature,
        economicNature: account.economicNature,
        defaultCostBehavior: account.behavior,
        defaultCostDirectness: account.directness,
        dreGroupId: account.dre ? dre[account.dre] : null,
        cashFlowGroupId: account.cash ? cash[account.cash] : null,
        allowsPosting: true,
      },
      create: {
        code: account.code,
        name: account.name,
        nature: account.nature,
        economicNature: account.economicNature,
        defaultCostBehavior: account.behavior,
        defaultCostDirectness: account.directness,
        dreGroupId: account.dre ? dre[account.dre] : null,
        cashFlowGroupId: account.cash ? cash[account.cash] : null,
        allowsPosting: true,
      },
    });
  }

  console.log(
    `Seed gerencial concluído: ${accounts.length} contas, ${costCenters.length} centros de custo e ${businessLines.length} linhas de negócio.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
