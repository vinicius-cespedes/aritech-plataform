import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@aritech/database";
import { DomainError } from "@aritech/shared";
import { CreateContractInput, UpdateContractInput } from "@aritech/validation";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../audit/audit.service";
import { PRODUCTION_COST_CENTER_CODE } from "./allocation.service";

const CONTRACT_INCLUDE = {
  customer: true,
  resultCenter: { include: { parent: true } },
  costCenter: true,
  projects: true,
} satisfies Prisma.ContractInclude;

@Injectable()
export class ContractsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list() {
    return this.prisma.client.contract.findMany({ include: CONTRACT_INCLUDE, orderBy: { code: "asc" } });
  }

  async get(id: string) {
    const contract = await this.prisma.client.contract.findUnique({ where: { id }, include: CONTRACT_INCLUDE });
    if (!contract) throw new NotFoundException({ code: "NOT_FOUND", message: "Contrato não encontrado." });
    return contract;
  }

  /**
   * Cria o contrato e, na mesma transação, seu centro de resultado (filho da
   * linha de negócio), o subcentro de custo de Produção e o projeto.
   */
  async create(data: CreateContractInput, actorUserId: string) {
    const created = await this.prisma.client.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { id: data.customerId } });
      if (!customer) throw new DomainError("NOT_FOUND", "Cliente não encontrado.");
      const businessLine = await this.getBusinessLine(tx, data.businessLineId);

      if (await tx.contract.findUnique({ where: { code: data.code } })) {
        throw new DomainError("VALIDATION_ERROR", `Já existe um contrato com o código "${data.code}".`);
      }
      const production = await tx.costCenter.findUnique({ where: { code: PRODUCTION_COST_CENTER_CODE } });
      if (!production) {
        throw new DomainError("NOT_FOUND", `Centro de custo de Produção (${PRODUCTION_COST_CENTER_CODE}) não encontrado.`);
      }

      const contract = await tx.contract.create({
        data: {
          customerId: data.customerId,
          code: data.code,
          description: data.description,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
          amount: data.amount,
          status: data.status,
        },
      });

      const resultCenter = await tx.resultCenter.create({
        data: {
          code: await this.nextChildCode(tx, "resultCenter", businessLine.code, businessLine.id),
          name: contract.code,
          parentId: businessLine.id,
        },
      });
      await tx.contract.update({ where: { id: contract.id }, data: { resultCenterId: resultCenter.id } });

      await tx.costCenter.create({
        data: {
          code: await this.nextChildCode(tx, "costCenter", production.code, production.id),
          name: contract.code,
          parentId: production.id,
          contractId: contract.id,
        },
      });

      let projectCode = contract.code;
      if (await tx.project.findUnique({ where: { code: projectCode } })) projectCode = `${contract.code} (projeto)`;
      await tx.project.create({ data: { code: projectCode, name: contract.code, contractId: contract.id } });

      await this.audit.record(tx, {
        actorType: "USER",
        actorUserId,
        module: "finance.contract",
        action: "CREATE",
        entityType: "Contract",
        entityId: contract.id,
        source: "WEB",
        result: "SUCCESS",
        newValues: { ...contract, businessLineId: businessLine.id },
      });
      return contract;
    });
    return this.get(created.id);
  }

  async update(id: string, data: UpdateContractInput, actorUserId: string) {
    const before = await this.get(id);
    await this.prisma.client.$transaction(async (tx) => {
      if (data.businessLineId) {
        const businessLine = await this.getBusinessLine(tx, data.businessLineId);
        if (!before.resultCenterId) {
          const rc = await tx.resultCenter.create({
            data: {
              code: await this.nextChildCode(tx, "resultCenter", businessLine.code, businessLine.id),
              name: before.code,
              parentId: businessLine.id,
            },
          });
          await tx.contract.update({ where: { id }, data: { resultCenterId: rc.id } });
        } else {
          if (before.resultCenter?.parentId !== businessLine.id) {
            await tx.resultCenter.update({
              where: { id: before.resultCenterId },
              data: {
                parentId: businessLine.id,
                code: await this.nextChildCode(tx, "resultCenter", businessLine.code, businessLine.id),
              },
            });
          }
        }
      }
      await tx.contract.update({
        where: { id },
        data: {
          description: data.description,
          startDate: data.startDate === undefined ? undefined : data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate === undefined ? undefined : data.endDate ? new Date(data.endDate) : null,
          amount: data.amount === undefined ? undefined : data.amount,
          status: data.status,
        },
      });
      await this.audit.record(tx, {
        actorType: "USER",
        actorUserId,
        module: "finance.contract",
        action: "UPDATE",
        entityType: "Contract",
        entityId: id,
        source: "WEB",
        result: "SUCCESS",
        previousValues: { status: before.status, resultCenterParentId: before.resultCenter?.parentId ?? null },
        newValues: data,
      });
    });
    return this.get(id);
  }

  private async getBusinessLine(tx: Prisma.TransactionClient, id: string) {
    const line = await tx.resultCenter.findUnique({ where: { id } });
    if (!line) throw new DomainError("NOT_FOUND", "Linha de negócio não encontrada.");
    if (line.parentId) {
      throw new DomainError("VALIDATION_ERROR", "Escolha uma linha de negócio (centro de resultado de nível superior).");
    }
    return line;
  }

  private async nextChildCode(
    tx: Prisma.TransactionClient,
    model: "resultCenter" | "costCenter",
    parentCode: string,
    parentId: string,
  ): Promise<string> {
    const delegate = tx[model] as unknown as {
      count(args: { where: { parentId: string } }): Promise<number>;
      findUnique(args: { where: { code: string } }): Promise<unknown>;
    };
    let seq = (await delegate.count({ where: { parentId } })) + 1;
    for (;;) {
      const code = `${parentCode}-${String(seq).padStart(2, "0")}`;
      if (!(await delegate.findUnique({ where: { code } }))) return code;
      seq++;
    }
  }
}
