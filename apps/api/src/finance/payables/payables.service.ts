import { Injectable, NotFoundException } from "@nestjs/common";
import { DomainError, Money } from "@aritech/shared";
import { CreatePayableInput } from "@aritech/validation";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../audit/audit.service";
import { PeriodsService } from "../periods/periods.service";

@Injectable()
export class PayablesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly periods: PeriodsService,
  ) {}

  list(status?: string) {
    return this.prisma.client.payable.findMany({
      where: status ? { status: status as never } : undefined,
      include: { installments: true, supplier: true, employee: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async get(id: string) {
    const payable = await this.prisma.client.payable.findUnique({
      where: { id },
      include: { installments: { orderBy: { sequence: "asc" } }, supplier: true, employee: true, project: true },
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
          projectId: data.projectId,
          costCenterId: data.costCenterId,
          managementAccountId: data.managementAccountId,
          contractId: data.contractId,
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
