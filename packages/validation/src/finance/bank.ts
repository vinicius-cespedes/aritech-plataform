import { z } from "zod";
import { positiveDecimalStringSchema, uuidSchema } from "../common";
import { paymentMethodSchema } from "./payments";

export const reconciliationTargetTypeSchema = z.enum([
  "PAYMENT",
  "RECEIPT",
  "TRANSFER",
  "BANK_FEE",
  "FINANCIAL_INCOME",
  "ADVANCE",
  "OTHER",
]);

/** Um vínculo dentro de uma criação de match — ADR-009 §77 (suporta N:N). */
export const reconciliationMatchInputSchema = z.object({
  targetType: reconciliationTargetTypeSchema,
  paymentId: uuidSchema.optional(),
  receiptId: uuidSchema.optional(),
  matchedAmount: positiveDecimalStringSchema,
});
export type ReconciliationMatchInput = z.infer<typeof reconciliationMatchInputSchema>;

export const createReconciliationMatchesSchema = z.object({
  matches: z.array(reconciliationMatchInputSchema).min(1),
});
export type CreateReconciliationMatchesInput = z.infer<typeof createReconciliationMatchesSchema>;

export const reverseReconciliationMatchSchema = z.object({
  reason: z.string().min(1, "Justificativa é obrigatória para desfazer conciliação — ADR-009 §56."),
});
export type ReverseReconciliationMatchInput = z.infer<typeof reverseReconciliationMatchSchema>;

/**
 * Classificação de movimentação bancária sem operação interna correspondente
 * — ADR-009 §47-48/§79 ("criar classificação"). Diferente de
 * `createReconciliationMatchesSchema` (que vincula a um Payment/Receipt já
 * existente), aqui o back-end cria a operação a partir da movimentação:
 *
 * - SUPPLIER_PAYMENT: cria Payable (já aprovada) + Payment liquidado,
 *   vinculados a fornecedor/centro de custo/conta gerencial — só para DEBIT.
 * - CUSTOMER_RECEIPT: cria Receivable + Receipt liquidado, vinculados a
 *   cliente/centro de resultado/conta gerencial — só para CREDIT.
 * - OTHER: classificação leve (sem Payable/Receivable) para os casos do
 *   ADR-009 §25 que não representam operação com fornecedor/cliente
 *   (tarifa, rendimento, transferência, adiantamento, diverso).
 */
export const classifyBankTransactionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("SUPPLIER_PAYMENT"),
    supplierId: uuidSchema.optional(),
    costCenterId: uuidSchema,
    // Obrigatório quando o centro de custo é de Produção (validado no serviço).
    contractId: uuidSchema.optional(),
    projectId: uuidSchema.optional(),
    managementAccountId: uuidSchema,
    description: z.string().min(1),
    documentNumber: z.string().optional(),
    paymentMethod: paymentMethodSchema.default("BANK_TRANSFER"),
    amount: positiveDecimalStringSchema.optional(),
  }),
  z.object({
    kind: z.literal("CUSTOMER_RECEIPT"),
    customerId: uuidSchema,
    contractId: uuidSchema,
    projectId: uuidSchema.optional(),
    managementAccountId: uuidSchema,
    description: z.string().min(1),
    documentNumber: z.string().optional(),
    receiptMethod: paymentMethodSchema.default("BANK_TRANSFER"),
    amount: positiveDecimalStringSchema.optional(),
  }),
  z.object({
    kind: z.literal("OTHER"),
    targetType: z.enum(["TRANSFER", "BANK_FEE", "FINANCIAL_INCOME", "ADVANCE", "OTHER"]),
    note: z.string().optional(),
    amount: positiveDecimalStringSchema.optional(),
  }),
]);
export type ClassifyBankTransactionInput = z.infer<typeof classifyBankTransactionSchema>;
