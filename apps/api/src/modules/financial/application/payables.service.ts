import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CostDirectness, CounterpartyType, PayableStatus, Prisma, prisma } from '@aritech/database';
import { CreatePayableDto } from '../presentation/dto/create-payable.dto';

@Injectable()
export class PayablesService {
  list(legalEntityId: string) {
    return prisma.payable.findMany({
      where: { legalEntityId },
      include: { installments: true, allocations: true, documents: true, paymentTerm: true },
      orderBy: { competenceDate: 'desc' },
    });
  }

  get(id: string) {
    return prisma.payable.findUnique({
      where: { id },
      include: { installments: true, allocations: true, documents: true, paymentTerm: { include: { rules: true } } },
    });
  }

  async create(input: CreatePayableDto) {
    const total = new Prisma.Decimal(input.originalAmount);
    const supplier = await prisma.supplier.findFirst({ where: { id: input.supplierId, legalEntityId: input.legalEntityId, status: 'ACTIVE' } });
    if (!supplier) throw new NotFoundException('SUPPLIER_NOT_FOUND');
    if (!input.allocations?.length) throw new BadRequestException('AT_LEAST_ONE_ALLOCATION_REQUIRED');

    for (const allocation of input.allocations) {
      if (allocation.costDirectness === CostDirectness.DIRECT && (!allocation.businessLineId || !allocation.projectId)) {
        throw new BadRequestException('DIRECT_COST_REQUIRES_BUSINESS_LINE_AND_PROJECT');
      }
    }

    const allocatedTotal = input.allocations.reduce((sum, a) => sum.plus(new Prisma.Decimal(a.amount)), new Prisma.Decimal(0));
    if (!allocatedTotal.equals(total)) throw new BadRequestException('ALLOCATION_TOTAL_MUST_EQUAL_PAYABLE_TOTAL');

    const installments = await this.resolveInstallments(input, total);
    const installmentTotal = installments.reduce((sum, i) => sum.plus(i.amount), new Prisma.Decimal(0));
    if (!installmentTotal.equals(total)) throw new BadRequestException('INSTALLMENT_TOTAL_MUST_EQUAL_PAYABLE_TOTAL');

    const policy = await prisma.payableApprovalPolicy.findUnique({ where: { legalEntityId: input.legalEntityId } });
    const threshold = policy?.approvalRequiredFrom ?? new Prisma.Decimal(0);
    const status = total.greaterThanOrEqualTo(threshold) ? PayableStatus.PENDING_APPROVAL : PayableStatus.APPROVED;

    return prisma.$transaction(async (tx) => {
      const accountDefaults = await tx.managementAccount.findMany({
        where: { id: { in: input.allocations.map((a) => a.managementAccountId) }, status: 'ACTIVE' },
      });
      const defaultsById = new Map(accountDefaults.map((a) => [a.id, a]));
      if (defaultsById.size !== new Set(input.allocations.map((a) => a.managementAccountId)).size) throw new BadRequestException('INVALID_MANAGEMENT_ACCOUNT');

      return tx.payable.create({
        data: {
          legalEntityId: input.legalEntityId,
          counterpartyId: supplier.id,
          counterpartyType: CounterpartyType.SUPPLIER,
          description: input.description,
          documentNumber: input.documentNumber,
          documentType: input.documentType,
          issueDate: input.issueDate ? new Date(input.issueDate) : undefined,
          competenceDate: new Date(input.competenceDate),
          originalAmount: total,
          currency: input.currency,
          status,
          sourceType: input.sourceType,
          sourceId: input.sourceId,
          contractId: input.contractId,
          purchaseOrderId: input.purchaseOrderId,
          paymentTermId: input.paymentTermId,
          createdBy: input.createdBy,
          installments: { create: installments.map((i, index) => ({ sequence: index + 1, dueDate: i.dueDate, originalDueDate: i.dueDate, expectedPaymentDate: i.dueDate, originalAmount: i.amount, openAmount: i.amount, paymentMethod: i.paymentMethod })) },
          allocations: { create: input.allocations.map((a) => {
            const account = defaultsById.get(a.managementAccountId)!;
            return {
              sourceType: 'PAYABLE',
              managementAccountId: a.managementAccountId,
              economicNature: a.economicNature,
              dreGroupId: a.dreGroupId ?? account.dreGroupId,
              cashFlowGroupId: a.cashFlowGroupId ?? account.cashFlowGroupId,
              costCenterId: a.costCenterId,
              businessLineId: a.businessLineId,
              projectId: a.projectId,
              contractId: a.contractId ?? input.contractId,
              amount: a.amount,
              competenceDate: new Date(a.competenceDate ?? input.competenceDate),
              costBehavior: a.costBehavior,
              costDirectness: a.costDirectness,
              createdBy: input.createdBy,
            };
          }) },
          documents: input.documents ? { create: input.documents } : undefined,
        },
        include: { installments: true, allocations: true, documents: true, paymentTerm: true },
      });
    });
  }

  private async resolveInstallments(input: CreatePayableDto, total: Prisma.Decimal) {
    if (input.installments?.length) {
      return input.installments.map((i) => ({ dueDate: new Date(i.dueDate), amount: new Prisma.Decimal(i.amount), paymentMethod: i.paymentMethod }));
    }
    if (!input.paymentTermId) throw new BadRequestException('PAYMENT_TERM_OR_INSTALLMENTS_REQUIRED');
    const term = await prisma.paymentTerm.findUnique({ where: { id: input.paymentTermId }, include: { rules: { orderBy: { sequence: 'asc' } } } });
    if (!term || !term.rules.length) throw new BadRequestException('INVALID_PAYMENT_TERM');
    const baseValue = input.paymentTermBaseDate ?? input.issueDate;
    if (!baseValue) throw new BadRequestException('PAYMENT_TERM_BASE_DATE_REQUIRED');
    const base = new Date(baseValue);
    let assigned = new Prisma.Decimal(0);
    return term.rules.map((rule, index) => {
      const dueDate = new Date(base);
      dueDate.setUTCDate(dueDate.getUTCDate() + rule.daysAfterBase);
      const amount = index === term.rules.length - 1 ? total.minus(assigned) : total.mul(rule.percentage).div(100).toDecimalPlaces(4);
      assigned = assigned.plus(amount);
      return { dueDate, amount, paymentMethod: undefined };
    });
  }
}
