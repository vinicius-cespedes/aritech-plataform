import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { DomainError } from "@aritech/shared";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../audit/audit.service";

export interface PeriodValidationIssue {
  code: string;
  count: number;
  amount?: string;
}

export interface PeriodValidationResult {
  canClose: boolean;
  blockingIssues: PeriodValidationIssue[];
  warnings: PeriodValidationIssue[];
}

/**
 * Política de fechamento de período — ADR-008.
 * Todo comando que grava um lançamento com `competenceDate` deve chamar
 * `assertCanModify(competenceDate)` ANTES de persistir (ADR-008 §84).
 */
@Injectable()
export class PeriodsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  private periodBounds(year: number, month: number): { startDate: Date; endDate: Date } {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    return { startDate, endDate };
  }

  /** Busca (ou cria, já OPEN) o período mensal correspondente a uma data de competência. */
  async findOrCreateForDate(date: Date, legalEntityId: string | null = null) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const existing = await this.prisma.client.financialPeriod.findUnique({
      where: { legalEntityId_year_month: { legalEntityId, year, month } },
    });
    if (existing) return existing;

    const { startDate, endDate } = this.periodBounds(year, month);
    return this.prisma.client.financialPeriod.create({
      data: { legalEntityId, year, month, startDate, endDate },
    });
  }

  /** ADR-008 §3/§84 — bloqueia gravações com competência em período CLOSED/CLOSING. */
  async assertCanModify(competenceDate: Date, legalEntityId: string | null = null): Promise<void> {
    const period = await this.findOrCreateForDate(competenceDate, legalEntityId);
    if (period.status === "CLOSED") {
      throw new DomainError(
        "FINANCIAL_PERIOD_CLOSED",
        `O período ${period.month}/${period.year} está fechado. Reabertura é necessária para alterar lançamentos com esta competência.`,
      );
    }
    if (period.status === "CLOSING") {
      throw new DomainError(
        "FINANCIAL_PERIOD_CLOSING",
        `O período ${period.month}/${period.year} está em processo de fechamento.`,
      );
    }
  }

  list() {
    return this.prisma.client.financialPeriod.findMany({ orderBy: [{ year: "desc" }, { month: "desc" }] });
  }

  async get(id: string) {
    const period = await this.prisma.client.financialPeriod.findUnique({
      where: { id },
      include: { closings: { orderBy: { version: "desc" } } },
    });
    if (!period) throw new NotFoundException({ code: "NOT_FOUND", message: "Período não encontrado." });
    return period;
  }

  /** ADR-008 §15-21 — validações classificadas em BLOCKING e WARNING. */
  async validate(id: string): Promise<PeriodValidationResult> {
    const period = await this.get(id);
    const blockingIssues: PeriodValidationIssue[] = [];
    const warnings: PeriodValidationIssue[] = [];

    const pendingApprovals = await this.prisma.client.payable.count({
      where: {
        status: "PENDING_APPROVAL",
        competenceDate: { gte: period.startDate, lte: period.endDate },
      },
    });
    if (pendingApprovals > 0) {
      blockingIssues.push({ code: "PAYABLE_PENDING_APPROVAL", count: pendingApprovals });
    }

    const unreconciled = await this.prisma.client.bankTransaction.findMany({
      where: {
        reconciliationStatus: { in: ["UNRECONCILED", "SUGGESTED", "PARTIALLY_RECONCILED"] },
        transactionDate: { gte: period.startDate, lte: period.endDate },
      },
      select: { amount: true },
    });
    if (unreconciled.length > 0) {
      const total = unreconciled.reduce((sum, tx) => sum + Number(tx.amount), 0);
      warnings.push({ code: "UNRECONCILED_BANK_TRANSACTION", count: unreconciled.length, amount: total.toFixed(4) });
    }

    return { canClose: blockingIssues.length === 0, blockingIssues, warnings };
  }

  /** ADR-008 §12 — fluxo OPEN → CLOSING → validações → CLOSED. */
  async close(id: string, acceptWarnings: boolean, actorUserId: string) {
    const period = await this.get(id);
    if (period.status === "CLOSED") {
      throw new DomainError("FINANCIAL_PERIOD_ALREADY_CLOSED", "Este período já está fechado.");
    }

    await this.prisma.client.financialPeriod.update({ where: { id }, data: { status: "CLOSING" } });
    await this.audit.record(undefined, {
      actorType: "USER",
      actorUserId,
      module: "finance.period",
      action: "CLOSING_STARTED",
      entityType: "FinancialPeriod",
      entityId: id,
      source: "WEB",
      result: "SUCCESS",
    });

    const validation = await this.validate(id);
    if (!validation.canClose) {
      await this.prisma.client.financialPeriod.update({ where: { id }, data: { status: period.status } });
      throw new DomainError(
        "FINANCIAL_PERIOD_HAS_BLOCKING_ISSUES",
        "Existem pendências que impedem o fechamento do período.",
        { blockingIssues: validation.blockingIssues },
      );
    }
    if (validation.warnings.length > 0 && !acceptWarnings) {
      await this.prisma.client.financialPeriod.update({ where: { id }, data: { status: period.status } });
      throw new ConflictException({
        code: "VALIDATION_ERROR",
        message: "Existem avisos pendentes. Confirme com acceptWarnings=true para prosseguir.",
        warnings: validation.warnings,
      });
    }

    const lastClosing = await this.prisma.client.financialPeriodClosing.findFirst({
      where: { financialPeriodId: id },
      orderBy: { version: "desc" },
    });
    const nextVersion = (lastClosing?.version ?? 0) + 1;

    const [, closing] = await this.prisma.client.$transaction([
      this.prisma.client.financialPeriod.update({
        where: { id },
        data: { status: "CLOSED", closedAt: new Date(), closedById: actorUserId },
      }),
      this.prisma.client.financialPeriodClosing.create({
        data: {
          financialPeriodId: id,
          version: nextVersion,
          closedById: actorUserId,
          status: "CLOSED",
          blockingIssues: validation.blockingIssues,
          warnings: validation.warnings,
          previousClosingId: lastClosing?.id,
        },
      }),
    ]);

    await this.audit.record(undefined, {
      actorType: "USER",
      actorUserId,
      module: "finance.period",
      action: "CLOSED",
      entityType: "FinancialPeriod",
      entityId: id,
      source: "WEB",
      result: "SUCCESS",
      metadata: { version: nextVersion, warnings: validation.warnings },
    });

    return this.get(id);
  }

  /** ADR-008 §31-34 — reabertura explícita, com justificativa obrigatória. */
  async reopen(id: string, reason: string, actorUserId: string) {
    const period = await this.get(id);
    if (period.status !== "CLOSED") {
      throw new DomainError("FINANCIAL_PERIOD_ALREADY_CLOSED", "Somente períodos fechados podem ser reabertos.");
    }

    const updated = await this.prisma.client.financialPeriod.update({
      where: { id },
      data: {
        status: "REOPENED",
        reopenedAt: new Date(),
        reopenedById: actorUserId,
        reopeningReason: reason,
      },
    });

    await this.audit.record(undefined, {
      actorType: "USER",
      actorUserId,
      module: "finance.period",
      action: "REOPENED",
      entityType: "FinancialPeriod",
      entityId: id,
      source: "WEB",
      result: "SUCCESS",
      reason,
    });

    return updated;
  }
}
