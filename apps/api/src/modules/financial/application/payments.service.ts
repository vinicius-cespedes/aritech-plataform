import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  PayableInstallmentStatus,
  PayableStatus,
  PaymentOrigin,
  Prisma,
  SettlementStatus,
  prisma,
} from '@aritech/database';
import { CreatePaymentDto, ReversePaymentDto } from '../presentation/dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  list(legalEntityId: string) {
    return prisma.payment.findMany({
      where: { legalEntityId },
      include: { allocations: { include: { payableInstallment: true } } },
      orderBy: { paymentDate: 'desc' },
    });
  }

  async create(input: CreatePaymentDto) {
    if (!input.allocations.length) throw new BadRequestException('AT_LEAST_ONE_PAYMENT_ALLOCATION_REQUIRED');

    const account = await prisma.financialAccount.findFirst({
      where: { id: input.financialAccountId, legalEntityId: input.legalEntityId, status: 'ACTIVE' },
    });
    if (!account) throw new NotFoundException('FINANCIAL_ACCOUNT_NOT_FOUND');

    const installmentIds = input.allocations.map((allocation) => allocation.payableInstallmentId);
    const installments = await prisma.payableInstallment.findMany({
      where: { id: { in: installmentIds } },
      include: { payable: true },
    });
    if (installments.length !== new Set(installmentIds).size) throw new BadRequestException('INVALID_PAYABLE_INSTALLMENT');

    const installmentsById = new Map(installments.map((installment) => [installment.id, installment]));
    let cashAmount = new Prisma.Decimal(0);

    const normalized = input.allocations.map((allocation) => {
      const installment = installmentsById.get(allocation.payableInstallmentId)!;
      if (installment.payable.legalEntityId !== input.legalEntityId) throw new BadRequestException('LEGAL_ENTITY_MISMATCH');
      const payableStatus = installment.payable.status;
      if (
        payableStatus !== PayableStatus.APPROVED &&
        payableStatus !== PayableStatus.OPEN &&
        payableStatus !== PayableStatus.PARTIALLY_SETTLED
      ) {
        throw new BadRequestException('PAYABLE_NOT_APPROVED_FOR_PAYMENT');
      }

      const principal = new Prisma.Decimal(allocation.principalAmount);
      const interest = new Prisma.Decimal(allocation.interestAmount ?? 0);
      const penalty = new Prisma.Decimal(allocation.penaltyAmount ?? 0);
      const discount = new Prisma.Decimal(allocation.discountAmount ?? 0);
      if (principal.lessThanOrEqualTo(0)) throw new BadRequestException('PRINCIPAL_MUST_BE_POSITIVE');
      if (principal.greaterThan(installment.openAmount)) throw new BadRequestException('PRINCIPAL_EXCEEDS_OPEN_AMOUNT');

      const allocatedAmount = principal.plus(interest).plus(penalty).minus(discount);
      if (allocatedAmount.lessThan(0)) throw new BadRequestException('PAYMENT_ALLOCATION_CANNOT_BE_NEGATIVE');
      cashAmount = cashAmount.plus(allocatedAmount);

      return { installment, principal, interest, penalty, discount, allocatedAmount };
    });

    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          legalEntityId: input.legalEntityId,
          paymentDate: new Date(input.paymentDate),
          amount: cashAmount,
          currency: input.currency,
          financialAccountId: input.financialAccountId,
          paymentMethod: input.paymentMethod,
          origin: PaymentOrigin.MANUAL,
          reference: input.reference,
          status: SettlementStatus.CONFIRMED,
          createdBy: input.createdBy,
          allocations: {
            create: normalized.map((item) => ({
              payableInstallmentId: item.installment.id,
              principalAmount: item.principal,
              interestAmount: item.interest,
              penaltyAmount: item.penalty,
              discountAmount: item.discount,
              withholdingAmount: 0,
              allocatedAmount: item.allocatedAmount,
            })),
          },
        },
        include: { allocations: true },
      });

      const payableIds = new Set<string>();
      for (const item of normalized) {
        const newOpenAmount = item.installment.openAmount.minus(item.principal);
        await tx.payableInstallment.update({
          where: { id: item.installment.id },
          data: {
            openAmount: newOpenAmount,
            status: newOpenAmount.equals(0) ? PayableInstallmentStatus.SETTLED : PayableInstallmentStatus.PARTIALLY_SETTLED,
          },
        });
        payableIds.add(item.installment.payableId);
      }

      for (const payableId of payableIds) await this.refreshPayableStatus(tx, payableId);
      return payment;
    });
  }

  async reverse(paymentId: string, input: ReversePaymentDto) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { allocations: { include: { payableInstallment: true } } },
    });
    if (!payment) throw new NotFoundException('PAYMENT_NOT_FOUND');
    if (payment.status === SettlementStatus.REVERSED || payment.reversesPaymentId) {
      throw new BadRequestException('PAYMENT_ALREADY_REVERSED_OR_IS_REVERSAL');
    }
    if (payment.status === SettlementStatus.RECONCILED) {
      throw new BadRequestException('RECONCILED_PAYMENT_MUST_BE_UNRECONCILED_FIRST');
    }

    return prisma.$transaction(async (tx) => {
      const reversal = await tx.payment.create({
        data: {
          legalEntityId: payment.legalEntityId,
          paymentDate: new Date(),
          amount: payment.amount.negated(),
          currency: payment.currency,
          financialAccountId: payment.financialAccountId,
          paymentMethod: payment.paymentMethod,
          origin: PaymentOrigin.MANUAL,
          reference: `REVERSAL:${payment.id}`,
          status: SettlementStatus.CONFIRMED,
          reversesPaymentId: payment.id,
          reversalReason: input.reason,
          createdBy: input.actorId,
          allocations: {
            create: payment.allocations.map((allocation) => ({
              payableInstallmentId: allocation.payableInstallmentId,
              principalAmount: allocation.principalAmount.negated(),
              interestAmount: allocation.interestAmount.negated(),
              penaltyAmount: allocation.penaltyAmount.negated(),
              discountAmount: allocation.discountAmount.negated(),
              withholdingAmount: allocation.withholdingAmount.negated(),
              allocatedAmount: allocation.allocatedAmount.negated(),
            })),
          },
        },
        include: { allocations: true },
      });

      const payableIds = new Set<string>();
      for (const allocation of payment.allocations) {
        const newOpenAmount = allocation.payableInstallment.openAmount.plus(allocation.principalAmount);
        const status = newOpenAmount.equals(allocation.payableInstallment.originalAmount)
          ? PayableInstallmentStatus.OPEN
          : PayableInstallmentStatus.PARTIALLY_SETTLED;
        await tx.payableInstallment.update({
          where: { id: allocation.payableInstallmentId },
          data: { openAmount: newOpenAmount, status },
        });
        payableIds.add(allocation.payableInstallment.payableId);
      }

      await tx.payment.update({ where: { id: payment.id }, data: { status: SettlementStatus.REVERSED } });
      for (const payableId of payableIds) await this.refreshPayableStatus(tx, payableId);
      return reversal;
    });
  }

  private async refreshPayableStatus(tx: Prisma.TransactionClient, payableId: string) {
    const installments = await tx.payableInstallment.findMany({ where: { payableId } });
    const allSettled = installments.every((installment) => installment.openAmount.equals(0));
    const anyPaid = installments.some((installment) => installment.openAmount.lessThan(installment.originalAmount));
    const status = allSettled
      ? PayableStatus.SETTLED
      : anyPaid
        ? PayableStatus.PARTIALLY_SETTLED
        : PayableStatus.OPEN;
    await tx.payable.update({ where: { id: payableId }, data: { status } });
  }
}
