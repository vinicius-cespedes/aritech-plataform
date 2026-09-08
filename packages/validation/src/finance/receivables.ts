import { z } from "zod";
import { currencySchema, isoDateSchema, positiveDecimalStringSchema, uuidSchema } from "../common";

export const receivableSourceTypeSchema = z.enum([
  "CONTRACT",
  "BILLING_SCHEDULE",
  "MEASUREMENT",
  "SALES_ORDER",
  "SERVICE_INVOICE",
  "PRODUCT_INVOICE",
  "ADVANCE_REQUEST",
  "MANUAL_ENTRY",
  "OTHER",
]);

export const receivableCertaintyLevelSchema = z.enum(["COMMITTED", "FORECAST"]);

/** Criação de Conta a Receber — docx §11 e FINANCIAL_MODEL §10-11. */
export const createReceivableSchema = z.object({
  customerId: uuidSchema,
  description: z.string().min(1),
  documentNumber: z.string().optional(),
  documentType: z.string().optional(),
  issueDate: isoDateSchema.optional(),
  competenceDate: isoDateSchema,
  originalAmount: positiveDecimalStringSchema,
  currency: currencySchema.default("BRL"),
  certaintyLevel: receivableCertaintyLevelSchema.default("COMMITTED"),
  sourceType: receivableSourceTypeSchema.default("MANUAL_ENTRY"),
  projectId: uuidSchema.optional(),
  resultCenterId: uuidSchema.optional(),
  managementAccountId: uuidSchema,
  contractId: uuidSchema.optional(),
  installmentsCount: z.number().int().min(1).default(1),
  firstDueDate: isoDateSchema,
  installmentIntervalDays: z.number().int().min(1).default(30),
});
export type CreateReceivableInput = z.infer<typeof createReceivableSchema>;
