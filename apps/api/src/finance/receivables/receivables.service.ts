import { Injectable, NotFoundException } from "@nestjs/common";
import { DomainError, Money } from "@aritech/shared";
import { CreateReceivableInput, UpdateReceivableClassificationInput } from "@aritech/validation";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../audit/audit.service";
import { PeriodsService } from "../periods/periods.service";
import { AllocationService } from "../contracts/allocation.service";

@Injectable()
export class ReceivablesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly periods: PeriodsService,
    private readonly allocation: AllocationService,
  ) {}

  list(status?: string) {
    return this.prisma.client.receivable.findMany({
      where: status ? { status: status as never } : undefined,
      include: {
        installments: true,
        customer: true,
        contract: true,
        resultCenter: { include: { parent: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async get(id: string) {
    const receivable = await this.prisma.client.receivable.findUnique({
      where: { id },
      include: {
        installments: { orderBy: { sequence: "asc" } },
        customer: true,
        project: true,
        managementAccount: true,
        contract: true,
        resultCenter: { include: { parent: true } },
      },
    });
    if (!receivable) throw new NotFoundException({ code: "NOT_FOUND", message: "Conta a receber não encontrada." });
    return receivable;
  }

  /** Revisão de classificação de uma Conta a Receber (cliente, contrato, projeto, conta gerencial). */
  async updateClassification(id: string, data: UpdateReceivableClassificationInput, actorUserId: string) {
    const receivable = await this.get(id);
    if (receivable.status === "CANCELLED") {
      throw new DomainError("PAYABLE_NOT_EDITABLE", "Contas canceladas não podem ser editadas.");
    }
    await this.periods.assertCanModify(receivable.competenceDate);

    if (data.managementAccountId) {
      const account = await this.prisma.client.managementAccount.findUnique({ where: { id: data.managementAccountId } });
      if (!account || !account.allowsPosting) {
        throw new DomainError(
          "MANAGEMENT_ACCOUNT_NOT_POSTABLE",
          "A conta gerencial informada não existe ou não aceita lançamentos diretos (é sintética).",
        );
      }
    }

    const touchesAllocation =
      data.customerId !== undefined || data.contractId !== undefined || data.projectId !== undefined;

    return this.prisma.client.$transaction(async (tx) => {
      let customerId = receivable.customerId;
      let contractId = receivable.contractId;
      let projectId = receivable.projectId;
      let resultCenterId = receivable.resultCenterId;
      if (touchesAllocation) {
        const allocation = await this.allocation.resolveReceivableAllocation(tx, {
          customerId: data.customerId ?? receivable.customerId,
          contractId: (data.contractId ?? receivable.contractId) as string,
          projectId: data.projectId !== undefined ? data.projectId : receivable.projectId,
        });
        customerId = data.customerId ?? receivable.customerId;
        ({ contractId, projectId, resultCenterId } = allocation);
      }
      const result = await tx.receivable.update({
        where: { id },
        data: {
          description: data.description,
          managementAccountId: data.managementAccountId,
          customerId,
          contractId,
          projectId,
          resultCenterId,
        },
      });
      await tx.receivableInstallment.updateMany({
        where: { receivableId: id, notes: { startsWith: "Importado automaticamente" } },
        data: { notes: null },
      });
      await this.audit.record(tx, {
        actorType: "USER",
        actorUserId,
        module: "finance.receivable",
        action: "UPDATE_CLASSIFICATION",
        entityType: "Receivable",
        entityId: id,
        source: "WEB",
        result: "SUCCESS",
        previousValues: {
          customerId: receivable.customerId,
          contractId: receivable.contractId,
          projectId: receivable.projectId,
          resultCenterId: receivable.resultCenterId,
          managementAccountId: receivable.managementAccountId,
          description: receivable.description,
        },
        newValues: result,
      });
      return result;
    });
  }

  /**
   * Criação de Conta a Receber — docx §11 e FINANCIAL_MODEL §10-11.
   * Diferente de Payable, não exige aprovação prévia obrigatória no MVP —
   * nasce em OPEN, já que a origem (medição/NF/contrato) já representa uma
   * validação anterior do direito. Aprovação formal pode ser adicionada como
   * evolução (FINANCIAL_MODEL §51.3 — ApprovalRequest).
   */
  async create(data: CreateReceivableInput, actorUserId: string) {
    const competenceDate = new Date(data.competenceDate);
    await this.periods.assertCanModify(competenceDate);

    const managementAccount = await this.prisma.client.managementAccount.findUnique({
      where: { id: data.managementAccountId },
    });
    if (!managementAccount || !managementAccount.allowsPosting) {
      throw new DomainError(
        "MANAGEMENT_ACCOUNT_NOT_POSTABLE",
        "A conta gerencial informada não existe ou não aceita lançamentos diretos (é sintética).",
      );
    }

    const original = Money.of(data.originalAmount, data.currency);
    const installmentAmounts = original.allocateEqually(data.installmentsCount);
    const firstDueDate = new Date(data.firstDueDate);

    const receivable = await this.prisma.client.$transaction(async (tx) => {
      const allocation = await this.allocation.resolveReceivableAllocation(tx, {
        customerId: data.customerId,
        contractId: data.contractId,
        projectId: data.projectId,
      });
      const created = await tx.receivable.create({
        data: {
          customerId: data.customerId,
          description: data.description,
          documentNumber: data.documentNumber,
          documentType: data.documentType,
          issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
          competenceDate,
          originalAmount: data.originalAmount,
          currency: data.currency,
          status: "OPEN",
          certaintyLevel: data.certaintyLevel,
          sourceType: data.sourceType,
          projectId: allocation.projectId,
          resultCenterId: allocation.resultCenterId,
          managementAccountId: data.managementAccountId,
          contractId: allocation.contractId,
          createdById: actorUserId,
          installments: {
            create: installmentAmounts.map((amount, index) => {
              const dueDate = new Date(firstDueDate);
              dueDate.setUTCDate(dueDate.getUTCDate() + index * data.installmentIntervalDays);
              return {
                sequence: index + 1,
                dueDate,
                originalAmount: amount.toApiString(),
                openAmount: amount.toApiString(),
                status: "OPEN",
              };
            }),
          },
        },
        include: { installments: true },
      });

      await this.audit.record(tx, {
        actorType: "USER",
        actorUserId,
        module: "finance.receivable",
        action: "CREATE",
        entityType: "Receivable",
        entityId: created.id,
        source: "WEB",
        result: "SUCCESS",
        newValues: created,
      });

      return created;
    });

    return receivable;
  }

  async cancel(id: string, actorUserId: string) {
    const receivable = await this.get(id);
    const hasReceipts = receivable.installments.some((installment) => installment.status !== "OPEN");
    if (hasReceipts) {
      throw new DomainError(
        "RECEIVABLE_ALREADY_SETTLED",
        "Esta conta já possui recebimentos; utilize estorno em vez de cancelamento.",
      );
    }

    return this.prisma.client.$transaction(async (tx) => {
      await tx.receivableInstallment.updateMany({ where: { receivableId: id }, data: { status: "CANCELLED" } });
      const result = await tx.receivable.update({ where: { id }, data: { status: "CANCELLED" } });
      await this.audit.record(tx, {
        actorType: "USER",
        actorUserId,
        module: "finance.receivable",
        action: "CANCEL",
        entityType: "Receivable",
        entityId: id,
        source: "WEB",
        result: "SUCCESS",
      });
      return result;
    });
  }
}
