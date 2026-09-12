import { z } from "zod";
import { validateTaxId } from "@aritech/shared";

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

/**
 * Para componentes de alocação (juros, multa, desconto, retenção): ADR-007 §39
 * permite explicitamente valor zero para esses campos ("0.0000" tem
 * significado próprio, diferente de "não informado") — só não permite negativo.
 */
export const nonNegativeDecimalStringSchema = decimalStringSchema.refine(
  (value) => Number.parseFloat(value) >= 0,
  "O valor não pode ser negativo.",
);

export const uuidSchema = z.string().uuid();

/**
 * CPF ou CNPJ — opcional, mas quando informado precisa ter 11 (CPF) ou 14
 * (CNPJ) dígitos e passar no dígito verificador (packages/shared/br-documents).
 * O frontend já mascara/valida ao digitar; esta é a validação de verdade,
 * obrigatória no backend (ADR-004 §14).
 */
export const taxIdSchema = z
  .string()
  .optional()
  .refine(
    (value) => {
      if (!value) return true;
      const result = validateTaxId(value);
      return result.complete && result.valid;
    },
    {
      message: "CPF/CNPJ inválido. CPF tem 11 dígitos e CNPJ tem 14, com dígito verificador correto.",
    },
  );

export const isoDateSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Data inválida. Use ISO-8601, ex.: \"2026-09-08\".");

export const currencySchema = z.enum(["BRL", "USD", "EUR"]);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(25),
});
export type PaginationInput = z.infer<typeof paginationSchema>;
