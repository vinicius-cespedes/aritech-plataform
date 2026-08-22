import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PayableApprovalDecision, PayableStatus, prisma } from '@aritech/database';
import { PayableApprovalActionDto } from '../presentation/dto/payable-approval-action.dto';

@Injectable()
export class PayableApprovalsService {
  history(payableId: string) {
    return prisma.payableApproval.findMany({
      where: { payableId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(payableId: string, input: PayableApprovalActionDto) {
    const payable = await prisma.payable.findUnique({ where: { id: payableId } });
    if (!payable) throw new NotFoundException('PAYABLE_NOT_FOUND');
    if (payable.status !== PayableStatus.PENDING_APPROVAL) {
      throw new BadRequestException('PAYABLE_NOT_PENDING_APPROVAL');
    }

    return prisma.$transaction(async (tx) => {
      await tx.payableApproval.create({
        data: {
          payableId,
          payableVersion: payable.version,
          decision: PayableApprovalDecision.APPROVED,
          actorId: input.actorId,
          reason: input.reason,
        },
      });

      return tx.payable.update({
        where: { id: payableId },
        data: { status: PayableStatus.APPROVED },
        include: { approvals: { orderBy: { createdAt: 'desc' } } },
      });
    });
  }

  async reject(payableId: string, input: PayableApprovalActionDto) {
    const payable = await prisma.payable.findUnique({ where: { id: payableId } });
    if (!payable) throw new NotFoundException('PAYABLE_NOT_FOUND');
    if (payable.status !== PayableStatus.PENDING_APPROVAL) {
      throw new BadRequestException('PAYABLE_NOT_PENDING_APPROVAL');
    }

    return prisma.$transaction(async (tx) => {
      await tx.payableApproval.create({
        data: {
          payableId,
          payableVersion: payable.version,
          decision: PayableApprovalDecision.REJECTED,
          actorId: input.actorId,
          reason: input.reason,
        },
      });

      return tx.payable.update({
        where: { id: payableId },
        data: { status: PayableStatus.DRAFT },
        include: { approvals: { orderBy: { createdAt: 'desc' } } },
      });
    });
  }

  async invalidateForRelevantChange(payableId: string, actorId: string, reason: string) {
    const payable = await prisma.payable.findUnique({ where: { id: payableId } });
    if (!payable) throw new NotFoundException('PAYABLE_NOT_FOUND');

    const nextVersion = payable.version + 1;
    return prisma.$transaction(async (tx) => {
      if (payable.status === PayableStatus.APPROVED || payable.status === PayableStatus.OPEN) {
        await tx.payableApproval.create({
          data: {
            payableId,
            payableVersion: payable.version,
            decision: PayableApprovalDecision.INVALIDATED,
            actorId,
            reason,
          },
        });
      }

      const policy = await tx.payableApprovalPolicy.findUnique({ where: { legalEntityId: payable.legalEntityId } });
      const requiresApproval = !policy || payable.originalAmount.greaterThanOrEqualTo(policy.approvalRequiredFrom);

      return tx.payable.update({
        where: { id: payableId },
        data: {
          version: nextVersion,
          status: requiresApproval ? PayableStatus.PENDING_APPROVAL : PayableStatus.APPROVED,
        },
      });
    });
  }
}
