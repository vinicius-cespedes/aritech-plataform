import { Injectable, NotFoundException } from "@nestjs/common";
import { DomainError, Money } from "@aritech/shared";
import { CreatePayableInput, UpdatePayableClassificationInput } from "@aritech/validation";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../audit/audit.service";
import { PeriodsService } from "../periods/periods.service";
import { AllocationService } from "../contracts/allocation.service";

@Injectable()
export class PayablesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly periods: PeriodsService,
    private readonly allocation: AllocationService,
  ) {}

  list(status?: string) {
    return this.prisma.client.payable.findMany({
      where: status ? { status: status as never } : undefined,
      include: {
        installments: true,
        supplier: true,
        employee: true,
        costCenter: true,
        contract: { include: { customer: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async get(id: string) {
    const payable = await this.prisma.client.payable.findUnique({
      where: { id },
      include: {
        installments: { orderBy: { sequence: "asc" } },
        supplier: true,
        employee: true,
        project: true,
        costCenter: true,
        managementAccount: true,
        contract: { include: { customer: true } },
      },
    });
    if (!payable) throw new NotFoundException({ code: "NOT_FOUND", message: "Conta a pagar não encontrada." });
    return payable;
  }

  /**
   * Cria a Conta a Pagar com suas parcelas em uma única transação —
   * FINANCIAL_MODEL §39.1. Docx §8: "Novos lançamentos entram inicialmente em
   * aprovação" — status inicial já é PENDING_APPROVAL.
   */
  async create(data: CreatePayableInput, actorUserId: string) {
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

    const payable = await this.prisma.client.$transaction(async (tx) => {
      const allocation = await this.allocation.resolveCostAllocation(tx, {
        costCenterId: data.costCenterId,
        contractId: data.contractId,
        projectId: data.projectId,
      });
      const created = await tx.payable.create({
        data: {
          counterpartyType: data.counterpartyType,
          supplierId: data.supplierId,
          employeeId: data.employeeId,
          employeeObligationType: data.employeeObligationType,
          description: data.description,
          documentNumber: data.documentNumber,
          documentType: data.documentType,
          issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
          competenceDate,
          originalAmount: data.originalAmount,
          currency: data.currency,
          status: "PENDING_APPROVAL",
          sourceType: data.sourceType,
          isDirectCost: data.isDirectCost,
          projectId: allocation.projectId,
          costCenterId: allocation.costCenterId,
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
        module: "finance.payable",
        action: "CREATE",
        entityType: "Payable",
        entityId: created.id,
        source: "WEB",
        result: "SUCCESS",
        newValues: created,
      });

      return created;
    });

    return payable;
  }

  /**
   * Revisão de classificação: altera contraparte, conta gerencial, centro de
   * custo, contrato e projeto sem tocar em valores ou parcelas. Vale também
   * para contas já pagas (caso dos lançamentos importados). As mesmas regras da
   * criação são reaplicadas sobre o resultado final.
   */
  async updateClassification(id: string, data: UpdatePayableClassificationInput, actorUserId: string) {
    const payable = await this.get(id);
    if (payable.status === "CANCELLED") {
      throw new DomainError("PAYABLE_NOT_EDITABLE", "Contas canceladas não podem ser editadas.");
    }
    await this.periods.assertCanModify(payable.competenceDate);

    const counterpartyType = data.counterpartyType ?? payable.counterpartyType;
    let supplierId = data.supplierId !== undefined ? data.supplierId : payable.supplierId;
    let employeeId = data.employeeId !== undefined ? data.employeeId : payable.employeeId;
    if (counterpartyType !== "SUPPLIER") supplierId = null;
    if (counterpartyType !== "EMPLOYEE") employeeId = null;
    if (counterpartyType === "SUPPLIER" && !supplierId) {
      throw new DomainError("VALIDATION_ERROR", "Informe o fornecedor para este tipo de contraparte.");
    }
    if (counterpartyType === "EMPLOYEE" && !employeeId) {
      throw new DomainError("VALIDATION_ERROR", "Informe o colaborador para este tipo de contraparte.");
    }

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
      data.costCenterId !== undefined || data.contractId !== undefined || data.projectId !== undefined;

    const updated = await this.prisma.client.$transaction(async (tx) => {
      let costCenterId = payable.costCenterId;
      let contractId = payable.contractId;
      let projectId = payable.projectId;
      if (touchesAllocation) {
        const allocation = await this.allocation.resolveCostAllocation(tx, {
          costCenterId: data.costCenterId ?? payable.costCenterId,
          contractId: data.contractId !== undefined ? data.contractId : payable.contractId,
          projectId: data.projectId !== undefined ? data.projectId : payable.projectId,
        });
        ({ costCenterId, contractId, projectId } = allocation);
      }

      const result = await tx.payable.update({
        where: { id },
        data: {
          description: data.description,
          counterpartyType,
          supplierId,
          employeeId,
          managementAccountId: data.managementAccountId,
          costCenterId,
          contractId,
          projectId,
        },
      });
      // Salvar/confirmar a classificação encerra a pendência de revisão dos importados.
      await tx.payableInstallment.updateMany({
        where: { payableId: id, notes: { startsWith: "Importado automaticamente" } },
        data: { notes: null },
      });
      await this.audit.record(tx, {
        actorType: "USER",
        actorUserId,
        module: "finance.payable",
        action: "UPDATE_CLASSIFICATION",
        entityType: "Payable",
        entityId: id,
        source: "WEB",
        result: "SUCCESS",
        previousValues: {
          counterpartyType: payable.counterpartyType,
          supplierId: payable.supplierId,
          employeeId: payable.employeeId,
          costCenterId: payable.costCenterId,
          managementAccountId: payable.managementAccountId,
          contractId: payable.contractId,
          projectId: payable.projectId,
          description: payable.description,
        },
        newValues: result,
      });
      return result;
    });
    return updated;
  }

  /** Docx §9: aprovar muda o lançamento para estado aprovado/em aberto (OPEN). */
  async approve(id: string, actorUserId: string) {
    const payable = await this.get(id);
    if (payable.status !== "PENDING_APPROVAL") {
      throw new DomainError("PAYABLE_NOT_APPROVED", "Somente contas pendentes de aprovação podem ser aprovadas.");
    }

    const updated = await this.prisma.client.$transaction(async (tx) => {
      const result = await tx.payable.update({ where: { id }, data: { status: "OPEN" } });
      await this.audit.record(tx, {
        actorType: "USER",
        actorUserId,
        module: "finance.payable",
        action: "APPROVE",
        entityType: "Payable",
        entityId: id,
        source: "WEB",
        result: "SUCCESS",
      });
      return result;
    });

    return updated;
  }

  /** Docx §9: reprovar exige justificativa e retorna o lançamento para correção (DRAFT). */
  async reject(id: string, reason: string, actorUserId: string) {
    const payable = await this.get(id);
    if (payable.status !== "PENDING_APPROVAL") {
      throw new DomainError("PAYABLE_NOT_APPROVED", "Somente contas pendentes de aprovação podem ser reprovadas.");
    }

    return this.prisma.client.$transaction(async (tx) => {
      const result = await tx.payable.update({ where: { id }, data: { status: "DRAFT" } });
      await this.audit.record(tx, {
        actorType: "USER",
        actorUserId,
        module: "finance.payable",
        action: "REJECT",
        entityType: "Payable",
        entityId: id,
        source: "WEB",
        result: "SUCCESS",
        reason,
      });
      return result;
    });
  }

  /** FINANCIAL_MODEL §6.7: "Uma conta com pagamento não poderá ser cancelada; deverá ser estornada." */
  async cancel(id: string, actorUserId: string) {
    const payable = await this.get(id);
    const hasPayments = payable.installments.some((installment) => installment.status !== "OPEN");
    if (hasPayments) {
      throw new DomainError(
        "PAYABLE_HAS_PAYMENTS",
        "Esta conta já possui liquidações; cancele por estorno, não por exclusão.",
      );
    }
    if (payable.status === "SETTLED" || payable.status === "CANCELLED") {
      throw new DomainError("PAYABLE_ALREADY_SETTLED", "Esta conta não pode mais ser cancelada.");
    }

    return this.prisma.client.$transaction(async (tx) => {
      await tx.payableInstallment.updateMany({ where: { payableId: id }, data: { status: "CANCELLED" } });
      const result = await tx.payable.update({ where: { id }, data: { status: "CANCELLED" } });
      await this.audit.record(tx, {
        actorType: "USER",
        actorUserId,
        module: "finance.payable",
        action: "CANCEL",
        entityType: "Payable",
        entityId: id,
        source: "WEB",
        result: "SUCCESS",
      });
      return result;
    });
  }
}
