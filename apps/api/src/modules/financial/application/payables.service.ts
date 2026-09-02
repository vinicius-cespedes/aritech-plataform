import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CostDirectness, CounterpartyType, PayableStatus, Prisma, prisma } from '@aritech/database';
import { CreatePayableDto } from '../presentation/dto/create-payable.dto';

@Injectable()
export class PayablesService {
  list(legalEntityId: string) {
    return prisma.payable.findMany({ where: { legalEntityId }, include: { installments: true, allocations: true, documents: true, paymentTerm: true }, orderBy: { competenceDate: 'desc' } });
  }
  get(id: string) {
    return prisma.payable.findUnique({ where: { id }, include: { installments: true, allocations: true, documents: true, paymentTerm: { include: { rules: true } } } });
  }

  async create(input: CreatePayableDto) {
    const total = new Prisma.Decimal(input.originalAmount);
    let defaultPaymentTermId:string|undefined;

    if (input.counterpartyType === CounterpartyType.SUPPLIER) {
      const supplier = await prisma.supplier.findFirst({ where: { id: input.counterpartyId, legalEntityId: input.legalEntityId, status: 'ACTIVE' } });
      if (!supplier) throw new NotFoundException('SUPPLIER_NOT_FOUND');
      defaultPaymentTermId = supplier.defaultPaymentTermId ?? undefined;
    } else if (input.counterpartyType === CounterpartyType.EMPLOYEE) {
      const employee = await prisma.$queryRaw<Array<{id:string}>>(Prisma.sql`
        SELECT id FROM employees WHERE id=${input.counterpartyId}::uuid AND legal_entity_id=${input.legalEntityId}::uuid AND status='ACTIVE' LIMIT 1
      `);
      if (!employee.length) throw new NotFoundException('EMPLOYEE_NOT_FOUND');
    } else {
      throw new BadRequestException('COUNTERPARTY_TYPE_NOT_SUPPORTED_YET');
    }

    if (!input.allocations?.length) throw new BadRequestException('AT_LEAST_ONE_ALLOCATION_REQUIRED');
    for (const allocation of input.allocations) {
      if (allocation.costDirectness === CostDirectness.DIRECT && (!allocation.businessLineId || !allocation.projectId)) {
        throw new BadRequestException('DIRECT_COST_REQUIRES_BUSINESS_LINE_AND_PROJECT');
      }
    }

    const allocatedTotal = input.allocations.reduce((sum, allocation) => sum.plus(new Prisma.Decimal(allocation.amount)), new Prisma.Decimal(0));
    if (!allocatedTotal.equals(total)) throw new BadRequestException('ALLOCATION_TOTAL_MUST_EQUAL_PAYABLE_TOTAL');

    const effectivePaymentTermId = input.paymentTermId ?? defaultPaymentTermId;
    const installments = await this.resolveInstallments(input, total, effectivePaymentTermId);
    const installmentTotal = installments.reduce((sum, installment) => sum.plus(installment.amount), new Prisma.Decimal(0));
    if (!installmentTotal.equals(total)) throw new BadRequestException('INSTALLMENT_TOTAL_MUST_EQUAL_PAYABLE_TOTAL');

    const policy = await prisma.payableApprovalPolicy.findUnique({ where: { legalEntityId: input.legalEntityId } });
    const threshold = policy?.approvalRequiredFrom ?? new Prisma.Decimal(0);
    const status = total.greaterThanOrEqualTo(threshold) ? PayableStatus.PENDING_APPROVAL : PayableStatus.APPROVED;

    return prisma.$transaction(async (tx) => {
      const accountDefaults = await tx.managementAccount.findMany({ where: { id: { in: input.allocations.map(a => a.managementAccountId) }, status: 'ACTIVE' } });
      const defaultsById = new Map(accountDefaults.map(account => [account.id, account]));
      if (defaultsById.size !== new Set(input.allocations.map(a => a.managementAccountId)).size) throw new BadRequestException('INVALID_MANAGEMENT_ACCOUNT');

      const created = await tx.payable.create({
        data: {
          legalEntityId: input.legalEntityId,
          counterpartyId: input.counterpartyId,
          counterpartyType: input.counterpartyType,
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
          paymentTermId: effectivePaymentTermId,
          createdBy: input.createdBy,
          installments: { create: installments.map((installment,index)=>({ sequence:index+1,dueDate:installment.dueDate,originalDueDate:installment.dueDate,expectedPaymentDate:installment.dueDate,originalAmount:installment.amount,openAmount:installment.amount,paymentMethod:installment.paymentMethod })) },
          allocations: { create: input.allocations.map(allocation=>{ const account=defaultsById.get(allocation.managementAccountId)!; return { sourceType:'PAYABLE',managementAccountId:allocation.managementAccountId,economicNature:allocation.economicNature??account.economicNature,dreGroupId:allocation.dreGroupId??account.dreGroupId,cashFlowGroupId:allocation.cashFlowGroupId??account.cashFlowGroupId,costCenterId:allocation.costCenterId,businessLineId:allocation.businessLineId,projectId:allocation.projectId,contractId:allocation.contractId??input.contractId,amount:allocation.amount,competenceDate:new Date(allocation.competenceDate??input.competenceDate),costBehavior:allocation.costBehavior??account.defaultCostBehavior,costDirectness:allocation.costDirectness,createdBy:input.createdBy }; }) },
          documents: input.documents ? { create: input.documents } : undefined,
        },
        include: { installments:true, allocations:true, documents:true, paymentTerm:true },
      });

      await tx.$executeRaw(Prisma.sql`UPDATE payables SET obligation_type=${input.obligationType} WHERE id=${created.id}::uuid`);
      return { ...created, obligationType: input.obligationType };
    });
  }

  private async resolveInstallments(input: CreatePayableDto, total: Prisma.Decimal, paymentTermId?: string) {
    if (input.installments?.length) return input.installments.map(i=>({dueDate:new Date(i.dueDate),amount:new Prisma.Decimal(i.amount),paymentMethod:i.paymentMethod}));
    if (!paymentTermId) throw new BadRequestException('PAYMENT_TERM_OR_INSTALLMENTS_REQUIRED');
    const term = await prisma.paymentTerm.findUnique({ where:{id:paymentTermId}, include:{rules:{orderBy:{sequence:'asc'}}} });
    if (!term || !term.rules.length) throw new BadRequestException('INVALID_PAYMENT_TERM');
    const baseValue=input.paymentTermBaseDate??input.issueDate;
    if (!baseValue) throw new BadRequestException('PAYMENT_TERM_BASE_DATE_REQUIRED');
    const base=new Date(baseValue); let assigned=new Prisma.Decimal(0);
    return term.rules.map((rule,index)=>{ const dueDate=new Date(base); dueDate.setUTCDate(dueDate.getUTCDate()+rule.daysAfterBase); const amount=index===term.rules.length-1?total.minus(assigned):total.mul(rule.percentage).div(100).toDecimalPlaces(4); assigned=assigned.plus(amount); return {dueDate,amount,paymentMethod:undefined}; });
  }
}
