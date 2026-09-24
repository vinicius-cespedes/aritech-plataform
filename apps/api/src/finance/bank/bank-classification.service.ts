import { Injectable } from "@nestjs/common";
import { DomainError, Money } from "@aritech/shared";
import { ClassifyBankTransactionInput } from "@aritech/validation";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../audit/audit.service";
import { PeriodsService } from "../periods/periods.service";
import { ReconciliationService } from "./reconciliation.service";
import { AllocationService } from "../contracts/allocation.service";

/**
 * Classifica uma movimentação bancária importada como uma operação real da
 * empresa — a lacuna descrita em ADR-009 §47-48/§79: quando a movimentação
 * não corresponde a nenhum Payment/Receipt já existente (o caso comum logo
 * após a primeira importação de OFX), o usuário precisa poder dizer "isto é
 * um pagamento a este fornecedor, neste centro de custo" (ou o equivalente
 * para clientes/centro de resultado) em vez de só vincular a algo que já
 * existe (que é o papel de `ReconciliationService.createMatches`).
 *
 * Diferente do fluxo de sugestão/match manual, aqui o back-end cria a
 * operação interna (Payable+Payment ou Receivable+Receipt, já liquidados,
 * já que o dinheiro já entrou/saiu do banco) e conclui a conciliação em uma
 * única transação atômica.
 */
