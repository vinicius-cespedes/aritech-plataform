import { hash } from "@node-rs/argon2";
import { PrismaClient } from "@prisma/client";
import { PERMISSIONS, ROLE_DEFINITIONS } from "@aritech/shared";

const prisma = new PrismaClient();

async function main() {
  console.log("Seed: permissões...");
  for (const key of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key },
    });
  }

  console.log("Seed: perfis (roles)...");
  for (const def of ROLE_DEFINITIONS) {
    const role = await prisma.role.upsert({
      where: { key: def.key },
      update: { name: def.name },
      create: { key: def.key, name: def.name },
    });

    for (const permissionKey of def.permissions) {
      const permission = await prisma.permission.findUniqueOrThrow({
        where: { key: permissionKey },
      });
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  console.log("Seed: empresa (LegalEntity)...");
  const legalEntity = await prisma.legalEntity.upsert({
    where: { taxId: "00000000000100" },
    update: {},
    create: {
      name: "Aritech Soluções Industriais",
      tradeName: "Aritech",
      taxId: "00000000000100",
    },
  });

  console.log("Seed: usuário administrador...");
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@aritech.com.br";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "TrocarSenha123!";
  const passwordHash = await hash(adminPassword);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: "Administrador Aritech",
      mustChangePassword: true,
    },
  });

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { key: "ADMIN" } });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });

  console.log("Seed: centros de custo (docx §15 / MODULES.md §23.3)...");
  const costCenters = [
    { code: "ADM", name: "Administrativo" },
    { code: "COM", name: "Comercial" },
    { code: "PRD", name: "Produção" },
    { code: "FIN", name: "Financeiro" },
    { code: "RH", name: "Recursos Humanos" },
    { code: "PD", name: "P&D" },
  ];
  for (const cc of costCenters) {
    await prisma.costCenter.upsert({
      where: { code: cc.code },
      update: { name: cc.name },
      create: cc,
    });
  }

  console.log("Seed: centros de resultado / linhas de negócio (docx §15)...");
  const resultCenters = [
    { code: "ENG", name: "Projetos de Engenharia" },
    { code: "INT", name: "Integração de Sistemas" },
    { code: "MAN", name: "Manutenção Industrial" },
    { code: "PAI", name: "Painéis Elétricos e Automação" },
    { code: "EQP", name: "Fornecimento de Equipamentos" },
    { code: "MAT", name: "Fornecimento de Materiais" },
  ];
  for (const rc of resultCenters) {
    await prisma.resultCenter.upsert({
      where: { code: rc.code },
      update: { name: rc.name },
      create: rc,
    });
  }

  console.log("Seed: plano de contas gerencial inicial (docx §15 / FINANCIAL_MODEL §42)...");
  const managementAccounts: Array<{
    code: string;
    name: string;
    nature: "DEBIT" | "CREDIT" | "NEUTRAL";
    classification:
      | "REVENUE"
      | "TAX_DEDUCTION"
      | "DIRECT_COST"
      | "INDIRECT_COST"
      | "OPERATING_EXPENSE"
      | "FINANCIAL_INCOME"
      | "FINANCIAL_EXPENSE"
      | "INVESTMENT"
      | "FINANCING"
      | "EQUITY"
      | "TRANSFER"
      | "OTHER";
    dreGroup: string;
  }> = [
    { code: "3.1", name: "Receita de Serviços e Projetos", nature: "CREDIT", classification: "REVENUE", dreGroup: "RECEITA_BRUTA" },
    { code: "3.2", name: "Impostos e Deduções sobre Receita", nature: "DEBIT", classification: "TAX_DEDUCTION", dreGroup: "IMPOSTOS_DEDUCOES" },
    { code: "4.1", name: "Materiais e Insumos", nature: "DEBIT", classification: "DIRECT_COST", dreGroup: "CUSTOS_DIRETOS" },
    { code: "4.2", name: "Serviços de Terceiros (obra/projeto)", nature: "DEBIT", classification: "DIRECT_COST", dreGroup: "CUSTOS_DIRETOS" },
    { code: "5.1", name: "Aluguel e Condomínio", nature: "DEBIT", classification: "OPERATING_EXPENSE", dreGroup: "DESPESAS_OPERACIONAIS" },
    { code: "5.2", name: "Salários e Ordenados", nature: "DEBIT", classification: "OPERATING_EXPENSE", dreGroup: "DESPESAS_OPERACIONAIS" },
    { code: "5.3", name: "Férias e 1/3 Constitucional", nature: "DEBIT", classification: "OPERATING_EXPENSE", dreGroup: "DESPESAS_OPERACIONAIS" },
    { code: "5.4", name: "13º Salário", nature: "DEBIT", classification: "OPERATING_EXPENSE", dreGroup: "DESPESAS_OPERACIONAIS" },
    { code: "5.5", name: "Benefícios", nature: "DEBIT", classification: "OPERATING_EXPENSE", dreGroup: "DESPESAS_OPERACIONAIS" },
    { code: "5.6", name: "Reembolsos", nature: "DEBIT", classification: "OPERATING_EXPENSE", dreGroup: "DESPESAS_OPERACIONAIS" },
    { code: "5.7", name: "Serviços de Terceiros (administrativo)", nature: "DEBIT", classification: "OPERATING_EXPENSE", dreGroup: "DESPESAS_OPERACIONAIS" },
    { code: "5.8", name: "Software e Licenças", nature: "DEBIT", classification: "OPERATING_EXPENSE", dreGroup: "DESPESAS_OPERACIONAIS" },
    { code: "5.9", name: "Viagens e Hospedagem", nature: "DEBIT", classification: "OPERATING_EXPENSE", dreGroup: "DESPESAS_OPERACIONAIS" },
    { code: "5.10", name: "Impostos e Taxas", nature: "DEBIT", classification: "OPERATING_EXPENSE", dreGroup: "DESPESAS_OPERACIONAIS" },
    { code: "6.1", name: "Despesas Financeiras", nature: "DEBIT", classification: "FINANCIAL_EXPENSE", dreGroup: "RESULTADO_FINANCEIRO" },
    { code: "6.2", name: "Receitas Financeiras", nature: "CREDIT", classification: "FINANCIAL_INCOME", dreGroup: "RESULTADO_FINANCEIRO" },
    { code: "9.1", name: "Transferências entre Contas", nature: "NEUTRAL", classification: "TRANSFER", dreGroup: "NAO_APLICAVEL" },
  ];
  for (const account of managementAccounts) {
    await prisma.managementAccount.upsert({
      where: { code: account.code },
      update: { name: account.name },
      create: account,
    });
  }

  console.log("Seed: contas financeiras de exemplo (docx §10)...");
  const financialAccounts = [
    { name: "Santander — Conta Corrente", type: "CHECKING" as const, institutionName: "Santander" },
    { name: "Safra — Conta Corrente", type: "CHECKING" as const, institutionName: "Safra" },
    { name: "Caixa — Conta Corrente", type: "CHECKING" as const, institutionName: "Caixa Econômica Federal" },
    { name: "Aplicação Financeira", type: "INVESTMENT" as const, institutionName: "Santander" },
  ];
  for (const acc of financialAccounts) {
    const existing = await prisma.financialAccount.findFirst({ where: { name: acc.name } });
    if (!existing) {
      await prisma.financialAccount.create({
        data: { ...acc, legalEntityId: legalEntity.id },
      });
    }
  }

  console.log(
    `Seed concluído. Usuário admin: ${adminEmail} / senha inicial: ${adminPassword} (troca obrigatória no primeiro login).`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
