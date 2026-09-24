import { z } from "zod";
import { currencySchema, isoDateSchema, positiveDecimalStringSchema, uuidSchema } from "../common";

export const counterpartyTypeSchema = z.enum([
  "CUSTOMER",
  "SUPPLIER",
  "EMPLOYEE",
  "GOVERNMENT",
  "BANK",
  "PARTNER",
  "OTHER",
]);

export const payableSourceTypeSchema = z.enum([
  "PURCHASE_ORDER",
  "SUPPLIER_INVOICE",
  "CONTRACT",
  "PAYROLL",
  "TAX",
  "EXPENSE_REIMBURSEMENT",
  "LOAN",
  "RENT",
  "MANUAL_ENTRY",
  "OTHER",
]);

export const employeeObligationTypeSchema = z.enum([
  "SALARY",
  "SALARY_ADVANCE",
  "VACATION",
  "THIRTEENTH_SALARY",
  "REIMBURSEMENT",
  "BENEFIT",
  "SEVERANCE",
  "PRO_LABORE",
  "OTHER",
]);

/**
 * Criação de Conta a Pagar — docx §8 e FINANCIAL_MODEL §6-7.
 * As parcelas são geradas automaticamente a partir de `installmentsCount`,
 * `firstDueDate` e `installmentIntervalDays` (resíduo de centavos aplicado à
 * última parcela — ADR-007 §12).
 */
export const createPayableSchema = z
  .object({
    counterpartyType: counterpartyTypeSchema,
    supplierId: uuidSchema.optional(),
    employeeId: uuidSchema.optional(),
    employeeObligationType: employeeObligationTypeSchema.optional(),
    description: z.string().min(1),
    documentNumber: z.string().optional(),
    documentType: z.string().optional(),
    issueDate: isoDateSchema.optional(),
    competenceDate: isoDateSchema,
    originalAmount: positiveDecimalStringSchema,
    currency: currencySchema.default("BRL"),
    sourceType: payableSourceTypeSchema.default("MANUAL_ENTRY"),
    isDirectCost: z.boolean().default(false),
    projectId: uuidSchema.optional(),
    costCenterId: uuidSchema,
    managementAccountId: uuidSchema,
    contractId: uuidSchema.optional(),
    installmentsCount: z.number().int().min(1).default(1),
    firstDueDate: isoDateSchema,
    installmentIntervalDays: z.number().int().min(1).default(30),
  })
  .refine((data) => data.counterpartyType !== "SUPPLIER" || !!data.supplierId, {
    message: "supplierId é obrigatório quando counterpartyType = SUPPLIER.",
    path: ["supplierId"],
  })
  .refine((data) => data.counterpartyType !== "EMPLOYEE" || !!data.employeeId, {
    message: "employeeId é obrigatório quando counterpartyType = EMPLOYEE.",
    path: ["employeeId"],
  })
  .refine((data) => !data.isDirectCost || !!data.projectId, {
    message: "projectId é obrigatório para custos diretos — docx §8.",
    path: ["projectId"],
  });
export type CreatePayableInput = z.infer<typeof createPayableSchema>;

/**
 * Edição da classificação de uma Conta a Pagar (usada para revisar lançamentos
 * importados). Valores e parcelas não são editáveis aqui. `null` limpa o vínculo.
 */
export const updatePayableClassificationSchema = z.object({
  description: z.string().min(1).optional(),
  counterpartyType: counterpartyTypeSchema.optional(),
  supplierId: uuidSchema.nullable().optional(),
  employeeId: uuidSchema.nullable().optional(),
  costCenterId: uuidSchema.optional(),
  managementAccountId: uuidSchema.optional(),
  contractId: uuidSchema.nullable().optional(),
  projectId: uuidSchema.nullable().optional(),
});
export type UpdatePayableClassificationInput = z.infer<typeof updatePayableClassificationSchema>;

export const rejectPayableSchema = z.object({
  reason: z.string().min(1, "Justificativa é obrigatória para reprovação — docx §9."),
});
export type RejectPayableInput = z.infer<typeof rejectPayableSchema>;
