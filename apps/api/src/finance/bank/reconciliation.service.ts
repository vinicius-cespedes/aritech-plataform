import { Injectable, NotFoundException } from "@nestjs/common";
import { DomainError, Money } from "@aritech/shared";
import { CreateReconciliationMatchesInput } from "@aritech/validation";
import { Prisma } from "@aritech/database";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../audit/audit.service";
import { PeriodsService } from "../periods/periods.service";
import { confidenceLevel, scoreCandidate } from "./reconciliation-matching.util";

const CANDIDATE_LOOKBACK = 200;

export interface ReconciliationSuggestion {
  targetType: "PAYMENT" | "RECEIPT";
  targetId: string;
  unmatchedAmount: string;
  confidenceScore: number;
  confidenceLevel: "HIGH" | "MEDIUM" | "LOW";
  criteria: string[];
}

@Injectable()
export class ReconciliationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly periods: PeriodsService,
  ) {}

  listTransactions(financialAccountId?: string, reconciliationStatus?: string) {
    return this.prisma.client.bankTransaction.findMany({
      where: {
        financialAccountId,
        reconciliationStatus: reconciliationStatus as never,
      },
      orderBy: { transactionDate: "desc" },
    });
  }

  async getTransaction(id: string) {
    const tx = await this.prisma.client.bankTransaction.findUnique({
      where: { id },
      include: { matches: { where: { status: "ACTIVE" } } },
    });
    if (!tx) throw new NotFoundException({ code: "NOT_FOUND", message: "Movimentação bancária não encontrada." });
    return tx;
  }

  private async unmatchedAmountFor(targetType: "PAYMENT" | "RECEIPT", targetId: string, totalAmount: number): Promise<number> {
    const matches = await this.prisma.client.reconciliationMatch.findMany({
      where: {
        status: "ACTIVE",
        ...(targetType === "PAYMENT" ? { paymentId: targetId } : { receiptId: targetId }),
      },
      select: { matchedAmount: true },
    });
    const matched = matches.reduce((sum, m) => sum + Number(m.matchedAmount), 0);
    return Math.max(0, totalAmount - matched);
  }

  /** ADR-009 §31-38 — gera sugestões de conciliação, sem confirmar automaticamente. */
  async suggestMatches(bankTransactionId: string): Promise<ReconciliationSuggestion[]> {
    const tx = await this.getTransaction(bankTransactionId);
    const bankAmount = Number(tx.amount);

    const suggestions: ReconciliationSuggestion[] = [];

    if (tx.direction === "DEBIT") {
      const payments = await this.prisma.client.payment.findMany({
        where: { financialAccountId: tx.financialAccountId, status: "CONFIRMED" },
        include: {
          allocations: { include: { payableInstallment: { include: { payable: { include: { supplier: true, employee: true } } } } } },
        },
        orderBy: { paymentDate: "desc" },
        take: CANDIDATE_LOOKBACK,
      });

      for (const payment of payments) {
        const unmatched = await this.unmatchedAmountFor("PAYMENT", payment.id, Number(payment.amount));
        if (unmatched <= 0) continue;

        const counterpartyName =
          payment.allocations[0]?.payableInstallment.payable.supplier?.name ??
          payment.allocations[0]?.payableInstallment.payable.employee?.name ??
          null;

        const { score, criteria } = scoreCandidate({
          targetAmount: unmatched,
          targetDate: payment.paymentDate,
          bankAmount,
          bankDate: tx.transactionDate,
          targetCounterpartyName: counterpartyName,
          bankCounterpartyName: tx.counterpartyName,
        });
        if (score > 0) {
          suggestions.push({
            targetType: "PAYMENT",
            targetId: payment.id,
            unmatchedAmount: unmatched.toFixed(4),
            confidenceScore: score,
            confidenceLevel: confidenceLevel(score),
            criteria,
          });
        }
      }
    } else {
      const receipts = await this.prisma.client.receipt.findMany({
        where: { financialAccountId: tx.financialAccountId, status: "CONFIRMED" },
        include: {
          allocations: { include: { receivableInstallment: { include: { receivable: { include: { customer: true } } } } } },
        },
        orderBy: { receiptDate: "desc" },
        take: CANDIDATE_LOOKBACK,
      });

      for (const receipt of receipts) {
        const unmatched = await this.unmatchedAmountFor("RECEIPT", receipt.id, Number(receipt.amount));
        if (unmatched <= 0) continue;

        const counterpartyName = receipt.allocations[0]?.receivableInstallment.receivable.customer.name ?? null;

        const { score, criteria } = scoreCandidate({
          targetAmount: unmatched,
          targetDate: receipt.receiptDate,
          bankAmount,
          bankDate: tx.transactionDate,
          targetCounterpartyName: counterpartyName,
          bankCounterpartyName: tx.counterpartyName,
        });
        if (score > 0) {
          suggestions.push({
            targetType: "RECEIPT",
            targetId: receipt.id,
            unmatchedAmount: unmatched.toFixed(4),
            confidenceScore: score,
            confidenceLevel: confidenceLevel(score),
            criteria,
          });
        }
      }
    }

    suggestions.sort((a, b) => b.confidenceScore - a.confidenceScore);

    if (suggestions.length > 0 && tx.reconciliationStatus === "UNRECONCILED") {
      await this.prisma.client.bankTransaction.update({
        where: { id: tx.id },
        data: { reconciliationStatus: "SUGGESTED" },
      });
    }

    return suggestions;
  }

  /**
   * Cria uma ou mais correspondências para a movimentação — ADR-009 §24-30/§77.
   * Suporta N:N (uma movimentação para várias operações, ou o inverso ao ser
   * chamado repetidas vezes para o mesmo Payment/Receipt a partir de
   * diferentes movimentações).
   */
  async createMatches(bankTransactionId: string, input: CreateReconciliationMatchesInput, actorUserId: string) {
    const tx = await this.getTransaction(bankTransactionId);
    if (tx.reconciliationStatus === "RECONCILED") {
      throw new DomainError("BANK_TRANSACTION_ALREADY_MATCHED", "Esta movimentação já está totalmente conciliada.");
    }
    await this.periods.assertCanModify(tx.transactionDate);

    const alreadyMatched = tx.matches.reduce((sum, m) => sum + Number(m.matchedAmount), 0);
    const requested = input.matches.reduce((sum, m) => sum + Number(m.matchedAmount), 0);
    if (alreadyMatched + requested > Number(tx.amount) + 0.0001) {
      throw new DomainError(
        "BANK_TRANSACTION_MATCH_AMOUNT_EXCEEDED",
        "A soma das alocações excede o valor da movimentação bancária.",
      );
    }

    const result = await this.prisma.client.$transaction(async (prismaTx) => {
      for (const match of input.matches) {
        if (match.targetType === "PAYMENT" && match.paymentId) {
          await prismaTx.reconciliationMatch.create({
            data: {
              bankTransactionId,
              targetType: "PAYMENT",
              paymentId: match.paymentId,
              matchedAmount: match.matchedAmount,
              matchType: "MANUAL",
              matchedById: actorUserId,
            },
          });
          await this.syncTargetStatus(prismaTx, "PAYMENT", match.paymentId);
        } else if (match.targetType === "RECEIPT" && match.receiptId) {
          await prismaTx.reconciliationMatch.create({
            data: {
              bankTransactionId,
              targetType: "RECEIPT",
              receiptId: match.receiptId,
              matchedAmount: match.matchedAmount,
              matchType: "MANUAL",
              matchedById: actorUserId,
            },
          });
          await this.syncTargetStatus(prismaTx, "RECEIPT", match.receiptId);
        } else {
          throw new DomainError("VALIDATION_ERROR", "targetType inválido ou id do alvo ausente.");
        }
      }

      const newTotal = alreadyMatched + requested;
      const newStatus =
        newTotal >= Number(tx.amount) - 0.0001 ? "RECONCILED" : newTotal > 0 ? "PARTIALLY_RECONCILED" : "UNRECONCILED";
      const updatedTx = await prismaTx.bankTransaction.update({
        where: { id: bankTransactionId },
        data: { reconciliationStatus: newStatus },
      });

      await this.audit.record(prismaTx, {
        actorType: "USER",
        actorUserId,
        module: "finance.reconciliation",
        action: "MATCH",
        entityType: "BankTransaction",
        entityId: bankTransactionId,
        source: "WEB",
        result: "SUCCESS",
        newValues: { matches: input.matches.length },
      });

      return updatedTx;
    });

    return this.getTransaction(result.id);
  }

  private async syncTargetStatus(
    tx: Prisma.TransactionClient,
    targetType: "PAYMENT" | "RECEIPT",
    targetId: string,
  ): Promise<void> {
    const matches = await tx.reconciliationMatch.findMany({
      where: { status: "ACTIVE", ...(targetType === "PAYMENT" ? { paymentId: targetId } : { receiptId: targetId }) },
    });
    const matchedTotal = matches.reduce((sum, m) => sum + Number(m.matchedAmount), 0);

    if (targetType === "PAYMENT") {
      const payment = await tx.payment.findUniqueOrThrow({ where: { id: targetId } });
      if (matchedTotal >= Number(payment.amount) - 0.0001) {
        await tx.payment.update({ where: { id: targetId }, data: { status: "RECONCILED" } });
      }
    } else {
      const receipt = await tx.receipt.findUniqueOrThrow({ where: { id: targetId } });
      if (matchedTotal >= Number(receipt.amount) - 0.0001) {
        await tx.receipt.update({ where: { id: targetId }, data: { status: "RECONCILED" } });
      }
    }
  }

  /** ADR-009 §56-58 — desfazer conciliação, bloqueado em período fechado. */
  async reverseMatch(matchId: string, reason: string, actorUserId: string) {
    const match = await this.prisma.client.reconciliationMatch.findUnique({
      where: { id: matchId },
      include: { bankTransaction: true },
    });
    if (!match) throw new NotFoundException({ code: "RECONCILIATION_MATCH_NOT_FOUND", message: "Correspondência não encontrada." });
    if (match.status === "REVERSED") {
      throw new DomainError("RECONCILIATION_REVERSE_NOT_ALLOWED", "Esta correspondência já foi desfeita.");
    }

    await this.periods.assertCanModify(match.bankTransaction.transactionDate);

    await this.prisma.client.$transaction(async (tx) => {
      await tx.reconciliationMatch.update({
        where: { id: matchId },
        data: { status: "REVERSED", reversedById: actorUserId, reversedAt: new Date(), reversalReason: reason },
      });

      const remaining = await tx.reconciliationMatch.findMany({
        where: { bankTransactionId: match.bankTransactionId, status: "ACTIVE" },
      });
      const remainingTotal = remaining.reduce((sum, m) => sum + Number(m.matchedAmount), 0);
      const bankTx = await tx.bankTransaction.findUniqueOrThrow({ where: { id: match.bankTransactionId } });
      const newStatus =
        remainingTotal >= Number(bankTx.amount) - 0.0001
          ? "RECONCILED"
          : remainingTotal > 0
            ? "PARTIALLY_RECONCILED"
            : "UNRECONCILED";
      await tx.bankTransaction.update({ where: { id: match.bankTransactionId }, data: { reconciliationStatus: newStatus } });

      if (match.targetType === "PAYMENT" && match.paymentId) {
        await tx.payment.update({ where: { id: match.paymentId }, data: { status: "CONFIRMED" } });
      } else if (match.targetType === "RECEIPT" && match.receiptId) {
        await tx.receipt.update({ where: { id: match.receiptId }, data: { status: "CONFIRMED" } });
      }

      await this.audit.record(tx, {
        actorType: "USER",
        actorUserId,
        module: "finance.reconciliation",
        action: "UNMATCH",
        entityType: "ReconciliationMatch",
        entityId: matchId,
        source: "WEB",
        result: "SUCCESS",
        reason,
      });
    });

    return this.getTransaction(match.bankTransactionId);
  }
}
