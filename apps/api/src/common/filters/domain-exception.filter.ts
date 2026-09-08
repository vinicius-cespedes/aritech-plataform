import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { DomainError } from "@aritech/shared";

/**
 * Converte DomainError (erros de negócio com código estável — FINANCIAL_MODEL §52)
 * em respostas HTTP estruturadas e previsíveis para o frontend.
 */
const STATUS_BY_CODE: Record<string, number> = {
  NOT_FOUND: HttpStatus.NOT_FOUND,
  UNAUTHENTICATED: HttpStatus.UNAUTHORIZED,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  VALIDATION_ERROR: HttpStatus.BAD_REQUEST,
};

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = STATUS_BY_CODE[exception.code] ?? HttpStatus.UNPROCESSABLE_ENTITY;

    response.status(status).json({
      statusCode: status,
      code: exception.code,
      message: exception.message,
      details: exception.details ?? null,
    });
  }
}
