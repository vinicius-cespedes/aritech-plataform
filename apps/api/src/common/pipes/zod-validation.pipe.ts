import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common";
import { ZodSchema } from "zod";

/**
 * Pipe de validação com Zod (ADR-002 §11 — "biblioteca de schemas compatível
 * com TypeScript"). Usado por decorador em cada controller:
 *
 *   @Body(new ZodValidationPipe(createPayableSchema)) body: CreatePayableInput
 */
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "Dados inválidos.",
        issues: result.error.issues,
      });
    }
    return result.data;
  }
}
