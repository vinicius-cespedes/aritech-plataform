import { Injectable, NotFoundException } from "@nestjs/common";
import { DomainError } from "@aritech/shared";
import { CreateTransferInput } from "@aritech/validation";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../audit/audit.service";
import { PeriodsService } from "../periods/periods.service";

@Injectable()
export class TransfersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly periods: PeriodsService,
  ) {}

  list() {
    return this.prisma.client.financialTransfer.findMany({ orderBy: { createdAt: "desc" } });
  }

  async get(id: string) {
    const transfer = await this.prisma.client.financialTransfer.findUnique({ where: { id } });
    if (!transfer) throw new NotFoundException({ code: "NOT_FOUND", message: "Transferência não encontrada." });
    return transfer;
  }

  /**
   * FINANCIAL_MODEL §18 — transferência não gera receita/despesa; a
   * confirmação cria os dois lados (saída/entrada) de forma atômica.
   */
  async create(data: CreateTransferInput, actorUserId: string) {
    if (data.sourceAccountId === data.destinationAccountId) {
      throw new DomainError("TRANSFER_ACCOUNTS_MUST_DIFFER", "A conta de origem e destino devem ser diferentes.");
    }

    const transferDate = new Date(data.transferDate);
    await this.periods.assertCanModify(transferDate);

    const [source, destination] = await Promise.all([
      this.prisma.client.financialAccount.findUnique({ where: { id: data.sourceAccountId } }),
      this.prisma.client.financialAccount.findUnique({ where: { id: data.destinationAccountId } }),
    ]);
    if (!source || !destination) {
      throw new DomainError("NOT_FOUND", "Conta de origem ou destino não encontrada.");
    }

    const transfer = await this.prisma.client.$transaction(async (tx) => {
      const created = await tx.financialTransfer.create({
        data: {
          sourceAccountId: data.sourceAccountId,
          destinationAccountId: data.destinationAccountId,
          transferDate,
          amount: data.amount,
          currency: data.currency,
          feeAmount: data.feeAmount,
          reference: data.reference,
          status: "CONFIRMED",
          createdById: actorUserId,
        },
      });

      await this.audit.record(tx, {
        actorType: "USER",
        actorUserId,
        module: "finance.transfer",
        action: "CONFIRM",
        entityType: "FinancialTransfer",
        entityId: created.id,
        source: "WEB",
        result: "SUCCESS",
        newValues: created,
      });

      return created;
    });

    return transfer;
  }
}
