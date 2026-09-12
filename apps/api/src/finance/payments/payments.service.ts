import { Injectable, NotFoundException } from "@nestjs/common";
import { DomainError, Money } from "@aritech/shared";
import { CreatePaymentInput } from "@aritech/validation";
import { Prisma } from "@aritech/database";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../audit/audit.service";
import { PeriodsService } from "../periods/periods.service";
import { computeAllocationAmounts, computeRestoredInstallmentStatus } from "./payment-math.util";

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly periods: PeriodsService,
  ) {}

  list() {
    return this.prisma.client.payment.findMany({
      include: { allocations: true, financialAccount: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async get(id: string) {
    const payment = await this.prisma.client.payment.findUnique({
      where: { id },
      include: { allocations: { include: { payableInstallment: true } }, financialAccount: true },
    });
    if (!payment) throw new NotFoundException({ code: "NOT_FOUND", message: "Pagamento não encontrado." });
    return payment;
  }

  /**
   * Registra um pagamento com alocação a 1+ parcelas — docx §10 e
   * FINANCIAL_MODEL §8-9. Suporta pagamento parcial e liquidação de parcelas
   * de contas diferentes na mesma operação.
   */
  async create(data: CreatePaymentInput, actorUserId: string) {
    const paymentDate = new Date(data.paymentDate);
    await this.periods.assertCanModify(paymentDate);

    const account = await this.prisma.client.financialAccount.findUnique({ where: { id: data.financialAccountId } });
    if (!account || account.status !== "ACTIVE") {
      throw new DomainError("VALIDATION_ERROR", "Conta financeira inválida ou inativa.");
    }

    let totalCash = Money.zero(data.currency);
    const allocationPlans: Array<{
      installmentId: string;
      payableId: string;
      cashAmount: Money;
      debtReduction: Money;
      newOpenAmount: Money;
      raw: (typeof data.allocations)[number];
    }> = [];

    for (const allocation of data.allocations) {
      const installment = await this.prisma.client.payableInstallment.findUnique({
        where: { id: allocation.payableInstallmentId },
        include: { payable: true },
      });
      if (!installment) {
        throw new DomainError("NOT_FOUND", `Parcela ${allocation.payableInstallmentId} não encontrada.`);
      }
      if (!["OPEN", "PARTIALLY_SETTLED"].includes(installment.payable.status)) {
        throw new DomainError(
          "PAYABLE_NOT_APPROVED",
          `A conta a pagar da parcela ${installment.sequence} precisa estar aprovada/em aberto para receber pagamento.`,
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
        payableId: installment.payableId,
        cashAmount,
        debtReduction,
        newOpenAmount: openAmount.subtract(debtReduction),
        raw: allocation,
      });
    }

    const payment = await this.prisma.client.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          paymentDate,
          amount: totalCash.toApiString(),
          currency: data.currency,
          financialAccountId: data.financialAccountId,
          paymentMethod: data.paymentMethod,
          reference: data.reference,
          status: "CONFIRMED",
          createdById: actorUserId,
        },
      });

      for (const plan of allocationPlans) {
        await tx.paymentAllocation.create({
          data: {
            paymentId: created.id,
            payableInstallmentId: plan.installmentId,
            principalAmount: plan.raw.principalAmount,
            interestAmount: plan.raw.interestAmount,
            penaltyAmount: plan.raw.penaltyAmount,
            discountAmount: plan.raw.discountAmount,
            withholdingAmount: plan.raw.withholdingAmount,
            allocatedAmount: plan.cashAmount.toApiString(),
          },
        });

        const newStatus = plan.newOpenAmount.isZero() ? "SETTLED" : "PARTIALLY_SETTLED";
        await tx.payableInstallment.update({
          where: { id: plan.installmentId },
          data: { openAmount: plan.newOpenAmount.toApiString(), status: newStatus },
        });

        await this.recomputePayableStatus(tx, plan.payableId);
      }

      await this.audit.record(tx, {
        actorType: "USER",
        actorUserId,
        module: "finance.payment",
        action: "CONFIRM",
        entityType: "Payment",
        entityId: created.id,
        source: "WEB",
        result: "SUCCESS",
        newValues: { amount: created.amount, allocations: allocationPlans.length },
      });

      return created;
    });

    return this.get(payment.id);
  }

  /**
   * Deriva o status da Conta a Pagar a partir do status atual de suas
   * parcelas — usado tanto ao registrar quanto ao estornar um pagamento, para
   * que as duas direções (baixando e reabrindo o saldo) fiquem consistentes.
   */
  private async recomputePayableStatus(tx: Prisma.TransactionClient, payableId: string): Promise<void> {
    const installments = await tx.payableInstallment.findMany({ where: { payableId } });
    const relevant = installments.filter((i) => i.status !== "CANCELLED");
    if (relevant.length === 0) return;

    const allSettled = relevant.every((i) => i.status === "SETTLED");
    const anySettledOrPartial = relevant.some((i) => i.status === "SETTLED" || i.status === "PARTIALLY_SETTLED");
    const status = allSettled ? "SETTLED" : anySettledOrPartial ? "PARTIALLY_SETTLED" : "OPEN";

    await tx.payable.update({ where: { id: payableId }, data: { status } });
  }

  /** FINANCIAL_MODEL §8.5 — estorno cria um novo pagamento de reversão; o original não é apagado. */
  async reverse(id: string, reason: string, actorUserId: string) {
    const payment = await this.get(id);
    if (payment.status === "RECONCILED") {
      throw new DomainError(
        "PAYMENT_ALREADY_RECONCILED",
        "Desfaça a conciliação bancária antes de estornar este pagamento.",
      );
    }
    if (payment.status !== "CONFIRMED") {
      throw new DomainError("PAYABLE_ALREADY_SETTLED", "Este pagamento não pode mais ser estornado.");
    }

    const reversalDate = new Date();
    await this.periods.assertCanModify(reversalDate);

    const reversal = await this.prisma.client.$transaction(async (tx) => {
      const reversalPayment = await tx.payment.create({
        data: {
          paymentDate: reversalDate,
          amount: payment.amount,
          currency: payment.currency,
          financialAccountId: payment.financialAccountId,
          paymentMethod: payment.paymentMethod,
          reference: `Estorno de ${payment.id}`,
          status: "CONFIRMED",
          reversedPaymentId: payment.id,
          createdById: actorUserId,
        },
      });

      await tx.payment.update({ where: { id: payment.id }, data: { status: "REVERSED" } });

      for (const allocation of payment.allocations) {
        // Mesma fórmula de computeAllocationAmounts: retenção não soma ao
        // debtReduction (ver payment-math.util.ts).
        const debtReduction = Money.of(allocation.principalAmount.toString()).add(
          Money.of(allocation.discountAmount.toString()),
        );

        const installment = await tx.payableInstallment.findUniqueOrThrow({
          where: { id: allocation.payableInstallmentId },
        });
        const restoredOpen = Money.of(installment.openAmount.toString()).add(debtReduction);
        const originalAmount = Money.of(installment.originalAmount.toString());
        const restoredStatus = computeRestoredInstallmentStatus(restoredOpen, originalAmount);

        await tx.payableInstallment.update({
          where: { id: installment.id },
          data: { openAmount: restoredOpen.toApiString(), status: restoredStatus },
        });

        await this.recomputePayableStatus(tx, installment.payableId);
      }

      await this.audit.record(tx, {
        actorType: "USER",
        actorUserId,
        module: "finance.payment",
        action: "REVERSE",
        entityType: "Payment",
        entityId: payment.id,
        source: "WEB",
        result: "SUCCESS",
        reason,
        metadata: { reversalPaymentId: reversalPayment.id },
      });

      return reversalPayment;
    });

    return this.get(reversal.id);
  }
}
