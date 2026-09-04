import { createHash } from 'node:crypto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  BankReconciliationStatus,
  BankStatementImportStatus,
  BankStatementSource,
  BankTransactionDirection,
  BankTransactionSource,
  BankTransactionStatus,
  Prisma,
  ReconciliationMatchStatus,
  ReconciliationMatchType,
  ReconciliationStatus,
  ReconciliationTargetType,
  SettlementStatus,
  prisma,
} from '@aritech/database';
import {
  ConfirmPaymentMatchDto,
  ImportOfxDto,
  StartBankReconciliationDto,
} from '../presentation/dto/bank-reconciliation.dto';

type ParsedOfxTransaction = {
  externalId?: string;
  transactionDate: Date;
  amount: Prisma.Decimal;
  direction: BankTransactionDirection;
  description?: string;
  documentNumber?: string;
};

@Injectable()
export class BankReconciliationService {
  async importOfx(input: ImportOfxDto) {
    const account = await prisma.financialAccount.findUnique({ where: { id: input.financialAccountId } });
    if (!account) throw new NotFoundException('FINANCIAL_ACCOUNT_NOT_FOUND');
    if (!account.allowsReconciliation) throw new BadRequestException('ACCOUNT_DOES_NOT_ALLOW_RECONCILIATION');

    const fileHash = createHash('sha256').update(input.content).digest('hex');
    const previous = await prisma.bankStatementImport.findUnique({
      where: { financialAccountId_fileHash: { financialAccountId: input.financialAccountId, fileHash } },
    });
    if (previous) throw new BadRequestException('OFX_FILE_ALREADY_IMPORTED');

    const parsed = this.parseOfx(input.content);
    if (!parsed.length) throw new BadRequestException('OFX_WITHOUT_TRANSACTIONS');

    const externalIds = parsed.flatMap((transaction) => transaction.externalId ? [transaction.externalId] : []);
    const existing = externalIds.length
      ? await prisma.bankTransaction.findMany({
          where: { financialAccountId: input.financialAccountId, externalId: { in: externalIds } },
          select: { externalId: true },
        })
      : [];
    const existingIds = new Set(existing.flatMap((transaction) => transaction.externalId ? [transaction.externalId] : []));
    const imported = parsed.filter((transaction) => !transaction.externalId || !existingIds.has(transaction.externalId));

    const dates = parsed.map((transaction) => transaction.transactionDate.getTime());
    const periodStart = new Date(Math.min(...dates));
    const periodEnd = new Date(Math.max(...dates));

    return prisma.bankStatementImport.create({
      data: {
        financialAccountId: input.financialAccountId,
        source: BankStatementSource.OFX_IMPORT,
        fileName: input.fileName,
        fileHash,
        periodStart,
        periodEnd,
        status: BankStatementImportStatus.COMPLETED,
        totalRecords: parsed.length,
        importedRecords: imported.length,
        duplicateRecords: parsed.length - imported.length,
        rejectedRecords: 0,
        createdBy: input.createdBy,
        transactions: {
          create: imported.map((transaction) => ({
            financialAccount: { connect: { id: input.financialAccountId } },
            externalId: transaction.externalId,
            transactionDate: transaction.transactionDate,
            postingDate: transaction.transactionDate,
            amount: transaction.amount,
            direction: transaction.direction,
            currency: account.currency,
            description: transaction.description,
            documentNumber: transaction.documentNumber,
            source: BankTransactionSource.OFX_IMPORT,
            status: BankTransactionStatus.POSTED,
            reconciliationStatus: ReconciliationStatus.UNRECONCILED,
          })),
        },
      },
      include: { transactions: true },
    });
  }

  start(input: StartBankReconciliationDto) {
    return prisma.bankReconciliation.create({
      data: {
        financialAccountId: input.financialAccountId,
        statementPeriodStart: new Date(input.statementPeriodStart),
        statementPeriodEnd: new Date(input.statementPeriodEnd),
        status: BankReconciliationStatus.OPEN,
        startedBy: input.startedBy,
      },
    });
  }

