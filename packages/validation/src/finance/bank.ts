import { z } from "zod";
import { positiveDecimalStringSchema, uuidSchema } from "../common";

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
