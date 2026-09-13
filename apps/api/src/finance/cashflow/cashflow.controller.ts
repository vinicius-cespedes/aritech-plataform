import { BadRequestException, Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CashFlowService } from "./cashflow.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../auth/guards/permissions.guard";
import { RequirePermissions } from "../../auth/decorators/require-permissions.decorator";

const DEFAULT_TIMESERIES_WINDOW_DAYS = 90;
const MAX_TIMESERIES_WINDOW_DAYS = 366;

function parseDateParam(value: string | undefined, fallback: Date): Date {
  if (!value) return fallback;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException({ code: "VALIDATION_ERROR", message: `Data inválida: "${value}". Use o formato AAAA-MM-DD.` });
  }
  return parsed;
}

@ApiTags("finance-cashflow")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("cashflow")
export class CashFlowController {
  constructor(private readonly service: CashFlowService) {}

  @RequirePermissions("financial.report.read")
  @Get("summary")
  summary() {
    return this.service.summary();
  }

  @RequirePermissions("financial.report.read")
  @Get("aging")
  aging() {
    return this.service.aging();
  }

  /** Fluxo de caixa diário — FINANCIAL_MODEL §40. Padrão: últimos 90 dias. */
  @RequirePermissions("financial.report.read")
  @Get("timeseries")
  timeseries(@Query("from") fromParam?: string, @Query("to") toParam?: string) {
    const today = new Date();
    const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const defaultFrom = new Date(todayUtc);
    defaultFrom.setUTCDate(defaultFrom.getUTCDate() - (DEFAULT_TIMESERIES_WINDOW_DAYS - 1));

    const from = parseDateParam(fromParam, defaultFrom);
    const to = parseDateParam(toParam, todayUtc);

    if (from.getTime() > to.getTime()) {
      throw new BadRequestException({ code: "VALIDATION_ERROR", message: "'from' não pode ser posterior a 'to'." });
    }
    const windowDays = Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;
    if (windowDays > MAX_TIMESERIES_WINDOW_DAYS) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: `O intervalo solicitado (${windowDays} dias) excede o máximo permitido (${MAX_TIMESERIES_WINDOW_DAYS} dias).`,
      });
    }

    return this.service.timeseries(from, to);
  }
}