  async suggestions(reconciliationId: string) {
    const reconciliation = await prisma.bankReconciliation.findUnique({ where: { id: reconciliationId } });
    if (!reconciliation) throw new NotFoundException('BANK_RECONCILIATION_NOT_FOUND');

    const from = new Date(reconciliation.statementPeriodStart);
    from.setUTCDate(from.getUTCDate() - 3);
    const to = new Date(reconciliation.statementPeriodEnd);
    to.setUTCDate(to.getUTCDate() + 3);

    const [transactions, payments] = await Promise.all([
      prisma.bankTransaction.findMany({
        where: {
          financialAccountId: reconciliation.financialAccountId,
          transactionDate: { gte: reconciliation.statementPeriodStart, lte: reconciliation.statementPeriodEnd },
          direction: BankTransactionDirection.DEBIT,
          status: BankTransactionStatus.POSTED,
          reconciliationStatus: { in: [ReconciliationStatus.UNRECONCILED, ReconciliationStatus.SUGGESTED] },
        },
        orderBy: { transactionDate: 'asc' },
      }),
      prisma.payment.findMany({
        where: {
          financialAccountId: reconciliation.financialAccountId,
          paymentDate: { gte: from, lte: to },
          status: SettlementStatus.CONFIRMED,
          reversesPaymentId: null,
        },
        orderBy: { paymentDate: 'asc' },
      }),
    ]);

    return transactions.map((transaction) => {
      const candidates = payments
        .filter((payment) => payment.amount.equals(transaction.amount))
        .map((payment) => ({ payment, score: this.scoreMatch(transaction.transactionDate, transaction.description, payment.paymentDate, payment.reference) }))
        .filter((candidate) => candidate.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      return {
        bankTransaction: transaction,
        candidates: candidates.map(({ payment, score }) => ({
          paymentId: payment.id,
          paymentDate: payment.paymentDate,
          amount: payment.amount,
          reference: payment.reference,
          confidenceScore: score,
        })),
      };
    });
  }

  async confirmPaymentMatch(reconciliationId: string, input: ConfirmPaymentMatchDto) {
    const [reconciliation, transaction, payment] = await Promise.all([
      prisma.bankReconciliation.findUnique({ where: { id: reconciliationId } }),
      prisma.bankTransaction.findUnique({ where: { id: input.bankTransactionId } }),
      prisma.payment.findUnique({ where: { id: input.paymentId } }),
    ]);
    if (!reconciliation) throw new NotFoundException('BANK_RECONCILIATION_NOT_FOUND');
    if (!transaction) throw new NotFoundException('BANK_TRANSACTION_NOT_FOUND');
    if (!payment) throw new NotFoundException('PAYMENT_NOT_FOUND');
    if (transaction.financialAccountId !== reconciliation.financialAccountId || payment.financialAccountId !== reconciliation.financialAccountId) {
      throw new BadRequestException('RECONCILIATION_ACCOUNT_MISMATCH');
    }
    if (transaction.direction !== BankTransactionDirection.DEBIT) throw new BadRequestException('PAYMENT_REQUIRES_DEBIT_TRANSACTION');
    if (transaction.reconciliationStatus === ReconciliationStatus.RECONCILED) throw new BadRequestException('BANK_TRANSACTION_ALREADY_RECONCILED');
    if (payment.status !== SettlementStatus.CONFIRMED) throw new BadRequestException('PAYMENT_NOT_AVAILABLE_FOR_RECONCILIATION');
    if (!payment.amount.equals(transaction.amount)) throw new BadRequestException('PAYMENT_AND_BANK_TRANSACTION_AMOUNT_MISMATCH');

    const score = this.scoreMatch(transaction.transactionDate, transaction.description, payment.paymentDate, payment.reference);
    return prisma.$transaction(async (tx) => {
      const match = await tx.reconciliationMatch.create({
        data: {
          reconciliationId,
          bankTransactionId: transaction.id,
          targetType: ReconciliationTargetType.PAYMENT,
          paymentId: payment.id,
          matchedAmount: transaction.amount,
          matchType: ReconciliationMatchType.MANUAL,
          confidenceScore: new Prisma.Decimal(score),
          criteria: { humanConfirmed: true, notes: input.notes ?? null },
          status: ReconciliationMatchStatus.ACTIVE,
          matchedBy: input.matchedBy,
        },
      });

      await tx.bankTransaction.update({
        where: { id: transaction.id },
        data: { reconciliationStatus: ReconciliationStatus.RECONCILED },
      });
      await tx.payment.update({ where: { id: payment.id }, data: { status: SettlementStatus.RECONCILED } });
      await tx.bankReconciliation.update({
        where: { id: reconciliationId },
        data: { status: BankReconciliationStatus.IN_PROGRESS },
      });
      return match;
    });
  }

  private parseOfx(content: string): ParsedOfxTransaction[] {
    const normalized = content.replace(/\r/g, '');
    const blocks = normalized.split(/<STMTTRN>/i).slice(1);
    return blocks.flatMap((rawBlock) => {
      const block = rawBlock.split(/<\/STMTTRN>|(?=<STMTTRN>)|<\/BANKTRANLIST>/i)[0];
      const amountRaw = this.readTag(block, 'TRNAMT');
      const dateRaw = this.readTag(block, 'DTPOSTED');
      if (!amountRaw || !dateRaw) return [];

      const signedAmount = new Prisma.Decimal(amountRaw.replace(',', '.'));
      const direction = signedAmount.lessThan(0) ? BankTransactionDirection.DEBIT : BankTransactionDirection.CREDIT;
      const name = this.readTag(block, 'NAME');
      const memo = this.readTag(block, 'MEMO');
      const description = [name, memo].filter(Boolean).join(' - ') || undefined;

      return [{
        externalId: this.readTag(block, 'FITID'),
        transactionDate: this.parseOfxDate(dateRaw),
        amount: signedAmount.abs(),
        direction,
        description,
        documentNumber: this.readTag(block, 'CHECKNUM'),
      }];
    });
  }

  private readTag(block: string, tag: string) {
    const match = block.match(new RegExp(`<${tag}>([^<\\n]+)`, 'i'));
    return match?.[1]?.trim();
  }

  private parseOfxDate(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length !== 8) throw new BadRequestException('INVALID_OFX_DATE');
    return new Date(`${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}T00:00:00.000Z`);
  }

  private scoreMatch(transactionDate: Date, description: string | null, paymentDate: Date, reference: string | null) {
    const dayMs = 86_400_000;
    const distance = Math.round(Math.abs(transactionDate.getTime() - paymentDate.getTime()) / dayMs);
    if (distance > 3) return 0;
    let score = distance === 0 ? 90 : distance === 1 ? 85 : 80;
    if (description && reference) {
      const a = description.toLocaleLowerCase('pt-BR');
      const b = reference.toLocaleLowerCase('pt-BR');
      if (a.includes(b) || b.includes(a)) score += 10;
    }
    return Math.min(score, 100);
  }
}
