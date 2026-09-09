import { createHash } from "node:crypto";
import { Injectable, NotFoundException } from "@nestjs/common";
import { DomainError } from "@aritech/shared";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../audit/audit.service";
import { parseOfx, OfxParseError } from "./parsers/ofx-parser";

@Injectable()
export class BankStatementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list(financialAccountId?: string) {
    return this.prisma.client.bankStatementImport.findMany({
      where: financialAccountId ? { financialAccountId } : undefined,
      orderBy: { createdAt: "desc" },
    });
  }

  async get(id: string) {
    const statement = await this.prisma.client.bankStatementImport.findUnique({
      where: { id },
      include: { transactions: true },
    });
    if (!statement) throw new NotFoundException({ code: "NOT_FOUND", message: "Importação não encontrada." });
    return statement;
  }

  /**
   * Importa um extrato OFX — ADR-009 §7-17.
   * Protegido em dois níveis de idempotência: hash do arquivo (§10-11) e
   * `externalId` (FITID) por conta (§69-70).
   */
  async importOfx(financialAccountId: string, fileName: string, fileContent: Buffer, actorUserId: string) {
    const account = await this.prisma.client.financialAccount.findUnique({ where: { id: financialAccountId } });
    if (!account) {
      throw new DomainError("NOT_FOUND", "Conta financeira não encontrada.");
    }

    const fileHash = createHash("sha256").update(fileContent).digest("hex");
    const existingImport = await this.prisma.client.bankStatementImport.findUnique({
      where: { financialAccountId_fileHash: { financialAccountId, fileHash } },
    });
    if (existingImport) {
      throw new DomainError(
        "BANK_STATEMENT_DUPLICATE",
        "Este arquivo já foi importado anteriormente para esta conta (mesmo hash).",
      );
    }

    let parsed;
    try {
      parsed = parseOfx(fileContent.toString("utf-8"));
    } catch (error) {
      if (error instanceof OfxParseError) {
        throw new DomainError("BANK_STATEMENT_INVALID_FORMAT", error.message);
      }
      throw error;
    }

    const statementImport = await this.prisma.client.bankStatementImport.create({
      data: {
        financialAccountId,
        source: "OFX_IMPORT",
        fileName,
        fileHash,
        periodStart: parsed.periodStart,
        periodEnd: parsed.periodEnd,
        status: "PROCESSING",
        totalRecords: parsed.transactions.length,
        createdById: actorUserId,
      },
    });

    let imported = 0;
    let duplicates = 0;
    let rejected = 0;

    // Cada transação é persistida individualmente (ADR-009 §67 — não é
    // necessário manter um arquivo inteiro dentro de uma única transação longa).
    for (const tx of parsed.transactions) {
      try {
        if (tx.fitId) {
          const existingTx = await this.prisma.client.bankTransaction.findUnique({
            where: { financialAccountId_externalId: { financialAccountId, externalId: tx.fitId } },
          });
          if (existingTx) {
            duplicates += 1;
            continue;
          }
        }

        await this.prisma.client.bankTransaction.create({
          data: {
            financialAccountId,
            externalId: tx.fitId,
            transactionDate: tx.transactionDate,
            postingDate: tx.postingDate,
            amount: tx.amount,
            direction: tx.direction,
            currency: account.currency,
            description: tx.description,
            documentNumber: tx.documentNumber,
            counterpartyName: tx.counterpartyName,
            bankReference: tx.bankReference,
            source: "OFX_IMPORT",
            status: "POSTED",
            reconciliationStatus: "UNRECONCILED",
            importBatchId: statementImport.id,
          },
        });
        imported += 1;
      } catch {
        rejected += 1;
      }
    }

    const finalStatus = rejected > 0 ? "COMPLETED_WITH_ERRORS" : "COMPLETED";
    const updated = await this.prisma.client.bankStatementImport.update({
      where: { id: statementImport.id },
      data: {
        status: finalStatus,
        importedRecords: imported,
        duplicateRecords: duplicates,
        rejectedRecords: rejected,
      },
      include: { transactions: true },
    });

    await this.audit.record(undefined, {
      actorType: "USER",
      actorUserId,
      module: "finance.bank",
      action: "IMPORT",
      entityType: "BankStatementImport",
      entityId: statementImport.id,
      source: "IMPORT",
      result: finalStatus === "COMPLETED" ? "SUCCESS" : "PARTIAL",
      metadata: { imported, duplicates, rejected, fileName },
    });

    return updated;
  }
}
