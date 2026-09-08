import { Injectable } from "@nestjs/common";
import { ActorType, AuditResult, Prisma } from "@aritech/database";
import { PrismaService } from "../common/prisma/prisma.service";

/** Cliente Prisma "normal" ou dentro de uma transação em andamento. */
type PrismaLike = Pick<Prisma.TransactionClient, "auditEvent">;

export interface RecordAuditEventInput {
  actorType: ActorType;
  actorUserId?: string;
  actorLabel?: string;
  sessionId?: string;
  requestId?: string;
  module: string;
  action: string;
  entityType: string;
  entityId?: string;
  companyId?: string;
  projectId?: string;
  source: string;
  result: AuditResult;
  reason?: string;
  previousValues?: unknown;
  newValues?: unknown;
  metadata?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Serviço centralizado de auditoria — ADR-006.
 *
 * Uso típico dentro de um serviço de aplicação, na MESMA transação da
 * operação de negócio (ADR-006 §29):
 *
 *   await this.prisma.client.$transaction(async (tx) => {
 *     const payable = await tx.payable.create({ ... });
 *     await this.audit.record(tx, { module: "finance.payable", action: "CREATE", ... });
 *     return payable;
 *   });
 */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(client: PrismaLike | undefined, input: RecordAuditEventInput): Promise<void> {
    const db = client ?? this.prisma.client;
    await db.auditEvent.create({
      data: {
        actorType: input.actorType,
        actorUserId: input.actorUserId,
        actorLabel: input.actorLabel,
        sessionId: input.sessionId,
        requestId: input.requestId,
        module: input.module,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        companyId: input.companyId,
        projectId: input.projectId,
        source: input.source,
        result: input.result,
        reason: input.reason,
        previousValues: input.previousValues as Prisma.InputJsonValue,
        newValues: input.newValues as Prisma.InputJsonValue,
        metadata: input.metadata as Prisma.InputJsonValue,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  }
}
