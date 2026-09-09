import { z } from "zod";
import { currencySchema, isoDateSchema, nonNegativeDecimalStringSchema, positiveDecimalStringSchema, uuidSchema } from "../common";

export const paymentMethodSchema = z.enum([
  "PIX",
  "BANK_TRANSFER",
  "BOLETO",
  "CREDIT_CARD",
  "DEBIT_CARD",
  "CASH",
  "DIRECT_DEBIT",
  "CHECK",
  "OTHER",
]);

/** Alocação do pagamento a uma parcela específica — FINANCIAL_MODEL §8-9. */
export const paymentAllocationInputSchema = z.object({
  payableInstallmentId: uuidSchema,
  principalAmount: positiveDecimalStringSchema,
  interestAmount: nonNegativeDecimalStringSchema.optional().default("0"),
  penaltyAmount: nonNegativeDecimalStringSchema.optional().default("0"),
  discountAmount: nonNegativeDecimalStringSchema.optional().default("0"),
  withholdingAmount: nonNegativeDecimalStringSchema.optional().default("0"),
});
export type PaymentAllocationInput = z.infer<typeof paymentAllocationInputSchema>;

export const createPaymentSchema = z.object({
  paymentDate: isoDateSchema,
  financialAccountId: uuidSchema,
  paymentMethod: paymentMethodSchema,
  currency: currencySchema.default("BRL"),
  reference: z.string().optional(),
  allocations: z.array(paymentAllocationInputSchema).min(1),
});
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export const reversePaymentSchema = z.object({
  reason: z.string().min(1, "Justificativa é obrigatória para estorno — FINANCIAL_MODEL §16."),
});
export type ReversePaymentInput = z.infer<typeof reversePaymentSchema>;
