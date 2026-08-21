import { Injectable } from '@nestjs/common';
import { prisma } from '@aritech/database';
import { UpdatePayableApprovalPolicyDto } from '../presentation/dto/update-payable-approval-policy.dto';

@Injectable()
export class PayableApprovalPolicyService {
  get(legalEntityId: string) {
    return prisma.payableApprovalPolicy.findUnique({ where: { legalEntityId } });
  }

  set(input: UpdatePayableApprovalPolicyDto) {
    return prisma.payableApprovalPolicy.upsert({
      where: { legalEntityId: input.legalEntityId },
      create: { legalEntityId: input.legalEntityId, approvalRequiredFrom: input.approvalRequiredFrom, updatedBy: input.updatedBy },
      update: { approvalRequiredFrom: input.approvalRequiredFrom, updatedBy: input.updatedBy },
    });
  }
}
