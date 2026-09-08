import { z } from "zod";

/**
 * String decimal na fronteira da API — ADR-007 §29-30.
 * Aceita "10000.25", "0", "-40.5"; rejeita "10.000,25", "R$ 10000,25", "abc".
 */
export const decimalStringSchema = z
  .string()
  .regex(/^-?\d+(\.\d+)?$/, "Valor monetário inválido. Use ponto decimal, ex.: \"10000.25\".");

export const positiveDecimalStringSchema = decimalStringSchema.refine(
  (value) => Number.parseFloat(value) > 0,
  "O valor deve ser maior que zero.",
);

export const uuidSchema = z.string().uuid();

export const isoDateSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Data inválida. Use ISO-8601, ex.: \"2026-09-08\".");

export const currencySchema = z.enum(["BRL", "USD", "EUR"]);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(25),
});
export type PaginationInput = z.infer<typeof paginationSchema>;
