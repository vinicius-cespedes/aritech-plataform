import { Injectable, NotFoundException } from "@nestjs/common";
import {
  CreateCostCenterInput,
  CreateFinancialAccountInput,
  CreateManagementAccountInput,
  CreateResultCenterInput,
} from "@aritech/validation";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../audit/audit.service";

@Injectable()
export class AccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // --- FinancialAccount -----------------------------------------------------

  listFinancialAccounts() {
    return this.prisma.client.financialAccount.findMany({ orderBy: { name: "asc" } });
  }

  async createFinancialAccount(data: CreateFinancialAccountInput, actorUserId: string) {
    const account = await this.prisma.client.financialAccount.create({
      data: {
        ...data,
        openingBalanceDate: data.openingBalanceDate ? new Date(data.openingBalanceDate) : undefined,
      },
    });
    await this.audit.record(undefined, {
      actorType: "USER",
      actorUserId,
      module: "finance.account",
      action: "CREATE",
      entityType: "FinancialAccount",
      entityId: account.id,
      source: "WEB",
      result: "SUCCESS",
      newValues: account,
    });
    return account;
  }

  // --- ManagementAccount (plano de contas gerencial) -------------------------

  listManagementAccounts() {
    return this.prisma.client.managementAccount.findMany({ orderBy: { code: "asc" } });
  }

  async createManagementAccount(data: CreateManagementAccountInput, actorUserId: string) {
    const account = await this.prisma.client.managementAccount.create({ data });
    await this.audit.record(undefined, {
      actorType: "USER",
      actorUserId,
      module: "finance.management_account",
      action: "CREATE",
      entityType: "ManagementAccount",
      entityId: account.id,
      source: "WEB",
      result: "SUCCESS",
      newValues: account,
    });
    return account;
  }

  // --- CostCenter --------------------------------------------------------

  listCostCenters() {
    return this.prisma.client.costCenter.findMany({ orderBy: { code: "asc" } });
  }

  async createCostCenter(data: CreateCostCenterInput, actorUserId: string) {
    const costCenter = await this.prisma.client.costCenter.create({ data });
    await this.audit.record(undefined, {
      actorType: "USER",
      actorUserId,
      module: "finance.cost_center",
      action: "CREATE",
      entityType: "CostCenter",
      entityId: costCenter.id,
      source: "WEB",
      result: "SUCCESS",
      newValues: costCenter,
    });
    return costCenter;
  }

  // --- ResultCenter --------------------------------------------------------

  listResultCenters() {
    return this.prisma.client.resultCenter.findMany({ orderBy: { code: "asc" } });
  }

  async createResultCenter(data: CreateResultCenterInput, actorUserId: string) {
    const resultCenter = await this.prisma.client.resultCenter.create({ data });
    await this.audit.record(undefined, {
      actorType: "USER",
      actorUserId,
      module: "finance.result_center",
      action: "CREATE",
      entityType: "ResultCenter",
      entityId: resultCenter.id,
      source: "WEB",
      result: "SUCCESS",
      newValues: resultCenter,
    });
    return resultCenter;
  }

  async getFinancialAccountOrThrow(id: string) {
    const account = await this.prisma.client.financialAccount.findUnique({ where: { id } });
    if (!account) throw new NotFoundException({ code: "NOT_FOUND", message: "Conta financeira não encontrada." });
    return account;
  }
}
