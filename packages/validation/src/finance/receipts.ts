import { z } from "zod";
import { currencySchema, isoDateSchema, positiveDecimalStringSchema, uuidSchema } from "../common";
import { paymentMethodSchema } from "./payments";

export const receiptAllocationInputSchema = z.object({
  receivableInstallmentId: uuidSchema,
  principalAmount: positiveDecimalStringSchema,
  interestAmount: positiveDecimalStringSchema.optional().default("0"),
  penaltyAmount: positiveDecimalStringSchema.optional().default("0"),
  discountAmount: positiveDecimalStringSchema.optional().default("0"),
  withholdingAmount: positiveDecimalStringSchema.optional().default("0"),
});
export type ReceiptAllocationInput = z.infer<typeof receiptAllocationInputSchema>;

export const createReceiptSchema = z.object({
  receiptDate: isoDateSchema,
  financialAccountId: uuidSchema,
  receiptMethod: paymentMethodSchema,
  currency: currencySchema.default("BRL"),
  reference: z.string().optional(),
  allocations: z.array(receiptAllocationInputSchema).min(1),
});
export type CreateReceiptInput = z.infer<typeof createReceiptSchema>;

export const reverseReceiptSchema = z.object({
  reason: z.string().min(1, "Justificativa é obrigatória para estorno — FINANCIAL_MODEL §16."),
});
export type ReverseReceiptInput = z.infer<typeof reverseReceiptSchema>;
