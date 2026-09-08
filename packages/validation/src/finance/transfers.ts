import { z } from "zod";
import { currencySchema, isoDateSchema, positiveDecimalStringSchema, uuidSchema } from "../common";

export const createTransferSchema = z
  .object({
    sourceAccountId: uuidSchema,
    destinationAccountId: uuidSchema,
    transferDate: isoDateSchema,
    amount: positiveDecimalStringSchema,
    currency: currencySchema.default("BRL"),
    feeAmount: positiveDecimalStringSchema.optional().default("0"),
    reference: z.string().optional(),
  })
  .refine((data) => data.sourceAccountId !== data.destinationAccountId, {
    message: "TRANSFER_ACCOUNTS_MUST_DIFFER",
    path: ["destinationAccountId"],
  });
export type CreateTransferInput = z.infer<typeof createTransferSchema>;
