import { z } from "zod";
import { isoDateSchema, positiveDecimalStringSchema, uuidSchema } from "../common";

export const contractStatusSchema = z.enum(["DRAFT", "ACTIVE", "SUSPENDED", "CLOSED"]);

/**
 * Contrato — vincula um cliente a uma linha de negócio. Ao criar, o sistema
 * gera o centro de resultado próprio do contrato (filho da linha de negócio
 * escolhida), o subcentro de custo de Produção e o projeto do contrato.
 */
export const createContractSchema = z.object({
  customerId: uuidSchema,
  code: z.string().min(1, "Informe o código/nome do contrato."),
  description: z.string().optional(),
  startDate: isoDateSchema.optional(),
  endDate: isoDateSchema.optional(),
  amount: positiveDecimalStringSchema.optional(),
  businessLineId: uuidSchema,
  status: contractStatusSchema.default("ACTIVE"),
});
export type CreateContractInput = z.infer<typeof createContractSchema>;

export const updateContractSchema = z.object({
  description: z.string().optional(),
  startDate: isoDateSchema.nullable().optional(),
  endDate: isoDateSchema.nullable().optional(),
  amount: positiveDecimalStringSchema.nullable().optional(),
  businessLineId: uuidSchema.optional(),
  status: contractStatusSchema.optional(),
});
export type UpdateContractInput = z.infer<typeof updateContractSchema>;