@Injectable()
export class BankClassificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly periods: PeriodsService,
    private readonly reconciliation: ReconciliationService,
    private readonly allocation: AllocationService,
  ) {}

  async classify(bankTransactionId: string, input: ClassifyBankTransactionInput, actorUserId: string) {
    const tx = await this.reconciliation.getTransaction(bankTransactionId);
    if (tx.reconciliationStatus === "RECONCILED") {
      throw new DomainError("BANK_TRANSACTION_ALREADY_MATCHED", "Esta movimentação já está totalmente conciliada.");
    }
    await this.periods.assertCanModify(tx.transactionDate);

    if (input.kind === "SUPPLIER_PAYMENT" && tx.direction !== "DEBIT") {
      throw new DomainError("VALIDATION_ERROR", "Classificação de pagamento a fornecedor exige uma movimentação de débito.");
    }
    if (input.kind === "CUSTOMER_RECEIPT" && tx.direction !== "CREDIT") {
      throw new DomainError("VALIDATION_ERROR", "Classificação de recebimento de cliente exige uma movimentação de crédito.");
    }

    const alreadyMatched = tx.matches.reduce((sum, m) => sum + Number(m.matchedAmount), 0);
    const remaining = Number(tx.amount) - alreadyMatched;
    const amount = Money.of(input.amount ?? remaining.toFixed(4), tx.currency);
    if (amount.toNumber() > remaining + 0.0001) {
      throw new DomainError(
        "BANK_TRANSACTION_MATCH_AMOUNT_EXCEEDED",
        "O valor da classificação excede o saldo não conciliado da movimentação.",
      );
    }

    const result = await this.prisma.client.$transaction(async (db) => {
      let paymentId: string | undefined;
      let receiptId: string | undefined;

      if (input.kind === "SUPPLIER_PAYMENT") {
        const managementAccount = await db.managementAccount.findUnique({ where: { id: input.managementAccountId } });
        if (!managementAccount || !managementAccount.allowsPosting) {
          throw new DomainError(
            "MANAGEMENT_ACCOUNT_NOT_POSTABLE",
            "A conta gerencial informada não existe ou não aceita lançamentos diretos (é sintética).",
          );
        }

        const costAllocation = await this.allocation.resolveCostAllocation(db, {
          costCenterId: input.costCenterId,
          contractId: input.contractId,
          projectId: input.projectId,
        });
        const payable = await db.payable.create({
          data: {
            counterpartyType: input.supplierId ? "SUPPLIER" : "OTHER",
            supplierId: input.supplierId,
            description: input.description,
            documentNumber: input.documentNumber,
            issueDate: tx.transactionDate,
            competenceDate: tx.transactionDate,
            originalAmount: amount.toApiString(),
            currency: tx.currency,
            status: "OPEN",
            sourceType: "MANUAL_ENTRY",
            costCenterId: costAllocation.costCenterId,
            contractId: costAllocation.contractId,
            projectId: costAllocation.projectId,
            managementAccountId: input.managementAccountId,
            createdById: actorUserId,
            installments: {
              create: [
                {
                  sequence: 1,
                  dueDate: tx.transactionDate,
                  originalAmount: amount.toApiString(),
                  openAmount: "0",
                  status: "SETTLED",
                },
              ],
            },
          },
          include: { installments: true },
        });
        await db.payable.update({ where: { id: payable.id }, data: { status: "SETTLED" } });

        const payment = await db.payment.create({
          data: {
            paymentDate: tx.transactionDate,
            amount: amount.toApiString(),
            currency: tx.currency,
            financialAccountId: tx.financialAccountId,
            paymentMethod: input.paymentMethod,
            reference: input.documentNumber,
            status: "RECONCILED",
            createdById: actorUserId,
          },
        });
        await db.paymentAllocation.create({
          data: {
            paymentId: payment.id,
            payableInstallmentId: payable.installments[0]!.id,
            principalAmount: amount.toApiString(),
            interestAmount: "0",
            penaltyAmount: "0",
            discountAmount: "0",
            withholdingAmount: "0",
            allocatedAmount: amount.toApiString(),
          },
        });
        paymentId = payment.id;

        await this.audit.record(db, {
          actorType: "USER",
          actorUserId,
          module: "finance.reconciliation",
          action: "CLASSIFY",
          entityType: "Payable",
          entityId: payable.id,
          source: "WEB",
          result: "SUCCESS",
          newValues: { fromBankTransactionId: bankTransactionId, paymentId: payment.id },
        });
      } else if (input.kind === "CUSTOMER_RECEIPT") {
        const managementAccount = await db.managementAccount.findUnique({ where: { id: input.managementAccountId } });
        if (!managementAccount || !managementAccount.allowsPosting) {
          throw new DomainError(
            "MANAGEMENT_ACCOUNT_NOT_POSTABLE",
            "A conta gerencial informada não existe ou não aceita lançamentos diretos (é sintética).",
          );
        }

        const receivableAllocation = await this.allocation.resolveReceivableAllocation(db, {
          customerId: input.customerId,
          contractId: input.contractId,
          projectId: input.projectId,
        });
        const receivable = await db.receivable.create({
          data: {
            customerId: input.customerId,
            description: input.description,
            documentNumber: input.documentNumber,
            issueDate: tx.transactionDate,
            competenceDate: tx.transactionDate,
            originalAmount: amount.toApiString(),
            currency: tx.currency,
            status: "OPEN",
            certaintyLevel: "COMMITTED",
            sourceType: "MANUAL_ENTRY",
            resultCenterId: receivableAllocation.resultCenterId,
            contractId: receivableAllocation.contractId,
            projectId: receivableAllocation.projectId,
            managementAccountId: input.managementAccountId,
            createdById: actorUserId,
            installments: {
              create: [
                {
                  sequence: 1,
                  dueDate: tx.transactionDate,
                  originalAmount: amount.toApiString(),
                  openAmount: "0",
                  status: "SETTLED",
                },
              ],
            },
          },
          include: { installments: true },
        });
        await db.receivable.update({ where: { id: receivable.id }, data: { status: "SETTLED" } });

        const receipt = await db.receipt.create({
          data: {
            receiptDate: tx.transactionDate,
            amount: amount.toApiString(),
            currency: tx.currency,
            financialAccountId: tx.financialAccountId,
            receiptMethod: input.receiptMethod,
            reference: input.documentNumber,
            status: "RECONCILED",
            createdById: actorUserId,
          },
        });
        await db.receiptAllocation.create({
          data: {
            receiptId: receipt.id,
            receivableInstallmentId: receivable.installments[0]!.id,
            principalAmount: amount.toApiString(),
            interestAmount: "0",
            penaltyAmount: "0",
            discountAmount: "0",
            withholdingAmount: "0",
            allocatedAmount: amount.toApiString(),
          },
        });
        receiptId = receipt.id;

        await this.audit.record(db, {
          actorType: "USER",
          actorUserId,
          module: "finance.reconciliation",
          action: "CLASSIFY",
          entityType: "Receivable",
          entityId: receivable.id,
          source: "WEB",
          result: "SUCCESS",
          newValues: { fromBankTransactionId: bankTransactionId, receiptId: receipt.id },
        });
      }

      const targetType = input.kind === "SUPPLIER_PAYMENT" ? "PAYMENT" : input.kind === "CUSTOMER_RECEIPT" ? "RECEIPT" : input.targetType;

      await db.reconciliationMatch.create({
        data: {
          bankTransactionId,
          targetType,
          paymentId,
          receiptId,
          matchedAmount: amount.toApiString(),
          matchType: "MANUAL",
          matchedById: actorUserId,
          criteria: input.kind === "OTHER" ? { note: input.note ?? null } : undefined,
        },
      });

      const newTotal = alreadyMatched + amount.toNumber();
      const newStatus = newTotal >= Number(tx.amount) - 0.0001 ? "RECONCILED" : "PARTIALLY_RECONCILED";
      const updatedTx = await db.bankTransaction.update({
        where: { id: bankTransactionId },
        data: { reconciliationStatus: newStatus },
      });

      await this.audit.record(db, {
        actorType: "USER",
        actorUserId,
        module: "finance.reconciliation",
        action: "CLASSIFY",
        entityType: "BankTransaction",
        entityId: bankTransactionId,
        source: "WEB",
        result: "SUCCESS",
        newValues: { kind: input.kind, amount: amount.toApiString() },
      });

      return updatedTx;
    });

    return this.reconciliation.getTransaction(result.id);
  }
}
