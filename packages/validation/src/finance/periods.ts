import { z } from "zod";

export const closePeriodSchema = z.object({
  acceptWarnings: z.boolean().default(false),
});
export type ClosePeriodInput = z.infer<typeof closePeriodSchema>;

export const reopenPeriodSchema = z.object({
  reason: z.string().min(1, "Justificativa é obrigatória para reabertura — ADR-008 §32."),
});
export type ReopenPeriodInput = z.infer<typeof reopenPeriodSchema>;

export const openPeriodSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
});
export type OpenPeriodInput = z.infer<typeof openPeriodSchema>;
