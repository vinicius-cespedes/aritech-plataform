import { z } from "zod";
import { currencySchema, decimalStringSchema } from "../common";

export const financialAccountTypeSchema = z.enum([
  "CHECKING",
  "SAVINGS",
  "CASH",
  "INVESTMENT",
  "PAYMENT",
  "DIGITAL_WALLET",
  "INTERNATIONAL",
  "OTHER",
]);

export const createFinancialAccountSchema = z.object({
  name: z.string().min(1),
  type: financialAccountTypeSchema,
  institutionName: z.string().optional(),
  bankCode: z.string().optional(),
  branch: z.string().optional(),
  accountNumber: z.string().optional(),
  accountDigit: z.string().optional(),
  currency: currencySchema.default("BRL"),
  openingBalance: decimalStringSchema.default("0"),
  openingBalanceDate: z.string().optional(),
  allowsReconciliation: z.boolean().default(true),
});
export type CreateFinancialAccountInput = z.infer<typeof createFinancialAccountSchema>;

export const managementAccountClassificationSchema = z.enum([
  "REVENUE",
  "TAX_DEDUCTION",
  "DIRECT_COST",
  "INDIRECT_COST",
  "OPERATING_EXPENSE",
  "FINANCIAL_INCOME",
  "FINANCIAL_EXPENSE",
  "INVESTMENT",
  "FINANCING",
  "EQUITY",
  "TRANSFER",
  "OTHER",
]);

export const createManagementAccountSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  parentId: z.string().uuid().optional(),
  nature: z.enum(["DEBIT", "CREDIT", "NEUTRAL"]),
  classification: managementAccountClassificationSchema,
  dreGroup: z.string().optional(),
  cashFlowGroup: z.string().optional(),
  allowsPosting: z.boolean().default(true),
});
export type CreateManagementAccountInput = z.infer<typeof createManagementAccountSchema>;

export const createCostCenterSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  parentId: z.string().uuid().optional(),
});
export type CreateCostCenterInput = z.infer<typeof createCostCenterSchema>;

export const createResultCenterSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  parentId: z.string().uuid().optional(),
});
export type CreateResultCenterInput = z.infer<typeof createResultCenterSchema>;
