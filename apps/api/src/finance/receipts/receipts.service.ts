import { Injectable, NotFoundException } from "@nestjs/common";
import { DomainError, Money } from "@aritech/shared";
import { CreateReceiptInput } from "@aritech/validation";
import { Prisma } from "@aritech/database";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../audit/audit.service";
import { PeriodsService } from "../periods/periods.service";
import { computeAllocationAmounts, computeRestoredInstallmentStatus } from "../payments/payment-math.util";

@Injectable()
export class ReceiptsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly periods: PeriodsService,
  ) {}

  list() {
    return this.prisma.client.receipt.findMany({
      include: { allocations: true, financialAccount: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async get(id: string) {
    const receipt = await this.prisma.client.receipt.findUnique({
      where: { id },
      include: { allocations: { include: { receivableInstallment: true } }, financialAccount: true },
    });
    if (!receipt) throw new NotFoundException({ code: "NOT_FOUND", message: "Recebimento não encontrado." });
    return receipt;
  }

  /**
   * Registra um recebimento com alocação a 1+ parcelas — docx §12 e
   * FINANCIAL_MODEL §12-13. Espelha PaymentsService, com a mesma lógica de
   * cálculo (docx trata Pagamento/Recebimento como eventos simétricos).
   */
  async create(data: CreateReceiptInput, actorUserId: string) {
    const receiptDate = new Date(data.receiptDate);
    await this.periods.assertCanModify(receiptDate);

    const account = await this.prisma.client.financialAccount.findUnique({ where: { id: data.financialAccountId } });
    if (!account || account.status !== "ACTIVE") {
      throw new DomainError("VALIDATION_ERROR", "Conta financeira inválida ou inativa.");
    }

    let totalCash = Money.zero(data.currency);
    const allocationPlans: Array<{
      installmentId: string;
      receivableId: string;
      cashAmount: Money;
      debtReduction: Money;
      newOpenAmount: Money;
      raw: (typeof data.allocations)[number];
    }> = [];

    for (const allocation of data.allocations) {
      const installment = await this.prisma.client.receivableInstallment.findUnique({
        where: { id: allocation.receivableInstallmentId },
        include: { receivable: true },
      });
      if (!installment) {
        throw new DomainError("NOT_FOUND", `Parcela ${allocation.receivableInstallmentId} não encontrada.`);
      }
      if (!["OPEN", "PARTIALLY_SETTLED"].includes(installment.receivable.status)) {
        throw new DomainError(
          "RECEIVABLE_ALREADY_SETTLED",
          `A conta a receber da parcela ${installment.sequence} não está em aberto.`,
        );
      }

      const { cashAmount, debtReduction } = computeAllocationAmounts({
        principalAmount: Money.of(allocation.principalAmount, data.currency),
        interestAmount: Money.of(allocation.interestAmount, data.currency),
        penaltyAmount: Money.of(allocation.penaltyAmount, data.currency),
        discountAmount: Money.of(allocation.discountAmount, data.currency),
        withholdingAmount: Money.of(allocation.withholdingAmount, data.currency),
      });

      const openAmount = Money.of(installment.openAmount.toString(), data.currency);
      if (debtReduction.greaterThan(openAmount)) {
        throw new DomainError(
          "INSTALLMENT_AMOUNT_EXCEEDED",
          `O valor alocado à parcela ${installment.sequence} excede o saldo em aberto.`,
        );
      }

      totalCash = totalCash.add(cashAmount);
      allocationPlans.push({
        installmentId: installment.id,
        receivableId: installment.receivableId,
        cashAmount,
        debtReduction,
        newOpenAmount: openAmount.subtract(debtReduction),
        raw: allocation,
      });
    }

    const receipt = await this.prisma.client.$transaction(async (tx) => {
      const created = await tx.receipt.create({
        data: {
          receiptDate,
          amount: totalCash.toApiString(),
          currency: data.currency,
          financialAccountId: data.financialAccountId,
          receiptMethod: data.receiptMethod,
          reference: data.reference,
          status: "CONFIRMED",
          createdById: actorUserId,
        },
      });

      for (const plan of allocationPlans) {
        await tx.receiptAllocation.create({
          data: {
            receiptId: created.id,
            receivableInstallmentId: plan.installmentId,
            principalAmount: plan.raw.principalAmount,
            interestAmount: plan.raw.interestAmount,
            penaltyAmount: plan.raw.penaltyAmount,
            discountAmount: plan.raw.discountAmount,
            withholdingAmount: plan.raw.withholdingAmount,
            allocatedAmount: plan.cashAmount.toApiString(),
          },
        });

        const newStatus = plan.newOpenAmount.isZero() ? "SETTLED" : "PARTIALLY_SETTLED";
        await tx.receivableInstallment.update({
          where: { id: plan.installmentId },
          data: { openAmount: plan.newOpenAmount.toApiString(), status: newStatus },
        });

        await this.recomputeReceivableStatus(tx, plan.receivableId);
      }

      await this.audit.record(tx, {
        actorType: "USER",
        actorUserId,
        module: "finance.receipt",
        action: "CONFIRM",
        entityType: "Receipt",
        entityId: created.id,
        source: "WEB",
        result: "SUCCESS",
        newValues: { amount: created.amount, allocations: allocationPlans.length },
      });

      return created;
    });

    return this.get(receipt.id);
  }

  /**
   * Deriva o status da Conta a Receber a partir do status atual de suas
   * parcelas — usado tanto ao registrar quanto ao estornar um recebimento,
   * para que as duas direções (baixando e reabrindo o saldo) fiquem
   * consistentes.
   */
  private async recomputeReceivableStatus(tx: Prisma.TransactionClient, receivableId: string): Promise<void> {
    const installments = await tx.receivableInstallment.findMany({ where: { receivableId } });
    const relevant = installments.filter((i) => i.status !== "CANCELLED" && i.status !== "WRITTEN_OFF");
    if (relevant.length === 0) return;

    const allSettled = relevant.every((i) => i.status === "SETTLED");
    const anySettledOrPartial = relevant.some((i) => i.status === "SETTLED" || i.status === "PARTIALLY_SETTLED");
    const status = allSettled ? "SETTLED" : anySettledOrPartial ? "PARTIALLY_SETTLED" : "OPEN";

    await tx.receivable.update({ where: { id: receivableId }, data: { status } });
  }

  /** FINANCIAL_MODEL §12.5 — estorno não apaga o recebimento original. */
  async reverse(id: string, reason: string, actorUserId: string) {
    const receipt = await this.get(id);
    if (receipt.status === "RECONCILED") {
      throw new DomainError(
        "RECEIPT_ALREADY_RECONCILED",
        "Desfaça a conciliação bancária antes de estornar este recebimento.",
      );
    }
    if (receipt.status !== "CONFIRMED") {
      throw new DomainError("RECEIVABLE_ALREADY_SETTLED", "Este recebimento não pode mais ser estornado.");
    }

    const reversalDate = new Date();
    await this.periods.assertCanModify(reversalDate);

    const reversal = await this.prisma.client.$transaction(async (tx) => {
      const reversalReceipt = await tx.receipt.create({
        data: {
          receiptDate: reversalDate,
          amount: receipt.amount,
          currency: receipt.currency,
          financialAccountId: receipt.financialAccountId,
          receiptMethod: receipt.receiptMethod,
          reference: `Estorno de ${receipt.id}`,
          status: "CONFIRMED",
          reversedReceiptId: receipt.id,
          createdById: actorUserId,
        },
      });

      await tx.receipt.update({ where: { id: receipt.id }, data: { status: "REVERSED" } });

      for (const allocation of receipt.allocations) {
        // Mesma fórmula de computeAllocationAmounts: retenção não soma ao
        // debtReduction (ver payment-math.util.ts).
        const debtReduction = Money.of(allocation.principalAmount.toString()).add(
          Money.of(allocation.discountAmount.toString()),
        );

        const installment = await tx.receivableInstallment.findUniqueOrThrow({
          where: { id: allocation.receivableInstallmentId },
        });
        const restoredOpen = Money.of(installment.openAmount.toString()).add(debtReduction);
        const originalAmount = Money.of(installment.originalAmount.toString());
        const restoredStatus = computeRestoredInstallmentStatus(restoredOpen, originalAmount);

        await tx.receivableInstallment.update({
          where: { id: installment.id },
          data: { openAmount: restoredOpen.toApiString(), status: restoredStatus },
        });

        await this.recomputeReceivableStatus(tx, installment.receivableId);
      }

      await this.audit.record(tx, {
        actorType: "USER",
        actorUserId,
        module: "finance.receipt",
        action: "REVERSE",
        entityType: "Receipt",
        entityId: receipt.id,
        source: "WEB",
        result: "SUCCESS",
        reason,
        metadata: { reversalReceiptId: reversalReceipt.id },
      });

      return reversalReceipt;
    });

    return this.get(reversal.id);
  }
}
